import prisma from '../config/db.js';

export const processPayment = async (req, res, next) => {
  try {
    const { orderId, method = 'CARD', cardDetails } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Simulate sandbox verification
    const isSuccess = true; // sandbox always approves valid mock payload

    const payment = await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        transactionId,
        amount: order.grandTotal,
        method,
        status: isSuccess ? 'PAID' : 'FAILED',
        paymentDetails: {
          gateway: 'MarketHub Sandbox Payment',
          cardLast4: cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : '4242',
          paidAt: new Date().toISOString(),
        },
      },
      update: {
        transactionId,
        method,
        status: isSuccess ? 'PAID' : 'FAILED',
        paymentDetails: {
          gateway: 'MarketHub Sandbox Payment',
          cardLast4: cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : '4242',
          paidAt: new Date().toISOString(),
        },
      },
    });

    if (isSuccess && order.status === 'PLACED') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sandbox payment processed successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id }, { orderId: id }, { transactionId: id }],
      },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
