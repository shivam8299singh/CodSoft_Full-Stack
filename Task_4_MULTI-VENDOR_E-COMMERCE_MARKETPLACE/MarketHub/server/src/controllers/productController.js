import prisma from '../config/db.js';
import cache from '../config/cache.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      vendor,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sort = 'newest',
      page = 1,
      limit = 12,
      featured,
      onSale,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * take;

    const where = {
      status: 'ACTIVE',
      vendor: {
        status: 'APPROVED',
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.OR = [
        { category: { slug: category } },
        { categoryId: category },
        { category: { name: { contains: category, mode: 'insensitive' } } },
      ];
    }

    if (vendor) {
      where.vendorId = vendor;
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (inStock === 'true') {
      where.inventory = {
        availableStock: { gt: 0 },
      };
    }

    if (onSale === 'true') {
      where.discount = { gt: 0 };
    }

    let orderBy = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'popular':
        orderBy = { numReviews: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { isPrimary: 'desc' } },
          category: { select: { id: true, name: true, slug: true } },
          vendor: { select: { id: true, businessName: true, logo: true } },
          inventory: { select: { currentStock: true, availableStock: true, status: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: products,
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

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }, { sku: id }],
      },
      include: {
        images: true,
        category: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            ownerName: true,
            email: true,
            phone: true,
            address: true,
            logo: true,
            status: true,
            _count: { select: { products: true } },
          },
        },
        inventory: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Get related products in same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'ACTIVE',
      },
      include: {
        images: true,
        vendor: { select: { id: true, businessName: true } },
        inventory: true,
      },
      take: 4,
    });

    res.status(200).json({
      success: true,
      data: {
        ...product,
        relatedProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discount = 0,
      brand,
      sku,
      categoryId,
      specifications,
      images = [],
      stock = 10,
      lowStockThreshold = 5,
    } = req.body;

    // Verify vendor
    let vendorId;
    if (req.user.role === 'VENDOR') {
      vendorId = req.user.vendor.id;
    } else if (req.user.role === 'ADMIN') {
      vendorId = req.body.vendorId;
      if (!vendorId) {
        return res.status(400).json({ success: false, message: 'vendorId is required for admin' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!name || !price || !categoryId || !sku) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, category, and SKU are required.',
      });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString(36)}`;

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          description: description || '',
          price: parseFloat(price),
          discount: parseFloat(discount) || 0,
          brand,
          sku,
          categoryId,
          vendorId,
          specifications: specifications || {},
          status: 'ACTIVE',
        },
      });

      // Images
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, idx) => ({
            productId: newProduct.id,
            url: typeof img === 'string' ? img : img.url,
            altText: typeof img === 'string' ? name : img.altText || name,
            isPrimary: idx === 0,
          })),
        });
      } else {
        // default placeholder
        await tx.productImage.create({
          data: {
            productId: newProduct.id,
            url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
            altText: name,
            isPrimary: true,
          },
        });
      }

      // Inventory
      const stockQty = parseInt(stock, 10) || 0;
      await tx.inventory.create({
        data: {
          productId: newProduct.id,
          currentStock: stockQty,
          reservedStock: 0,
          availableStock: stockQty,
          lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
          status: stockQty <= 0 ? 'OUT_OF_STOCK' : stockQty <= lowStockThreshold ? 'LOW_STOCK' : 'IN_STOCK',
        },
      });

      return newProduct;
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discount,
      brand,
      status,
      specifications,
      categoryId,
      stock,
      lowStockThreshold,
      images,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { vendor: true, inventory: true },
    });

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role === 'VENDOR' && existingProduct.vendorId !== req.user.vendor.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own products' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(price !== undefined && { price: parseFloat(price) }),
          ...(discount !== undefined && { discount: parseFloat(discount) }),
          ...(brand !== undefined && { brand }),
          ...(status && { status }),
          ...(categoryId && { categoryId }),
          ...(specifications !== undefined && { specifications }),
        },
      });

      if (stock !== undefined || lowStockThreshold !== undefined) {
        const curStock = stock !== undefined ? parseInt(stock, 10) : existingProduct.inventory.currentStock;
        const thresh = lowStockThreshold !== undefined ? parseInt(lowStockThreshold, 10) : existingProduct.inventory.lowStockThreshold;
        const reserved = existingProduct.inventory?.reservedStock || 0;
        const available = Math.max(0, curStock - reserved);

        let stockStatus = 'IN_STOCK';
        if (available <= 0) stockStatus = 'OUT_OF_STOCK';
        else if (available <= thresh) stockStatus = 'LOW_STOCK';

        await tx.inventory.upsert({
          where: { productId: id },
          create: {
            productId: id,
            currentStock: curStock,
            availableStock: available,
            reservedStock: reserved,
            lowStockThreshold: thresh,
            status: stockStatus,
          },
          update: {
            currentStock: curStock,
            availableStock: available,
            lowStockThreshold: thresh,
            status: stockStatus,
          },
        });
      }

      if (images && Array.isArray(images) && images.length > 0) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((img, idx) => ({
            productId: id,
            url: typeof img === 'string' ? img : img.url,
            altText: typeof img === 'string' ? name || existingProduct.name : img.altText,
            isPrimary: idx === 0,
          })),
        });
      }
    });

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { images: true, category: true, inventory: true },
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role === 'VENDOR' && existing.vendorId !== req.user.vendor.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own products' });
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, data: { products: [], categories: [], brands: [] } });
    }

    const query = q.trim();

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          name: { contains: query, mode: 'insensitive' },
        },
        select: { id: true, name: true, price: true, discount: true, brand: true, images: { take: 1 } },
        take: 6,
      }),
      prisma.category.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          isActive: true,
        },
        select: { id: true, name: true, slug: true },
        take: 3,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};
