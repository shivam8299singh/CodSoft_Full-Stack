import prisma from '../config/db.js';

export const getVendorDashboard = async (req, res, next) => {
  try {
    const vendorId = req.user.vendor.id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalOrdersCount,
      todayOrdersCount,
      pendingOrdersCount,
      lowStockCount,
      vendorOrders,
      productsWithStock,
    ] = await Promise.all([
      prisma.product.count({ where: { vendorId } }),
      prisma.vendorOrder.count({ where: { vendorId } }),
      prisma.vendorOrder.count({
        where: {
          vendorId,
          createdAt: { gte: startOfToday },
        },
      }),
      prisma.vendorOrder.count({
        where: {
          vendorId,
          status: { in: ['PLACED', 'CONFIRMED', 'PROCESSING'] },
        },
      }),
      prisma.inventory.count({
        where: {
          product: { vendorId },
          status: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
        },
      }),
      prisma.vendorOrder.findMany({
        where: { vendorId },
        select: {
          subtotal: true,
          commissionAmount: true,
          netEarnings: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.product.findMany({
        where: { vendorId },
        include: {
          inventory: true,
          _count: { select: { orderItems: true } },
        },
        take: 5,
        orderBy: { orderItems: { _count: 'desc' } },
      }),
    ]);

    // Financial totals
    const grossSales = vendorOrders.reduce((sum, vo) => sum + vo.subtotal, 0);
    const marketplaceCommission = vendorOrders.reduce((sum, vo) => sum + vo.commissionAmount, 0);
    const netEarnings = vendorOrders.reduce((sum, vo) => sum + vo.netEarnings, 0);

    // Group sales over time (last 7 days or monthly)
    const salesByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      salesByDay[dateKey] = { date: dateKey, sales: 0, earnings: 0, orders: 0 };
    }

    vendorOrders.forEach((vo) => {
      const dKey = vo.createdAt.toISOString().split('T')[0];
      if (salesByDay[dKey]) {
        salesByDay[dKey].sales += vo.subtotal;
        salesByDay[dKey].earnings += vo.netEarnings;
        salesByDay[dKey].orders += 1;
      }
    });

    // Order status counts
    const statusCounts = {};
    vendorOrders.forEach((vo) => {
      statusCounts[vo.status] = (statusCounts[vo.status] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalOrders: totalOrdersCount,
          todayOrders: todayOrdersCount,
          pendingOrders: pendingOrdersCount,
          lowStockProducts: lowStockCount,
          grossSales: +grossSales.toFixed(2),
          marketplaceCommission: +marketplaceCommission.toFixed(2),
          netEarnings: +netEarnings.toFixed(2),
        },
        salesChart: Object.values(salesByDay),
        statusChart: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
        topProducts: productsWithStock.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          orders: p._count.orderItems,
          stock: p.inventory?.availableStock || 0,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorOrders = async (req, res, next) => {
  try {
    const vendorId = req.user.vendor.id;
    const { status, page = 1, limit = 20 } = req.query;

    const where = { vendorId };
    if (status) where.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const take = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * take;

    const [orders, total] = await Promise.all([
      prisma.vendorOrder.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              shippingAddress: true,
              createdAt: true,
              user: { select: { name: true, email: true, phone: true } },
              delivery: { select: { status: true, deliveryPartner: { select: { name: true, phone: true } } } },
            },
          },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true, images: { take: 1 } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.vendorOrder.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendorOrderStatus = async (req, res, next) => {
  try {
    const vendorId = req.user.vendor.id;
    const { id } = req.params; // vendorOrderId
    const { status } = req.body;

    const validStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Vendors can only update status to: ${validStatuses.join(', ')}`,
      });
    }

    const vendorOrder = await prisma.vendorOrder.findFirst({
      where: { id, vendorId },
      include: { order: true },
    });

    if (!vendorOrder) {
      return res.status(404).json({ success: false, message: 'Sub-order not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.vendorOrder.update({
        where: { id },
        data: { status },
      });

      // Update parent order if all sub-orders are at least this status
      const allSubOrders = await tx.vendorOrder.findMany({
        where: { orderId: vendorOrder.orderId },
      });

      const allMatch = allSubOrders.every((so) => so.status === status);
      if (allMatch) {
        await tx.order.update({
          where: { id: vendorOrder.orderId },
          data: { status },
        });
      }

      // Notify customer
      await tx.notification.create({
        data: {
          userId: vendorOrder.order.userId,
          title: `Item Status Update: ${status}`,
          message: `Your items from ${req.user.vendor.businessName} are now ${status.toLowerCase()}.`,
          type: 'ORDER',
          link: `/orders/${vendorOrder.orderId}`,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: `Sub-order updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorInventory = async (req, res, next) => {
  try {
    const vendorId = req.user.vendor.id;

    const products = await prisma.product.findMany({
      where: { vendorId },
      include: {
        inventory: true,
        category: { select: { name: true } },
        images: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryStock = async (req, res, next) => {
  try {
    const vendorId = req.user.vendor.id;
    const { productId } = req.params;
    const { stock, lowStockThreshold } = req.body;

    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId },
      include: { inventory: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const curStock = stock !== undefined ? parseInt(stock, 10) : product.inventory?.currentStock || 0;
    const threshold = lowStockThreshold !== undefined ? parseInt(lowStockThreshold, 10) : product.inventory?.lowStockThreshold || 5;
    const reserved = product.inventory?.reservedStock || 0;
    const available = Math.max(0, curStock - reserved);

    let status = 'IN_STOCK';
    if (available <= 0) status = 'OUT_OF_STOCK';
    else if (available <= threshold) status = 'LOW_STOCK';

    const updated = await prisma.inventory.upsert({
      where: { productId },
      create: {
        productId,
        currentStock: curStock,
        reservedStock: reserved,
        availableStock: available,
        lowStockThreshold: threshold,
        status,
      },
      update: {
        currentStock: curStock,
        availableStock: available,
        lowStockThreshold: threshold,
        status,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorPromotions = async (req, res, next) => {
  try {
    const vendorId = req.user.vendor.id;

    const promotions = await prisma.promotion.findMany({
      where: { vendorId },
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    next(error);
  }
};

export const createVendorPromotion = async (req, res, next) => {
  try {
    const vendorId = req.user.vendor.id;
    const {
      code,
      description,
      discountType = 'PERCENTAGE',
      discountValue,
      minOrder = 0,
      maxDiscount,
      startDate,
      endDate,
      usageLimit = 100,
    } = req.body;

    if (!code || !discountValue || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount value, and end date are required.',
      });
    }

    const promotion = await prisma.promotion.create({
      data: {
        code: code.toUpperCase().trim(),
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrder: parseFloat(minOrder) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        usageLimit: parseInt(usageLimit, 10) || 100,
        vendorId,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVendorPromotion = async (req, res, next) => {
  try {
    const vendorId = req.user.vendor.id;
    const { id } = req.params;

    const promo = await prisma.promotion.findFirst({ where: { id, vendorId } });
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    await prisma.promotion.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Promotion deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorReviews = async (req, res, next) => {
  try {
    const vendorId = req.user.vendor.id;

    const reviews = await prisma.review.findMany({
      where: {
        product: { vendorId },
      },
      include: {
        product: { select: { id: true, name: true, images: { take: 1 } } },
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
