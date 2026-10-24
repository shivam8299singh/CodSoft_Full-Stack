import prisma from '../config/db.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        menuItems: true,
      },
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, 'Category retrieved', category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return sendError(res, 'Category name is required', 400);
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }],
      },
    });

    if (existing) {
      return sendError(res, 'A category with this name or slug already exists', 400);
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        image: image?.trim() || null,
      },
    });

    return sendSuccess(res, 'Category created successfully', category, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Category not found', 404);
    }

    const dataToUpdate = {};
    if (name) {
      dataToUpdate.name = name.trim();
      dataToUpdate.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;
    if (image !== undefined) dataToUpdate.image = image ? image.trim() : null;

    const category = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
    });

    return sendSuccess(res, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { menuItems: true } } },
    });

    if (!existing) {
      return sendError(res, 'Category not found', 404);
    }

    await prisma.category.delete({ where: { id } });

    return sendSuccess(res, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
