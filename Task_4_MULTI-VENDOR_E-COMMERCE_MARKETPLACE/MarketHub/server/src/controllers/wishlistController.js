import prisma from '../config/db.js';

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                category: { select: { id: true, name: true } },
                vendor: { select: { id: true, businessName: true } },
                inventory: { select: { availableStock: true, status: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.user.id },
        include: { items: true },
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist.items,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlistItem = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'ProductId is required' });
    }

    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId: req.user.id } });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return res.status(200).json({
        success: true,
        action: 'removed',
        message: 'Product removed from wishlist',
      });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    res.status(201).json({
      success: true,
      action: 'added',
      message: 'Product added to wishlist',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const removeWishlistItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.wishlistItem.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};

export const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'ProductId is required' });
    }

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } });
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    await prisma.$transaction(async (tx) => {
      // Remove from wishlist
      if (wishlist) {
        await tx.wishlistItem.deleteMany({
          where: { wishlistId: wishlist.id, productId },
        });
      }

      // Add to cart
      const existingCartItem = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      if (existingCartItem) {
        await tx.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        });
      } else {
        await tx.cartItem.create({
          data: { cartId: cart.id, productId, quantity: 1 },
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'Moved to cart successfully',
    });
  } catch (error) {
    next(error);
  }
};
