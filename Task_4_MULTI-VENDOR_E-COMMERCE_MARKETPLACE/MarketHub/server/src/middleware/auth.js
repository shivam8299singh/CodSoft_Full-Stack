import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        vendor: true,
        deliveryPartner: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.',
      });
    }

    // Attach user to req
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid token. Please log in again.',
      });
    }
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { vendor: true, deliveryPartner: true },
      });
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch {
    // Continue as guest if token is invalid
    next();
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] roles.`,
      });
    }

    // If role is VENDOR, ensure vendor profile is approved
    if (req.user.role === 'VENDOR') {
      if (!req.user.vendor) {
        return res.status(403).json({
          success: false,
          message: 'Vendor profile not found.',
        });
      }
      if (req.user.vendor.status !== 'APPROVED') {
        return res.status(403).json({
          success: false,
          message: `Your vendor account status is ${req.user.vendor.status}. Marketplace operations are restricted until approved.`,
          vendorStatus: req.user.vendor.status,
        });
      }
    }

    next();
  };
};
