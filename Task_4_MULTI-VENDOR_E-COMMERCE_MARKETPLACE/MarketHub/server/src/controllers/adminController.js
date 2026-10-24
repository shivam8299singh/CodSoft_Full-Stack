import prisma from '../config/db.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalVendors,
      totalProducts,
      totalOrders,
      pendingVendors,
      activeDeliveries,
      orders,
      commissions,
      topVendors,
      categoriesCount,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.vendor.count({ where: { status: 'APPROVED' } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.vendor.count({ where: { status: 'PENDING' } }),
      prisma.delivery.count({ where: { status: { in: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] } } }),
      prisma.order.findMany({
        select: {
          grandTotal: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.commission.findMany({
        select: {
          commissionFee: true,
          netPayout: true,
          isSettled: true,
        },
      }),
      prisma.vendor.findMany({
        take: 5,
        include: {
          _count: { select: { products: true, vendorOrders: true } },
          vendorOrders: { select: { subtotal: true } },
        },
      }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const marketplaceCommission = commissions.reduce((sum, c) => sum + c.commissionFee, 0);
    const vendorPayouts = commissions.reduce((sum, c) => sum + c.netPayout, 0);

    // Sales over time (group by day or month)
    const salesTimeline = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      salesTimeline[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const dKey = o.createdAt.toISOString().split('T')[0];
      if (salesTimeline[dKey]) {
        salesTimeline[dKey].revenue += o.grandTotal;
        salesTimeline[dKey].orders += 1;
      }
    });

    // Orders status distribution
    const statusDistribution = {};
    orders.forEach((o) => {
      statusDistribution[o.status] = (statusDistribution[o.status] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCustomers,
          totalVendors,
          totalProducts,
          totalOrders,
          pendingVendors,
          activeDeliveries,
          totalRevenue: +totalRevenue.toFixed(2),
          marketplaceCommission: +marketplaceCommission.toFixed(2),
          vendorPayouts: +vendorPayouts.toFixed(2),
        },
        salesTimeline: Object.values(salesTimeline),
        statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({ status, count })),
        topVendors: topVendors.map((v) => ({
          id: v.id,
          businessName: v.businessName,
          productsCount: v._count.products,
          ordersCount: v._count.vendorOrders,
          totalSales: v.vendorOrders.reduce((sum, vo) => sum + vo.subtotal, 0),
        })),
        categoryDistribution: categoriesCount.map((c) => ({
          name: c.name,
          count: c._count.products,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const take = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * take;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          vendor: { select: { id: true, businessName: true, status: true } },
          deliveryPartner: { select: { id: true, vehicleType: true, isAvailable: true } },
          _count: { select: { orders: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: users,
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

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Admin account cannot be deactivated' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    res.status(200).json({
      success: true,
      message: `User account ${updated.isActive ? 'activated' : 'suspended'}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminVendors = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { products: true, vendorOrders: true } },
        commissions: {
          select: { commissionFee: true, netPayout: true, isSettled: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, commissionRate } = req.body;

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid vendor status' });
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(commissionRate !== undefined && { commissionRate: parseFloat(commissionRate) }),
      },
      include: { user: true },
    });

    // Notify the vendor
    await prisma.notification.create({
      data: {
        userId: vendor.userId,
        title: `Vendor Status Update`,
        message: `Your vendor account has been marked as ${status}. ${status === 'APPROVED' ? 'You can now sell products on MarketHub!' : ''}`,
        type: 'VENDOR',
        link: '/vendor/dashboard',
      },
    });

    res.status(200).json({
      success: true,
      message: `Vendor status updated to ${status}`,
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const take = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * take;

    const [orders, total, deliveryPartners] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { name: true } },
              vendor: { select: { businessName: true } },
            },
          },
          vendorOrders: {
            include: { vendor: { select: { businessName: true } } },
          },
          payment: true,
          delivery: {
            include: { deliveryPartner: { select: { id: true, name: true, phone: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
      prisma.deliveryPartner.findMany({
        select: { id: true, name: true, phone: true, vehicleType: true, isAvailable: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      deliveryPartners,
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

export const assignDeliveryPartner = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { deliveryPartnerId } = req.body;

    const delivery = await prisma.delivery.upsert({
      where: { orderId },
      create: {
        orderId,
        deliveryPartnerId,
        status: 'ASSIGNED',
      },
      update: {
        deliveryPartnerId,
        status: 'ASSIGNED',
      },
      include: { order: true, deliveryPartner: true },
    });

    if (deliveryPartnerId && delivery.deliveryPartner) {
      await prisma.notification.create({
        data: {
          userId: delivery.deliveryPartner.userId,
          title: 'Delivery Assigned',
          message: `Order #${delivery.order.orderNumber} has been assigned to you.`,
          type: 'DELIVERY',
          link: '/delivery/dashboard',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Delivery partner assigned successfully',
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminCommissions = async (req, res, next) => {
  try {
    const commissions = await prisma.commission.findMany({
      include: {
        vendor: { select: { id: true, businessName: true, ownerName: true, email: true } },
        vendorOrder: {
          select: { id: true, orderId: true, status: true, order: { select: { orderNumber: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionFee, 0);
    const totalPayouts = commissions.reduce((sum, c) => sum + c.netPayout, 0);
    const settledPayouts = commissions.filter((c) => c.isSettled).reduce((sum, c) => sum + c.netPayout, 0);
    const pendingPayouts = totalPayouts - settledPayouts;

    res.status(200).json({
      success: true,
      data: commissions,
      summary: {
        totalCommissions: +totalCommissions.toFixed(2),
        totalPayouts: +totalPayouts.toFixed(2),
        settledPayouts: +settledPayouts.toFixed(2),
        pendingPayouts: +pendingPayouts.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const settleCommission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const commission = await prisma.commission.update({
      where: { id },
      data: {
        isSettled: true,
        settledAt: new Date(),
      },
      include: { vendor: true },
    });

    // Notify vendor
    await prisma.notification.create({
      data: {
        userId: commission.vendor.userId,
        title: 'Payout Settled',
        message: `Payout of Rs. ${commission.netPayout} for order has been settled by marketplace admin.`,
        type: 'FINANCE',
        link: '/vendor/dashboard',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Commission payout marked as settled',
      data: commission,
    });
  } catch (error) {
    next(error);
  }
};
