import prisma from '../config/db.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const getMenuItems = async (req, res, next) => {
  try {
    const {
      search,
      category,
      vegetarian,
      available,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const where = {};

    // Availability filter
    if (available !== undefined && available !== '') {
      where.isAvailable = available === 'true';
    }

    // Vegetarian filter
    if (vegetarian !== undefined && vegetarian !== '') {
      where.isVegetarian = vegetarian === 'true';
    }

    // Category filter
    if (category && category !== 'all') {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Search
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { ingredients: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Sort order
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
    else if (sortBy === 'rating') orderBy = { rating: 'desc' };
    else if (sortBy === 'name') orderBy = { name: 'asc' };

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy,
    });

    return sendSuccess(res, 'Menu items retrieved successfully', menuItems);
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!item) {
      return sendError(res, 'Menu item not found', 404);
    }

    return sendSuccess(res, 'Menu item retrieved', item);
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      ingredients,
      imageUrl,
      isVegetarian,
      isAvailable,
      prepTime,
    } = req.body;

    if (!name || !description || price === undefined || !categoryId) {
      return sendError(res, 'Name, description, price, and category are required', 400);
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      return sendError(res, 'Category does not exist', 400);
    }

    const defaultImg =
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

    const item = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        categoryId,
        ingredients: ingredients ? ingredients.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : defaultImg,
        isVegetarian: Boolean(isVegetarian),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        prepTime: prepTime ? parseInt(prepTime, 10) : 20,
      },
      include: {
        category: true,
      },
    });

    return sendSuccess(res, 'Menu item created successfully', item, 201);
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      categoryId,
      ingredients,
      imageUrl,
      isVegetarian,
      isAvailable,
      prepTime,
    } = req.body;

    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Menu item not found', 404);
    }

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name.trim();
    if (description) dataToUpdate.description = description.trim();
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) return sendError(res, 'Specified category does not exist', 400);
      dataToUpdate.categoryId = categoryId;
    }
    if (ingredients !== undefined) dataToUpdate.ingredients = ingredients ? ingredients.trim() : null;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl ? imageUrl.trim() : existing.imageUrl;
    if (isVegetarian !== undefined) dataToUpdate.isVegetarian = Boolean(isVegetarian);
    if (isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(isAvailable);
    if (prepTime !== undefined) dataToUpdate.prepTime = parseInt(prepTime, 10);

    const updated = await prisma.menuItem.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
      },
    });

    return sendSuccess(res, 'Menu item updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const toggleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Menu item not found', 404);
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !existing.isAvailable },
      include: { category: true },
    });

    return sendSuccess(
      res,
      `Item is now ${updated.isAvailable ? 'available' : 'unavailable'}`,
      updated
    );
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Menu item not found', 404);
    }

    await prisma.menuItem.delete({ where: { id } });
    return sendSuccess(res, 'Menu item deleted successfully');
  } catch (error) {
    next(error);
  }
};
