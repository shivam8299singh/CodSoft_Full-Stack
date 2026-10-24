import { prisma, isDatabaseConnected } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';
import bcrypt from 'bcryptjs';
import { STUDENT_PASSWORD_HASH } from '../config/demoData.js';

export const getStudents = async (req, res) => {
  try {
    const { search = '', department = '', semester = '', sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    let students = [];

    if (isDatabaseConnected) {
      const where = {};
      if (department) where.departmentId = department;
      if (semester) where.semester = parseInt(semester);
      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { studentId: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ];
      }

      const total = await prisma.student.count({ where });
      const data = await prisma.student.findMany({
        where,
        include: {
          department: true,
          course: true,
          user: { select: { email: true, role: true, isActive: true } }
        },
        orderBy: { [sortBy]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      });

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } else {
      // In-memory filter/sort
      let filtered = dataStore.students.map(s => {
        const dept = dataStore.departments.find(d => d.id === s.departmentId);
        const course = dataStore.courses.find(c => c.id === s.courseId);
        const user = dataStore.users.find(u => u.id === s.userId) || {};
        return {
          ...s,
          department: dept,
          course,
          user: { email: user.email, role: user.role, isActive: user.isActive }
        };
      });

      if (department) {
        filtered = filtered.filter(s => s.departmentId === department);
      }
      if (semester) {
        filtered = filtered.filter(s => s.semester === parseInt(semester));
      }
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(s =>
          s.fullName.toLowerCase().includes(query) ||
          s.studentId.toLowerCase().includes(query) ||
          (s.user && s.user.email && s.user.email.toLowerCase().includes(query))
        );
      }

      // Sort
      filtered.sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        if (sortOrder.toLowerCase() === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });

      const total = filtered.length;
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

      return res.status(200).json({
        success: true,
        data: paginated,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students list.' });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected) {
      const student = await prisma.student.findFirst({
        where: { OR: [{ id }, { studentId: id }, { userId: id }] },
        include: {
          department: true,
          course: true,
          user: { select: { email: true, role: true, isActive: true, avatar: true } },
          attendance: { include: { subject: true }, orderBy: { date: 'desc' }, take: 30 },
          examResults: { include: { exam: { include: { subject: true } } } },
          fees: true,
          academicRecords: { orderBy: { semester: 'asc' } }
        }
      });

      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      return res.status(200).json({ success: true, data: student });
    } else {
      const student = dataStore.students.find(s => s.id === id || s.studentId === id || s.userId === id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      const dept = dataStore.departments.find(d => d.id === student.departmentId);
      const course = dataStore.courses.find(c => c.id === student.courseId);
      const user = dataStore.users.find(u => u.id === student.userId) || {};
      const attendance = dataStore.attendance
        .filter(a => a.studentId === student.id)
        .map(a => ({ ...a, subject: dataStore.subjects.find(s => s.id === a.subjectId) }));
      const examResults = dataStore.examResults
        .filter(r => r.studentId === student.id)
        .map(r => {
          const ex = dataStore.exams.find(e => e.id === r.examId);
          const sub = ex ? dataStore.subjects.find(s => s.id === ex.subjectId) : null;
          return { ...r, exam: { ...ex, subject: sub } };
        });
      const fees = dataStore.fees.filter(f => f.studentId === student.id);
      const academicRecords = dataStore.academicRecords.filter(ar => ar.studentId === student.id);

      return res.status(200).json({
        success: true,
        data: {
          ...student,
          department: dept,
          course,
          user: { email: user.email, role: user.role, isActive: user.isActive, avatar: user.avatar },
          attendance,
          examResults,
          fees,
          academicRecords
        }
      });
    }
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
  }
};

export const createStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      departmentId,
      courseId,
      semester = 1,
      password = 'student123'
    } = req.body;

    if (!fullName || !email || !departmentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email, Department, and Course are required fields.'
      });
    }

    const newStudentId = `STU-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isDatabaseConnected) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      }

      const created = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'STUDENT',
          student: {
            create: {
              studentId: newStudentId,
              fullName,
              phone,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              gender,
              address,
              departmentId,
              courseId,
              semester: parseInt(semester)
            }
          }
        },
        include: {
          student: {
            include: { department: true, course: true }
          }
        }
      });

      // Add default fee record
      await prisma.fee.create({
        data: {
          studentId: created.student.id,
          academicYear: '2025-2026',
          semester: parseInt(semester),
          totalAmount: 4500,
          paidAmount: 0,
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: 'PENDING'
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Student registered successfully.',
        data: created.student
      });
    } else {
      const existingUser = dataStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      }

      const userId = `user-s-${Date.now()}`;
      const studentId = `s-${Date.now()}`;

      dataStore.users.push({
        id: userId,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        createdAt: new Date()
      });

      const newStudent = {
        id: studentId,
        studentId: newStudentId,
        userId,
        fullName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        departmentId,
        courseId,
        semester: parseInt(semester),
        enrollmentDate: new Date(),
        profilePhoto: `https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80`,
        createdAt: new Date()
      };

      dataStore.students.unshift(newStudent);

      // Add default fee
      dataStore.fees.push({
        id: `fee-${Date.now()}`,
        studentId,
        academicYear: '2025-2026',
        semester: parseInt(semester),
        totalAmount: 4500,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        createdAt: new Date()
      });

      const dept = dataStore.departments.find(d => d.id === departmentId);
      const crs = dataStore.courses.find(c => c.id === courseId);

      return res.status(201).json({
        success: true,
        message: 'Student registered successfully.',
        data: { ...newStudent, department: dept, course: crs }
      });
    }
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, message: 'Failed to create student.' });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, dateOfBirth, gender, address, departmentId, courseId, semester } = req.body;

    if (isDatabaseConnected) {
      const updated = await prisma.student.update({
        where: { id },
        data: {
          fullName,
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          address,
          departmentId,
          courseId,
          semester: semester ? parseInt(semester) : undefined
        },
        include: { department: true, course: true }
      });

      return res.status(200).json({
        success: true,
        message: 'Student updated successfully.',
        data: updated
      });
    } else {
      const index = dataStore.students.findIndex(s => s.id === id || s.studentId === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      dataStore.students[index] = {
        ...dataStore.students[index],
        fullName: fullName || dataStore.students[index].fullName,
        phone: phone !== undefined ? phone : dataStore.students[index].phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : dataStore.students[index].dateOfBirth,
        gender: gender || dataStore.students[index].gender,
        address: address !== undefined ? address : dataStore.students[index].address,
        departmentId: departmentId || dataStore.students[index].departmentId,
        courseId: courseId || dataStore.students[index].courseId,
        semester: semester ? parseInt(semester) : dataStore.students[index].semester,
        updatedAt: new Date()
      };

      const updated = dataStore.students[index];
      const dept = dataStore.departments.find(d => d.id === updated.departmentId);
      const crs = dataStore.courses.find(c => c.id === updated.courseId);

      return res.status(200).json({
        success: true,
        message: 'Student updated successfully.',
        data: { ...updated, department: dept, course: crs }
      });
    }
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: 'Failed to update student.' });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected) {
      const student = await prisma.student.findUnique({ where: { id } });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }
      await prisma.user.delete({ where: { id: student.userId } });

      return res.status(200).json({
        success: true,
        message: 'Student record deleted successfully.'
      });
    } else {
      const index = dataStore.students.findIndex(s => s.id === id || s.studentId === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      const [removed] = dataStore.students.splice(index, 1);
      dataStore.users = dataStore.users.filter(u => u.id !== removed.userId);
      dataStore.attendance = dataStore.attendance.filter(a => a.studentId !== removed.id);
      dataStore.examResults = dataStore.examResults.filter(r => r.studentId !== removed.id);
      dataStore.fees = dataStore.fees.filter(f => f.studentId !== removed.id);
      dataStore.academicRecords = dataStore.academicRecords.filter(ar => ar.studentId !== removed.id);

      return res.status(200).json({
        success: true,
        message: 'Student record deleted successfully.'
      });
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
};
