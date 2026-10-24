import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role && role !== 'all') {
      where.role = role;
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true, reservations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

export const getCustomersWithStats = async (req, res, next) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: { reservations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedCustomers = customers.map((c) => {
      const totalOrders = c.orders.length;
      const totalSpent = c.orders
        .filter((o) => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        totalOrders,
        totalSpent: Math.round(totalSpent * 100) / 100,
        reservationsCount: c._count.reservations,
        memberSince: c.createdAt,
      };
    });

    return sendSuccess(res, 'Customers with stats retrieved', enrichedCustomers);
  } catch (error) {
    next(error);
  }
};

export const createStaffUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const allowedRoles = ['STAFF', 'KITCHEN', 'ADMIN'];
    if (!role || !allowedRoles.includes(role)) {
      return sendError(res, `Valid role required: ${allowedRoles.join(', ')}`, 400);
    }

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return sendError(res, 'A user with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return sendSuccess(res, `${role} user created successfully`, user, 201);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['CUSTOMER', 'STAFF', 'KITCHEN', 'ADMIN'];
    if (!role || !validRoles.includes(role)) {
      return sendError(res, `Invalid role. Valid: ${validRoles.join(', ')}`, 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return sendSuccess(res, `User role changed to ${role}`, updated);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return sendError(res, 'Cannot delete your own account', 400);
    }

    await prisma.user.delete({ where: { id } });
    return sendSuccess(res, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};
