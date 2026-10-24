import { prisma, isDatabaseConnected } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';
import bcrypt from 'bcryptjs';

export const getTeachers = async (req, res) => {
  try {
    const { department = '', search = '' } = req.query;

    if (isDatabaseConnected) {
      const where = {};
      if (department) where.departmentId = department;
      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { teacherId: { contains: search, mode: 'insensitive' } }
        ];
      }

      const teachers = await prisma.teacher.findMany({
        where,
        include: {
          department: true,
          subjects: true,
          user: { select: { email: true, isActive: true, avatar: true } }
        },
        orderBy: { fullName: 'asc' }
      });

      return res.status(200).json({ success: true, data: teachers });
    } else {
      let filtered = dataStore.teachers.map(t => {
        const dept = dataStore.departments.find(d => d.id === t.departmentId);
        const subs = dataStore.subjects.filter(s => s.teacherId === t.userId);
        const user = dataStore.users.find(u => u.id === t.userId) || {};
        return {
          ...t,
          department: dept,
          subjects: subs,
          user: { email: user.email, isActive: user.isActive, avatar: user.avatar }
        };
      });

      if (department) {
        filtered = filtered.filter(t => t.departmentId === department);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(t =>
          t.fullName.toLowerCase().includes(q) ||
          t.teacherId.toLowerCase().includes(q)
        );
      }

      return res.status(200).json({ success: true, data: filtered });
    }
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers.' });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected) {
      const teacher = await prisma.teacher.findFirst({
        where: { OR: [{ id }, { teacherId: id }, { userId: id }] },
        include: {
          department: true,
          subjects: { include: { course: true } },
          user: { select: { email: true, isActive: true, avatar: true } }
        }
      });
      if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });
      return res.status(200).json({ success: true, data: teacher });
    } else {
      const teacher = dataStore.teachers.find(t => t.id === id || t.teacherId === id || t.userId === id);
      if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });

      const dept = dataStore.departments.find(d => d.id === teacher.departmentId);
      const subs = dataStore.subjects
        .filter(s => s.teacherId === teacher.userId)
        .map(s => ({ ...s, course: dataStore.courses.find(c => c.id === s.courseId) }));
      const user = dataStore.users.find(u => u.id === teacher.userId) || {};

      return res.status(200).json({
        success: true,
        data: {
          ...teacher,
          department: dept,
          subjects: subs,
          user: { email: user.email, isActive: user.isActive, avatar: user.avatar }
        }
      });
    }
  } catch (error) {
    console.error('Error getting teacher by id:', error);
    res.status(500).json({ success: false, message: 'Failed to get teacher.' });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { fullName, email, phone, departmentId, qualification, password = 'teacher123' } = req.body;

    if (!fullName || !email || !departmentId) {
      return res.status(400).json({ success: false, message: 'Full Name, Email, and Department are required.' });
    }

    const teacherId = `TCH-${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isDatabaseConnected) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ success: false, message: 'Email is already registered.' });

      const created = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'TEACHER',
          teacher: {
            create: {
              teacherId,
              fullName,
              phone,
              departmentId,
              qualification,
              joiningDate: new Date()
            }
          }
        },
        include: { teacher: { include: { department: true } } }
      });

      return res.status(201).json({ success: true, message: 'Teacher added successfully.', data: created.teacher });
    } else {
      const existing = dataStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) return res.status(400).json({ success: false, message: 'Email is already registered.' });

      const userId = `user-t-${Date.now()}`;
      const id = `t-${Date.now()}`;

      dataStore.users.push({
        id: userId,
        email,
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true,
        createdAt: new Date()
      });

      const newTeacher = {
        id,
        teacherId,
        userId,
        fullName,
        phone,
        departmentId,
        qualification,
        joiningDate: new Date(),
        createdAt: new Date()
      };

      dataStore.teachers.unshift(newTeacher);
      const dept = dataStore.departments.find(d => d.id === departmentId);

      return res.status(201).json({
        success: true,
        message: 'Teacher added successfully.',
        data: { ...newTeacher, department: dept, subjects: [] }
      });
    }
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ success: false, message: 'Failed to create teacher.' });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, departmentId, qualification } = req.body;

    if (isDatabaseConnected) {
      const updated = await prisma.teacher.update({
        where: { id },
        data: { fullName, phone, departmentId, qualification },
        include: { department: true, subjects: true }
      });
      return res.status(200).json({ success: true, message: 'Teacher updated successfully.', data: updated });
    } else {
      const index = dataStore.teachers.findIndex(t => t.id === id || t.teacherId === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Teacher not found.' });

      dataStore.teachers[index] = {
        ...dataStore.teachers[index],
        fullName: fullName || dataStore.teachers[index].fullName,
        phone: phone !== undefined ? phone : dataStore.teachers[index].phone,
        departmentId: departmentId || dataStore.teachers[index].departmentId,
        qualification: qualification || dataStore.teachers[index].qualification,
        updatedAt: new Date()
      };

      const updated = dataStore.teachers[index];
      const dept = dataStore.departments.find(d => d.id === updated.departmentId);
      const subs = dataStore.subjects.filter(s => s.teacherId === updated.userId);

      return res.status(200).json({
        success: true,
        message: 'Teacher updated successfully.',
        data: { ...updated, department: dept, subjects: subs }
      });
    }
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ success: false, message: 'Failed to update teacher.' });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected) {
      const teacher = await prisma.teacher.findUnique({ where: { id } });
      if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });
      await prisma.user.delete({ where: { id: teacher.userId } });
      return res.status(200).json({ success: true, message: 'Teacher deleted successfully.' });
    } else {
      const index = dataStore.teachers.findIndex(t => t.id === id || t.teacherId === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Teacher not found.' });

      const [removed] = dataStore.teachers.splice(index, 1);
      dataStore.users = dataStore.users.filter(u => u.id !== removed.userId);
      // Unassign subjects
      dataStore.subjects.forEach(s => {
        if (s.teacherId === removed.userId) s.teacherId = null;
      });

      return res.status(200).json({ success: true, message: 'Teacher deleted successfully.' });
    }
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ success: false, message: 'Failed to delete teacher.' });
  }
};

export const assignSubjects = async (req, res) => {
  try {
    const { id } = req.params; // teacher id or userId
    const { subjectIds } = req.body; // array of subject ids

    if (!Array.isArray(subjectIds)) {
      return res.status(400).json({ success: false, message: 'subjectIds must be an array.' });
    }

    if (isDatabaseConnected) {
      const teacher = await prisma.teacher.findFirst({
        where: { OR: [{ id }, { userId: id }] }
      });
      if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });

      // Reset existing and assign
      await prisma.subject.updateMany({
        where: { teacherId: teacher.userId },
        data: { teacherId: null }
      });
      await prisma.subject.updateMany({
        where: { id: { in: subjectIds } },
        data: { teacherId: teacher.userId }
      });

      return res.status(200).json({ success: true, message: 'Subjects assigned successfully.' });
    } else {
      const teacher = dataStore.teachers.find(t => t.id === id || t.userId === id);
      if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });

      dataStore.subjects.forEach(s => {
        if (s.teacherId === teacher.userId) s.teacherId = null;
        if (subjectIds.includes(s.id)) s.teacherId = teacher.userId;
      });

      return res.status(200).json({ success: true, message: 'Subjects assigned successfully.' });
    }
  } catch (error) {
    console.error('Error assigning subjects:', error);
    res.status(500).json({ success: false, message: 'Failed to assign subjects.' });
  }
};
