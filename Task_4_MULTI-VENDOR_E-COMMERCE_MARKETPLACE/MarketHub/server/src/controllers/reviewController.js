import prisma from '../config/db.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Rating breakdown
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      sum += r.rating;
    });

    const averageRating = reviews.length > 0 ? +(sum / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        total: reviews.length,
        averageRating,
        distribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment, orderId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please write a review of at least 5 characters' });
    }

    // Check if user purchased the product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: req.user.id,
          status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED', 'PROCESSING'] },
        },
      },
    });

    if (!hasPurchased && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only verified buyers of this product can submit a review.',
      });
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({
      where: { productId, userId: req.user.id },
    });

    let review;
    if (existing) {
      review = await prisma.review.update({
        where: { id: existing.id },
        data: { rating: parseInt(rating, 10), comment },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      });
    } else {
      review = await prisma.review.create({
        data: {
          productId,
          userId: req.user.id,
          orderId: orderId || null,
          rating: parseInt(rating, 10),
          comment,
        },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      });
    }

    // Recalculate product rating
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: +avg.toFixed(1),
        numReviews: allReviews.length,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
