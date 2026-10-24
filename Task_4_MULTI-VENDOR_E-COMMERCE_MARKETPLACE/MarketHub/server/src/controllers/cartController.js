import prisma from '../config/db.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                vendor: { select: { id: true, businessName: true } },
                inventory: { select: { availableStock: true, status: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: true },
      });
    }

    // Calculate totals and group by vendor
    let subtotal = 0;
    let totalDiscount = 0;
    const vendorMap = {};

    const items = cart.items.map((item) => {
      const p = item.product;
      const unitPrice = p.price;
      const discountPercent = p.discount || 0;
      const discountedUnitPrice = unitPrice * (1 - discountPercent / 100);
      const itemSubtotal = unitPrice * item.quantity;
      const itemDiscount = (unitPrice - discountedUnitPrice) * item.quantity;
      const itemTotal = discountedUnitPrice * item.quantity;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;

      const vendorId = p.vendor.id;
      if (!vendorMap[vendorId]) {
        vendorMap[vendorId] = {
          vendorId,
          businessName: p.vendor.businessName,
          items: [],
          vendorSubtotal: 0,
        };
      }
      vendorMap[vendorId].items.push(item);
      vendorMap[vendorId].vendorSubtotal += itemTotal;

      return {
        ...item,
        unitPrice,
        discountedUnitPrice,
        itemSubtotal,
        itemDiscount,
        itemTotal,
      };
    });

    const tax = +(subtotal * 0.05).toFixed(2); // 5% tax
    const shippingFee = items.length > 0 ? (subtotal > 1000 ? 0 : 50) : 0; // free shipping over 1000
    const grandTotal = Math.max(0, +(subtotal - totalDiscount + tax + shippingFee).toFixed(2));

    res.status(200).json({
      success: true,
      data: {
        cartId: cart.id,
        items,
        vendorGroups: Object.values(vendorMap),
        summary: {
          itemCount: items.reduce((sum, it) => sum + it.quantity, 0),
          subtotal: +subtotal.toFixed(2),
          discount: +totalDiscount.toFixed(2),
          tax,
          shippingFee,
          grandTotal,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'ProductId is required' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product || product.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'Product is unavailable' });
    }

    if (product.inventory && product.inventory.availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.inventory.availableStock} items in stock.`,
      });
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.inventory && product.inventory.availableStock < newQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Available stock limit reached (${product.inventory.availableStock}).`,
        });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: Math.max(1, quantity),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      // If quantity is 0 or negative, remove the item
      await prisma.cartItem.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Item removed from cart' });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: { include: { inventory: true } } },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    if (item.product.inventory && item.product.inventory.availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.product.inventory.availableStock} items available in stock`,
      });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.cartItem.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};
