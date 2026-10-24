import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const {
      role = 'CUSTOMER',
      email,
      password,
      name,
      phone,
      // Vendor fields
      ownerName,
      businessName,
      businessAddress,
      // Delivery Partner fields
      vehicleType,
      vehicleNumber,
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required fields.',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let createdUser;

    if (role === 'VENDOR') {
      if (!businessName || !businessAddress) {
        return res.status(400).json({
          success: false,
          message: 'Business name and business address are required for vendor registration.',
        });
      }

      createdUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            name: ownerName || name,
            phone,
            role: 'VENDOR',
          },
        });

        const vendor = await tx.vendor.create({
          data: {
            userId: user.id,
            businessName,
            ownerName: ownerName || name,
            email: email.toLowerCase().trim(),
            phone: phone || '',
            address: businessAddress,
            status: 'PENDING',
          },
        });

        // Create admin notification
        const admins = await tx.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
          await tx.notification.create({
            data: {
              userId: admin.id,
              title: 'New Vendor Registration',
              message: `${businessName} has applied for a vendor account. Pending approval.`,
              type: 'VENDOR',
              link: '/admin/vendors',
            },
          });
        }

        return { ...user, vendor };
      });
    } else if (role === 'DELIVERY_PARTNER') {
      createdUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            name,
            phone,
            role: 'DELIVERY_PARTNER',
          },
        });

        const deliveryPartner = await tx.deliveryPartner.create({
          data: {
            userId: user.id,
            name,
            phone: phone || '',
            vehicleType: vehicleType || 'Motorcycle',
            vehicleNumber: vehicleNumber || null,
          },
        });

        return { ...user, deliveryPartner };
      });
    } else {
      // Default CUSTOMER
      createdUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            name,
            phone,
            role: 'CUSTOMER',
          },
        });

        // Initialize cart & wishlist for the user
        await tx.cart.create({ data: { userId: user.id } });
        await tx.wishlist.create({ data: { userId: user.id } });

        await tx.notification.create({
          data: {
            userId: user.id,
            title: 'Welcome to MarketHub!',
            message: 'Your account has been created successfully. Explore thousands of products from certified multi-vendors.',
            type: 'INFO',
          },
        });

        return user;
      });
    }

    const token = generateToken({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });

    const { password: _, ...userWithoutPassword } = createdUser;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        vendor: true,
        deliveryPartner: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended or deactivated. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vendor: true,
        deliveryPartner: true,
        addresses: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
      },
      include: {
        vendor: true,
        deliveryPartner: true,
        addresses: true,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
