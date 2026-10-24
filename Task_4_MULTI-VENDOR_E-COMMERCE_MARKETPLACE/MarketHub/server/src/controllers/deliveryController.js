import prisma from '../config/db.js';

export const getDeliveryOrders = async (req, res, next) => {
  try {
    const deliveryPartner = req.user.deliveryPartner;
    if (!deliveryPartner) {
      return res.status(403).json({ success: false, message: 'Delivery partner profile not found' });
    }

    const { status } = req.query;
    const where = { deliveryPartnerId: deliveryPartner.id };
    if (status) where.status = status;

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            items: {
              include: {
                product: { select: { id: true, name: true, images: { take: 1 } } },
              },
            },
            payment: { select: { method: true, status: true, amount: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute stats
    const totalAssigned = deliveries.length;
    const active = deliveries.filter((d) => ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(d.status)).length;
    const completed = deliveries.filter((d) => d.status === 'DELIVERED').length;

    res.status(200).json({
      success: true,
      data: deliveries,
      stats: {
        totalAssigned,
        active,
        completed,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params; // deliveryId or orderId
    const { status, notes } = req.body;
    const deliveryPartner = req.user.deliveryPartner;

    const validStatuses = ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery status' });
    }

    const delivery = await prisma.delivery.findFirst({
      where: {
        OR: [{ id }, { orderId: id }],
        deliveryPartnerId: deliveryPartner.id,
      },
      include: { order: true },
    });

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery assignment not found' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update delivery
      await tx.delivery.update({
        where: { id: delivery.id },
        data: {
          status,
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(notes && { deliveryNotes: notes }),
        },
      });

      // 2. Sync order status
      let orderStatus;
      if (status === 'PICKED_UP') orderStatus = 'PROCESSING';
      else if (status === 'OUT_FOR_DELIVERY') orderStatus = 'OUT_FOR_DELIVERY';
      else if (status === 'DELIVERED') orderStatus = 'DELIVERED';

      if (orderStatus) {
        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: orderStatus },
        });

        await tx.vendorOrder.updateMany({
          where: { orderId: delivery.orderId },
          data: { status: orderStatus },
        });
      }

      // 3. If delivered and payment was COD, mark payment as PAID
      if (status === 'DELIVERED') {
        await tx.payment.updateMany({
          where: { orderId: delivery.orderId, method: 'COD' },
          data: { status: 'PAID' },
        });
      }

      // 4. Notify customer
      await tx.notification.create({
        data: {
          userId: delivery.order.userId,
          title: `Delivery Update: ${status.replace(/_/g, ' ')}`,
          message: `Your package for Order #${delivery.order.orderNumber} is now ${status.replace(/_/g, ' ').toLowerCase()}.`,
          type: 'DELIVERY',
          link: `/orders/${delivery.orderId}`,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};
