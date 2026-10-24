import prisma from '../config/db.js';
import { sendSuccess } from '../utils/response.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(todayStart.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Parallel fetch for KPIs
    const [
      totalOrders,
      todayOrders,
      totalCustomers,
      availableTables,
      totalTables,
      activeReservations,
      allOrders,
      allPayments,
      orderItemsGrouped,
      recentOrders,
      recentReservations,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.restaurantTable.count({ where: { status: 'AVAILABLE' } }),
      prisma.restaurantTable.count(),
      prisma.reservation.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { id: true, totalAmount: true, status: true, createdAt: true },
      }),
      prisma.payment.findMany({
        where: { status: 'PAID' },
        select: { amount: true, paidAt: true, createdAt: true },
      }),
      prisma.orderItem.groupBy({
        by: ['menuItemId', 'name'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payment: true,
          table: true,
        },
      }),
      prisma.reservation.findMany({
        take: 5,
        orderBy: { reservationDate: 'asc' },
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
        include: { table: true },
      }),
    ]);

    // Total revenue from all PAID payments
    const totalRevenue = allPayments.reduce((acc, p) => acc + p.amount, 0);

    // Today's revenue
    const todayRevenue = allPayments
      .filter((p) => new Date(p.createdAt) >= todayStart)
      .reduce((acc, p) => acc + p.amount, 0);

    // Revenue & orders by day (last 7 days)
    const dayMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
    }

    allOrders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dayMap[dateKey]) {
        dayMap[dateKey].orders += 1;
        dayMap[dateKey].revenue += Math.round(o.totalAmount);
      }
    });

    const revenueChart = Object.values(dayMap);

    // Order status distribution
    const statusCounts = {};
    allOrders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const orderStatusDistribution = Object.keys(statusCounts).map((status) => ({
      name: status,
      value: statusCounts[status],
    }));

    // Top popular items
    const popularItems = orderItemsGrouped.map((item) => ({
      name: item.name,
      totalSold: item._sum.quantity || 0,
    }));

    return sendSuccess(res, 'Admin dashboard metrics retrieved', {
      kpis: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        totalOrders,
        todayOrders,
        totalCustomers,
        activeReservations,
        availableTables,
        totalTables,
      },
      charts: {
        revenueChart,
        orderStatusDistribution,
        popularItems,
      },
      recentOrders,
      recentReservations,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      activeOrdersCount,
      todayReservationsCount,
      tables,
      recentOrders,
      upcomingReservations,
      activeKitchenOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({
        where: { status: { in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'] } },
      }),
      prisma.reservation.count({
        where: {
          reservationDate: { gte: todayStart },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),
      prisma.restaurantTable.findMany({
        orderBy: { tableNumber: 'asc' },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: true, table: true, payment: true },
      }),
      prisma.reservation.findMany({
        take: 6,
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
        orderBy: [{ reservationDate: 'asc' }, { reservationTime: 'asc' }],
        include: { table: true },
      }),
      prisma.order.findMany({
        where: { status: { in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'] } },
        include: { items: true, table: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const tableStatusSummary = {
      total: tables.length,
      available: tables.filter((t) => t.status === 'AVAILABLE').length,
      reserved: tables.filter((t) => t.status === 'RESERVED').length,
      occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
      cleaning: tables.filter((t) => t.status === 'CLEANING').length,
    };

    return sendSuccess(res, 'Staff dashboard metrics retrieved', {
      summary: {
        todayOrders,
        activeOrders: activeOrdersCount,
        todayReservations: todayReservationsCount,
        availableTables: tableStatusSummary.available,
      },
      tables,
      tableStatusSummary,
      recentOrders,
      upcomingReservations,
      activeKitchenOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const getKitchenDashboard = async (req, res, next) => {
  try {
    const activeOrders = await prisma.order.findMany({
      where: {
        status: { in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'] },
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: { imageUrl: true, prepTime: true, isVegetarian: true },
            },
          },
        },
        table: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const newOrders = activeOrders.filter((o) => o.status === 'PLACED' || o.status === 'CONFIRMED');
    const preparingOrders = activeOrders.filter((o) => o.status === 'PREPARING');
    const readyOrders = activeOrders.filter((o) => o.status === 'READY');

    return sendSuccess(res, 'Kitchen dashboard orders retrieved', {
      totalActive: activeOrders.length,
      newOrders,
      preparingOrders,
      readyOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const [orders, reservations] = await Promise.all([
      prisma.order.findMany({
        where: {
          OR: [{ customerId: userId }, { customerEmail: userEmail }],
        },
        include: {
          items: true,
          table: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reservation.findMany({
        where: {
          OR: [{ customerId: userId }, { customerEmail: userEmail }],
        },
        include: { table: true },
        orderBy: { reservationDate: 'desc' },
      }),
    ]);

    const activeOrders = orders.filter((o) =>
      ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
    );
    const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
    const totalSpent = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    return sendSuccess(res, 'Customer dashboard overview retrieved', {
      stats: {
        totalOrders: orders.length,
        activeOrdersCount: activeOrders.length,
        totalReservations: reservations.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
      },
      activeOrders,
      recentOrders: orders.slice(0, 5),
      reservations: reservations.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};
