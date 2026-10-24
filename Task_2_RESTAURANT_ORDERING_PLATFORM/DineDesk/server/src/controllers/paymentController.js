import prisma from '../config/db.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const processPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod = 'ONLINE', cardNumber, upiId } = req.body;

    if (!orderId) {
      return sendError(res, 'Order ID is required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.payment && order.payment.status === 'PAID') {
      return sendSuccess(res, 'Order is already paid', order.payment);
    }

    // Generate simulated transaction reference
    const transactionId = `TXN-${paymentMethod}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Update or create payment
    let payment;
    if (order.payment) {
      payment = await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          paymentMethod,
          status: 'PAID',
          transactionId,
          paidAt: new Date(),
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          paymentMethod,
          status: 'PAID',
          transactionId,
          paidAt: new Date(),
        },
      });
    }

    // Auto-advance order status from PLACED to CONFIRMED on payment receipt
    if (order.status === 'PLACED') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
      });
    }

    return sendSuccess(res, 'Payment processed successfully (Simulated)', payment);
  } catch (error) {
    next(error);
  }
};

export const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
            status: true,
            customerName: true,
          },
        },
      },
    });

    if (!payment) {
      return sendError(res, 'Payment record not found for this order', 404);
    }

    return sendSuccess(res, 'Payment details retrieved', payment);
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              customerName: true,
              customerEmail: true,
              orderType: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.payment.count({ where }),
    ]);

    return sendSuccess(res, 'Payments retrieved successfully', {
      payments,
      pagination: {
        total,
        page: parseInt(page, 10),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};
