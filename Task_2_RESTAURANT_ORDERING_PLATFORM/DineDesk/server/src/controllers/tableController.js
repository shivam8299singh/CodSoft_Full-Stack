import prisma from '../config/db.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const getTables = async (req, res, next) => {
  try {
    const { status, location, minCapacity } = req.query;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (location && location !== 'all') {
      where.location = location;
    }
    if (minCapacity) {
      where.capacity = { gte: parseInt(minCapacity, 10) };
    }

    const tables = await prisma.restaurantTable.findMany({
      where,
      include: {
        _count: {
          select: { reservations: true, orders: true },
        },
      },
      orderBy: { tableNumber: 'asc' },
    });

    return sendSuccess(res, 'Tables retrieved successfully', tables);
  } catch (error) {
    next(error);
  }
};

export const getTableById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const table = await prisma.restaurantTable.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          orderBy: { reservationDate: 'asc' },
        },
        orders: {
          where: {
            status: { in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'] },
          },
        },
      },
    });

    if (!table) {
      return sendError(res, 'Table not found', 404);
    }

    return sendSuccess(res, 'Table retrieved', table);
  } catch (error) {
    next(error);
  }
};

export const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, location, status } = req.body;

    if (!tableNumber || !capacity) {
      return sendError(res, 'Table number and capacity are required', 400);
    }

    const parsedNumber = parseInt(tableNumber, 10);
    const existing = await prisma.restaurantTable.findUnique({
      where: { tableNumber: parsedNumber },
    });

    if (existing) {
      return sendError(res, `Table number ${tableNumber} already exists`, 400);
    }

    const table = await prisma.restaurantTable.create({
      data: {
        tableNumber: parsedNumber,
        capacity: parseInt(capacity, 10),
        location: location ? location.trim() : 'Indoor',
        status: status || 'AVAILABLE',
      },
    });

    return sendSuccess(res, 'Table created successfully', table, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, location, status } = req.body;

    const existing = await prisma.restaurantTable.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Table not found', 404);
    }

    const dataToUpdate = {};
    if (tableNumber !== undefined) {
      const parsedNum = parseInt(tableNumber, 10);
      if (parsedNum !== existing.tableNumber) {
        const duplicate = await prisma.restaurantTable.findUnique({ where: { tableNumber: parsedNum } });
        if (duplicate) return sendError(res, `Table number ${parsedNum} is already in use`, 400);
      }
      dataToUpdate.tableNumber = parsedNum;
    }
    if (capacity !== undefined) dataToUpdate.capacity = parseInt(capacity, 10);
    if (location !== undefined) dataToUpdate.location = location.trim();
    if (status !== undefined) dataToUpdate.status = status;

    const table = await prisma.restaurantTable.update({
      where: { id },
      data: dataToUpdate,
    });

    return sendSuccess(res, 'Table updated successfully', table);
  } catch (error) {
    next(error);
  }
};

export const updateTableStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING'];
    if (!status || !validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Valid options: ${validStatuses.join(', ')}`, 400);
    }

    const table = await prisma.restaurantTable.update({
      where: { id },
      data: { status },
    });

    return sendSuccess(res, `Table status updated to ${status}`, table);
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.restaurantTable.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Table not found', 404);
    }

    await prisma.restaurantTable.delete({ where: { id } });
    return sendSuccess(res, 'Table deleted successfully');
  } catch (error) {
    next(error);
  }
};
