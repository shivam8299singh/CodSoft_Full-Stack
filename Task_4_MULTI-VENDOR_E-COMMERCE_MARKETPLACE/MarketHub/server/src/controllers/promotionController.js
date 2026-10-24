import prisma from '../config/db.js';

export const getActivePromotions = async (req, res, next) => {
  try {
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrder: true,
        maxDiscount: true,
        endDate: true,
        vendor: { select: { businessName: true } },
      },
      orderBy: { discountValue: 'desc' },
      take: 10,
    });

    res.status(200).json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    next(error);
  }
};

export const validatePromotion = async (req, res, next) => {
  try {
    const { code, cartTotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Promo code is required' });
    }

    const promo = await prisma.promotion.findFirst({
      where: {
        code: code.toUpperCase().trim(),
        isActive: true,
      },
      include: { vendor: { select: { businessName: true } } },
    });

    if (!promo) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    const now = new Date();
    if (now < promo.startDate || now > promo.endDate) {
      return res.status(400).json({ success: false, message: 'This coupon has expired or is not yet active' });
    }

    if (promo.timesUsed >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    if (cartTotal < promo.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of Rs. ${promo.minOrder} required for this coupon`,
      });
    }

    let discountAmount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discountAmount = (cartTotal * promo.discountValue) / 100;
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else {
      discountAmount = Math.min(cartTotal, promo.discountValue);
    }

    res.status(200).json({
      success: true,
      message: 'Coupon code applied successfully!',
      data: {
        code: promo.code,
        discountAmount: +discountAmount.toFixed(2),
        discountType: promo.discountType,
        discountValue: promo.discountValue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPromotions = async (req, res, next) => {
  try {
    const promotions = await prisma.promotion.findMany({
      include: {
        vendor: { select: { businessName: true } },
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

export const createPromotion = async (req, res, next) => {
  try {
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
      vendorId,
    } = req.body;

    if (!code || !discountValue || !endDate) {
      return res.status(400).json({ success: false, message: 'Code, discount value, and end date are required' });
    }

    const promo = await prisma.promotion.create({
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
        vendorId: vendorId || null,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: promo,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.promotion.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Promotion deleted',
    });
  } catch (error) {
    next(error);
  }
};
