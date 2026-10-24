import prisma from '../config/db.js';

export const createOrder = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      paymentMethod = 'COD',
      promoCode,
      notes,
    } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required.',
      });
    }

    // Get customer's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: true,
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checkout.',
      });
    }

    // Verify stock for all items
    for (const item of cart.items) {
      const inv = item.product.inventory;
      if (!inv || inv.availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${item.product.name}". Available: ${inv?.availableStock || 0}`,
        });
      }
    }

    // Calculate subtotal & group items by vendor
    let subtotal = 0;
    let totalDiscount = 0;
    const vendorGroups = {};

    for (const item of cart.items) {
      const p = item.product;
      const unitPrice = p.price;
      const discountPct = p.discount || 0;
      const discountedPrice = unitPrice * (1 - discountPct / 100);
      const itemSub = unitPrice * item.quantity;
      const itemDisc = (unitPrice - discountedPrice) * item.quantity;
      const itemTot = discountedPrice * item.quantity;

      subtotal += itemSub;
      totalDiscount += itemDisc;

      const vId = p.vendorId;
      if (!vendorGroups[vId]) {
        vendorGroups[vId] = {
          vendor: p.vendor,
          items: [],
          subtotal: 0,
        };
      }
      vendorGroups[vId].items.push({
        productId: p.id,
        quantity: item.quantity,
        unitPrice,
        discount: itemDisc,
        totalPrice: itemTot,
      });
      vendorGroups[vId].subtotal += itemTot;
    }

    // Promo code validation
    let promoDiscount = 0;
    let appliedPromotion = null;

    if (promoCode) {
      appliedPromotion = await prisma.promotion.findFirst({
        where: {
          code: promoCode.toUpperCase().trim(),
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      if (appliedPromotion && subtotal >= appliedPromotion.minOrder) {
        if (appliedPromotion.discountType === 'PERCENTAGE') {
          promoDiscount = (subtotal * appliedPromotion.discountValue) / 100;
          if (appliedPromotion.maxDiscount && promoDiscount > appliedPromotion.maxDiscount) {
            promoDiscount = appliedPromotion.maxDiscount;
          }
        } else {
          promoDiscount = appliedPromotion.discountValue;
        }
      }
    }

    const totalDiscountCombined = +(totalDiscount + promoDiscount).toFixed(2);
    const tax = +(subtotal * 0.05).toFixed(2);
    const shippingFee = subtotal > 1000 ? 0 : 50;
    const grandTotal = Math.max(0, +(subtotal - totalDiscountCombined + tax + shippingFee).toFixed(2));

    const orderNumber = `MH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Pick an available delivery partner to assign
    const availablePartner = await prisma.deliveryPartner.findFirst({
      where: { isAvailable: true },
    });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Address record snapshot or link
      const address = await tx.address.create({
        data: {
          userId: req.user.id,
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone || req.user.phone || '',
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state || '',
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country || 'India',
        },
      });

      // 2. Create main parent Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user.id,
          addressId: address.id,
          shippingAddress,
          subtotal,
          tax,
          shippingFee,
          discount: totalDiscountCombined,
          grandTotal,
          status: 'PLACED',
        },
      });

      // 3. Create VendorOrders and OrderItems
      for (const [vendorId, group] of Object.entries(vendorGroups)) {
        const vendorCommRate = group.vendor.commissionRate || 10.0;
        const commAmount = +((group.subtotal * vendorCommRate) / 100).toFixed(2);
        const netEarnings = +(group.subtotal - commAmount).toFixed(2);

        const vendorOrder = await tx.vendorOrder.create({
          data: {
            orderId: order.id,
            vendorId,
            subtotal: group.subtotal,
            commissionAmount: commAmount,
            netEarnings,
            status: 'PLACED',
          },
        });

        // Create Commission record
        await tx.commission.create({
          data: {
            vendorId,
            vendorOrderId: vendorOrder.id,
            ratePercent: vendorCommRate,
            orderTotal: group.subtotal,
            commissionFee: commAmount,
            netPayout: netEarnings,
            isSettled: false,
          },
        });

        // Create order items
        for (const it of group.items) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              vendorOrderId: vendorOrder.id,
              productId: it.productId,
              vendorId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              discount: it.discount,
              totalPrice: it.totalPrice,
            },
          });

          // Decrement stock
          const curInv = await tx.inventory.findUnique({
            where: { productId: it.productId },
          });
          if (curInv) {
            const newCurStock = Math.max(0, curInv.currentStock - it.quantity);
            const newAvail = Math.max(0, curInv.availableStock - it.quantity);
            let newStatus = 'IN_STOCK';
            if (newAvail <= 0) newStatus = 'OUT_OF_STOCK';
            else if (newAvail <= curInv.lowStockThreshold) newStatus = 'LOW_STOCK';

            await tx.inventory.update({
              where: { productId: it.productId },
              data: {
                currentStock: newCurStock,
                availableStock: newAvail,
                status: newStatus,
              },
            });

            // If stock dropped to low stock, notify vendor
            if (newStatus === 'LOW_STOCK' || newStatus === 'OUT_OF_STOCK') {
              const prod = await tx.product.findUnique({ where: { id: it.productId } });
              await tx.notification.create({
                data: {
                  userId: group.vendor.userId,
                  title: 'Low Stock Alert',
                  message: `Product "${prod?.name}" has only ${newAvail} units remaining!`,
                  type: 'INVENTORY',
                  link: '/vendor/inventory',
                },
              });
            }
          }
        }

        // Notify vendor about new order
        await tx.notification.create({
          data: {
            userId: group.vendor.userId,
            title: 'New Order Received',
            message: `New sub-order for ${orderNumber} placed. Value: Rs. ${group.subtotal}`,
            type: 'ORDER',
            link: '/vendor/orders',
          },
        });
      }

      // 4. Create Payment record
      const paymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'PAID';
      await tx.payment.create({
        data: {
          orderId: order.id,
          transactionId,
          amount: grandTotal,
          method: paymentMethod,
          status: paymentStatus,
          paymentDetails: {
            gateway: paymentMethod === 'COD' ? 'Cash On Delivery' : 'MarketHub Sandbox Pay',
            paidAt: paymentStatus === 'PAID' ? new Date().toISOString() : null,
          },
        },
      });

      // 5. Create Delivery record
      const estDelivery = new Date();
      estDelivery.setDate(estDelivery.getDate() + 3);

      await tx.delivery.create({
        data: {
          orderId: order.id,
          deliveryPartnerId: availablePartner ? availablePartner.id : null,
          status: 'ASSIGNED',
          estimatedDelivery: estDelivery,
          pickupNotes: notes || 'Handle with care',
        },
      });

      if (availablePartner) {
        await tx.notification.create({
          data: {
            userId: availablePartner.userId,
            title: 'New Delivery Assigned',
            message: `Delivery assigned for Order ${orderNumber} to ${shippingAddress.city}.`,
            type: 'DELIVERY',
            link: '/delivery/dashboard',
          },
        });
      }

      // 6. Track promotion usage if any
      if (appliedPromotion) {
        await tx.promotionUsage.create({
          data: {
            promotionId: appliedPromotion.id,
            userId: req.user.id,
            orderId: order.id,
            discountApplied: promoDiscount,
          },
        });

        await tx.promotion.update({
          where: { id: appliedPromotion.id },
          data: { timesUsed: { increment: 1 } },
        });
      }

      // 7. Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      // 8. Customer notification
      await tx.notification.create({
        data: {
          userId: req.user.id,
          title: 'Order Confirmed',
          message: `Your order #${orderNumber} of Rs. ${grandTotal} has been placed successfully!`,
          type: 'ORDER',
          link: `/orders/${order.id}`,
        },
      });

      return order;
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: result.id },
      include: {
        items: { include: { product: { include: { images: true, vendor: true } } } },
        vendorOrders: { include: { vendor: true, items: true } },
        payment: true,
        delivery: { include: { deliveryPartner: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: fullOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                vendor: { select: { id: true, businessName: true } },
              },
            },
          },
        },
        vendorOrders: {
          include: { vendor: { select: { id: true, businessName: true } } },
        },
        payment: true,
        delivery: {
          include: { deliveryPartner: { select: { name: true, phone: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                vendor: { select: { id: true, businessName: true, phone: true, email: true } },
              },
            },
            vendorOrder: true,
          },
        },
        vendorOrders: {
          include: {
            vendor: true,
            items: { include: { product: true } },
          },
        },
        payment: true,
        delivery: {
          include: {
            deliveryPartner: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role check: customer can only view their own order, vendor sees their sub-order, admin & delivery can view
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'VENDOR') {
      const isVendorOrder = order.vendorOrders.some((vo) => vo.vendorId === req.user.vendor?.id);
      if (!isVendorOrder) {
        return res.status(403).json({ success: false, message: 'Unauthorized for this order' });
      }
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payment: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!['PLACED', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Orders with status ${order.status} cannot be cancelled directly.`,
      });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update order status
      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // 2. Update vendor orders
      await tx.vendorOrder.updateMany({
        where: { orderId: id },
        data: { status: 'CANCELLED' },
      });

      // 3. Update payment status if needed
      if (order.payment && order.payment.status === 'PAID') {
        await tx.payment.update({
          where: { orderId: id },
          data: { status: 'REFUNDED' },
        });
      }

      // 4. Restore inventory stock
      for (const item of order.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            currentStock: { increment: item.quantity },
            availableStock: { increment: item.quantity },
            status: 'IN_STOCK',
          },
        });
      }

      // 5. Notify customer
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: 'Order Cancelled',
          message: `Your order #${order.orderNumber} has been cancelled successfully.`,
          type: 'ORDER',
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
    });
  } catch (error) {
    next(error);
  }
};

export const requestReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Return can only be requested for delivered orders.',
      });
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'RETURN_REQUESTED' },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Return Requested',
          message: `Return requested for order #${order.orderNumber}. Reason: ${reason || 'Customer request'}`,
          type: 'ORDER',
          link: `/admin/orders`,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully. Our team will review it shortly.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
      'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'REFUNDED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { delivery: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status },
      });

      // Keep sub-orders aligned if needed
      await tx.vendorOrder.updateMany({
        where: { orderId: id },
        data: { status },
      });

      // If status is DELIVERED, update delivery record & payment for COD
      if (status === 'DELIVERED') {
        if (order.delivery) {
          await tx.delivery.update({
            where: { orderId: id },
            data: { status: 'DELIVERED', deliveredAt: new Date() },
          });
        }
        await tx.payment.updateMany({
          where: { orderId: id, method: 'COD' },
          data: { status: 'PAID' },
        });
      }

      // Customer notification
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: `Order Status: ${status.replace(/_/g, ' ')}`,
          message: `Your order #${order.orderNumber} is now ${status.replace(/_/g, ' ').toLowerCase()}.`,
          type: 'ORDER',
          link: `/orders/${order.id}`,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};
