import prisma from '../config/db.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderType = 'DINE_IN',
      tableId,
      deliveryAddress,
      instructions,
      items,
      paymentMethod = 'ONLINE',
    } = req.body;

    const name = req.user ? req.user.name : customerName;
    const email = req.user ? req.user.email : customerEmail;
    const phone = req.user?.phone || customerPhone;

    if (!name || !email || !phone) {
      return sendError(res, 'Customer name, email, and phone number are required', 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Order must contain at least one item', 400);
    }

    if (orderType === 'DELIVERY' && (!deliveryAddress || deliveryAddress.trim() === '')) {
      return sendError(res, 'Delivery address is required for delivery orders', 400);
    }

    // Verify all items from DB and calculate verified price
    const itemIds = items.map((i) => i.menuItemId);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: itemIds } },
    });

    const dbItemMap = {};
    dbMenuItems.forEach((item) => {
      dbItemMap[item.id] = item;
    });

    let subtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      const dbItem = dbItemMap[item.menuItemId];
      if (!dbItem) {
        return sendError(res, `Menu item with ID ${item.menuItemId} does not exist`, 400);
      }
      if (!dbItem.isAvailable) {
        return sendError(res, `Item "${dbItem.name}" is currently unavailable`, 400);
      }

      const qty = parseInt(item.quantity, 10) || 1;
      subtotal += dbItem.price * qty;

      verifiedOrderItems.push({
        menuItemId: dbItem.id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: qty,
        specialInstructions: item.specialInstructions ? item.specialInstructions.trim() : null,
      });
    }

    // Restaurant settings for tax and delivery fee
    const settings = await prisma.restaurantSetting.findFirst();
    const taxRate = settings ? settings.taxRate : 5.0;
    const baseDeliveryFee = settings ? settings.deliveryFee : 40.0;

    const tax = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
    const deliveryFee = orderType === 'DELIVERY' ? baseDeliveryFee : 0;
    const totalAmount = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    // Generate unique orderNumber: ORD-XXXXXX
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `ORD-${randomSuffix}`;

    // Create Order with Items and Payment in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: req.user ? req.user.id : null,
          customerName: name.trim(),
          customerEmail: email.toLowerCase().trim(),
          customerPhone: phone.trim(),
          orderType,
          tableId: orderType === 'DINE_IN' && tableId ? tableId : null,
          deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
          instructions: instructions ? instructions.trim() : null,
          subtotal,
          tax,
          deliveryFee,
          totalAmount,
          status: 'PLACED',
          items: {
            create: verifiedOrderItems,
          },
          payment: {
            create: {
              amount: totalAmount,
              paymentMethod,
              status: paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
              transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
              paidAt: paymentMethod === 'CASH' ? null : new Date(),
            },
          },
        },
        include: {
          items: true,
          payment: true,
          table: true,
        },
      });

      // If Dine-in and table was provided, mark table as OCCUPIED
      if (orderType === 'DINE_IN' && tableId) {
        await tx.restaurantTable.update({
          where: { id: tableId },
          data: { status: 'OCCUPIED' },
        });
      }

      return newOrder;
    });

    return sendSuccess(res, 'Order placed successfully', order, 201);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { status, orderType, search, limit = 50, page = 1 } = req.query;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (orderType && orderType !== 'all') {
      where.orderType = orderType;
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              menuItem: {
                select: { imageUrl: true, isVegetarian: true },
              },
            },
          },
          payment: true,
          table: true,
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.order.count({ where }),
    ]);

    return sendSuccess(res, 'Orders retrieved successfully', {
      orders,
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

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: req.user.id },
          { customerEmail: req.user.email },
        ],
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: { imageUrl: true, isVegetarian: true },
            },
          },
        },
        payment: true,
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'My orders retrieved', orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        payment: true,
        table: true,
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Role check: customer can only view their own order
    if (
      req.user &&
      req.user.role === 'CUSTOMER' &&
      order.customerId !== req.user.id &&
      order.customerEmail !== req.user.email
    ) {
      return sendError(res, 'Not authorized to view this order', 403);
    }

    return sendSuccess(res, 'Order details retrieved', order);
  } catch (error) {
    next(error);
  }
};

export const trackOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            menuItem: {
              select: { imageUrl: true, isVegetarian: true },
            },
          },
        },
        payment: true,
        table: true,
      },
    });

    if (!order) {
      return sendError(res, `No order found with reference ${orderNumber}`, 404);
    }

    return sendSuccess(res, 'Order tracking info retrieved', order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!status || !validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Valid: ${validStatuses.join(', ')}`, 400);
    }

    // Kitchen staff can only update PLACED -> PREPARING, and PREPARING -> READY
    if (req.user.role === 'KITCHEN') {
      const allowedForKitchen = ['PREPARING', 'READY'];
      if (!allowedForKitchen.includes(status)) {
        return sendError(
          res,
          'Kitchen staff can only transition orders to PREPARING or READY',
          403
        );
      }
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { table: true },
    });

    if (!existing) {
      return sendError(res, 'Order not found', 404);
    }

    // If order delivered or cancelled and had a table, release table if occupied
    if ((status === 'DELIVERED' || status === 'CANCELLED') && existing.tableId) {
      await prisma.restaurantTable.update({
        where: { id: existing.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        payment: true,
        table: true,
      },
    });

    return sendSuccess(res, `Order status updated to ${status}`, updated);
  } catch (error) {
    next(error);
  }
};
