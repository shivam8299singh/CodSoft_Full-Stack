import prisma from '../config/db.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.restaurantSetting.findFirst();
    if (!settings) {
      settings = await prisma.restaurantSetting.create({
        data: {
          name: 'DineDesk Luxury Bistro & Bar',
          tagline: 'Culinary Artistry, Flawless Hospitality & Immersive Dining',
          email: 'contact@dinedesk.com',
          phone: '+91 98765 43210',
          address: '42 Gourmet Boulevard, Connaught Circle, Metropolis - 110001',
          taxRate: 5.0,
          deliveryFee: 40.0,
          openingHours: 'Mon - Sun: 11:00 AM - 11:30 PM',
        },
      });
    }

    return sendSuccess(res, 'Restaurant settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { name, tagline, email, phone, address, taxRate, deliveryFee, openingHours } = req.body;

    let settings = await prisma.restaurantSetting.findFirst();
    if (!settings) {
      settings = await prisma.restaurantSetting.create({ data: {} });
    }

    const updated = await prisma.restaurantSetting.update({
      where: { id: settings.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(tagline && { tagline: tagline.trim() }),
        ...(email && { email: email.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(address && { address: address.trim() }),
        ...(taxRate !== undefined && { taxRate: parseFloat(taxRate) }),
        ...(deliveryFee !== undefined && { deliveryFee: parseFloat(deliveryFee) }),
        ...(openingHours && { openingHours: openingHours.trim() }),
      },
    });

    return sendSuccess(res, 'Restaurant settings updated successfully', updated);
  } catch (error) {
    next(error);
  }
};
