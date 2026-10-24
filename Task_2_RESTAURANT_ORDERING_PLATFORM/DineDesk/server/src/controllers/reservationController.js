import prisma from '../config/db.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const createReservation = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      guestsCount,
      reservationDate,
      reservationTime,
      specialRequest,
      tableId,
    } = req.body;

    const name = req.user ? req.user.name : customerName;
    const email = req.user ? req.user.email : customerEmail;
    const phone = req.user?.phone || customerPhone;

    if (!name || !email || !phone || !guestsCount || !reservationDate || !reservationTime) {
      return sendError(
        res,
        'Name, email, phone, guests count, date, and time are required for table reservations',
        400
      );
    }

    const dateObj = new Date(reservationDate);
    if (isNaN(dateObj.getTime())) {
      return sendError(res, 'Invalid reservation date format', 400);
    }

    let assignedTableId = tableId || null;

    // Auto-assign table if not provided
    if (!assignedTableId) {
      const suitableTable = await prisma.restaurantTable.findFirst({
        where: {
          capacity: { gte: parseInt(guestsCount, 10) },
          status: 'AVAILABLE',
        },
        orderBy: { capacity: 'asc' },
      });
      if (suitableTable) {
        assignedTableId = suitableTable.id;
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        customerId: req.user ? req.user.id : null,
        customerName: name.trim(),
        customerEmail: email.toLowerCase().trim(),
        customerPhone: phone.trim(),
        tableId: assignedTableId,
        guestsCount: parseInt(guestsCount, 10),
        reservationDate: dateObj,
        reservationTime: reservationTime.trim(),
        specialRequest: specialRequest ? specialRequest.trim() : null,
        status: 'PENDING',
      },
      include: {
        table: true,
      },
    });

    return sendSuccess(
      res,
      'Table reservation request submitted successfully',
      reservation,
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getReservations = async (req, res, next) => {
  try {
    const { status, date } = req.query;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      where.reservationDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        table: true,
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: [{ reservationDate: 'asc' }, { reservationTime: 'asc' }],
    });

    return sendSuccess(res, 'Reservations retrieved', reservations);
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        OR: [
          { customerId: req.user.id },
          { customerEmail: req.user.email },
        ],
      },
      include: {
        table: true,
      },
      orderBy: { reservationDate: 'desc' },
    });

    return sendSuccess(res, 'My reservations retrieved', reservations);
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        table: true,
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!reservation) {
      return sendError(res, 'Reservation not found', 404);
    }

    return sendSuccess(res, 'Reservation retrieved', reservation);
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, tableId } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Valid: ${validStatuses.join(', ')}`, 400);
    }

    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Reservation not found', 404);
    }

    const dataToUpdate = { status };
    if (tableId !== undefined) {
      dataToUpdate.tableId = tableId || null;
    }

    // If confirming reservation and table is assigned, mark table as RESERVED
    if (status === 'CONFIRMED' && (tableId || existing.tableId)) {
      const targetTableId = tableId || existing.tableId;
      await prisma.restaurantTable.update({
        where: { id: targetTableId },
        data: { status: 'RESERVED' },
      });
    }

    // If cancelled or completed, release table back to AVAILABLE if it was reserved
    if (status === 'CANCELLED' || status === 'COMPLETED') {
      if (existing.tableId) {
        await prisma.restaurantTable.update({
          where: { id: existing.tableId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: dataToUpdate,
      include: { table: true },
    });

    return sendSuccess(res, `Reservation status updated to ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

export const cancelMyReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation) {
      return sendError(res, 'Reservation not found', 404);
    }

    if (reservation.customerId !== req.user.id && reservation.customerEmail !== req.user.email) {
      return sendError(res, 'Not authorized to cancel this reservation', 403);
    }

    if (reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
      return sendError(res, `Cannot cancel reservation in ${reservation.status} status`, 400);
    }

    if (reservation.tableId) {
      await prisma.restaurantTable.update({
        where: { id: reservation.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { table: true },
    });

    return sendSuccess(res, 'Reservation cancelled successfully', updated);
  } catch (error) {
    next(error);
  }
};
