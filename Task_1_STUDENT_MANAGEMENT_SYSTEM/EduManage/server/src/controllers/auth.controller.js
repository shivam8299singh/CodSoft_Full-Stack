import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, isDatabaseConnected } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'edumanage_jwt_super_secret_key_2026_educational_system';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    let user = null;

    if (isDatabaseConnected) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
          adminProfile: true,
          teacher: {
            include: { department: true, subjects: true }
          },
          student: {
            include: { department: true, course: true }
          }
        }
      });
    } else {
      user = dataStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (user) {
        const adminProfile = dataStore.adminProfiles.find(ap => ap.userId === user.id);
        const teacher = dataStore.teachers.find(t => t.userId === user.id);
        const student = dataStore.students.find(s => s.userId === user.id);

        let teacherWithRelations = null;
        if (teacher) {
          const department = dataStore.departments.find(d => d.id === teacher.departmentId);
          const subjects = dataStore.subjects.filter(s => s.teacherId === teacher.userId);
          teacherWithRelations = { ...teacher, department, subjects };
        }

        let studentWithRelations = null;
        if (student) {
          const department = dataStore.departments.find(d => d.id === student.departmentId);
          const course = dataStore.courses.find(c => c.id === student.courseId);
          studentWithRelations = { ...student, department, course };
        }

        user = {
          ...user,
          adminProfile,
          teacher: teacherWithRelations,
          student: studentWithRelations
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User with this email does not exist.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact administration.'
      });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: userSafe
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again later.'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.'
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email address.'
    });
  }

  // Demo response
  return res.status(200).json({
    success: true,
    message: `Password reset instructions have been dispatched to ${email}. (Demo note: For instant testing, use demo passwords admin123, teacher123, student123).`
  });
};
