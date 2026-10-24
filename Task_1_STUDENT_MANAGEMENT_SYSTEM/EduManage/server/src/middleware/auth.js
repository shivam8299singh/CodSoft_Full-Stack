import jwt from 'jsonwebtoken';
import { prisma, isDatabaseConnected } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'edumanage_jwt_super_secret_key_2026_educational_system';

    const decoded = jwt.verify(token, secret);

    let user = null;

    if (isDatabaseConnected) {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          adminProfile: true,
          teacher: true,
          student: true
        }
      });
    } else {
      user = dataStore.users.find(u => u.id === decoded.id);
      if (user) {
        // Attach profile
        const adminProfile = dataStore.adminProfiles.find(ap => ap.userId === user.id);
        const teacher = dataStore.teachers.find(t => t.userId === user.id);
        const student = dataStore.students.find(s => s.userId === user.id);
        user = { ...user, adminProfile, teacher, student };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the administrator.'
      });
    }

    // Attach user to request (omit password hash)
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${roles.join(', ')}]`
      });
    }
    next();
  };
};
