import { prisma, isDatabaseConnected } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';

export const getAttendance = async (req, res) => {
  try {
    const { subjectId, date, courseId } = req.query;

    if (isDatabaseConnected) {
      const where = {};
      if (subjectId) where.subjectId = subjectId;
      if (date) {
        const queryDate = new Date(date);
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
        where.date = { gte: startOfDay, lte: endOfDay };
      }

      const records = await prisma.attendance.findMany({
        where,
        include: {
          student: { include: { course: true, department: true } },
          subject: true
        },
        orderBy: { date: 'desc' }
      });

      return res.status(200).json({ success: true, data: records });
    } else {
      let filtered = dataStore.attendance.map(a => {
        const student = dataStore.students.find(s => s.id === a.studentId);
        const subject = dataStore.subjects.find(s => s.id === a.subjectId);
        const course = student ? dataStore.courses.find(c => c.id === student.courseId) : null;
        const dept = student ? dataStore.departments.find(d => d.id === student.departmentId) : null;
        return {
          ...a,
          student: student ? { ...student, course, department: dept } : null,
          subject
        };
      });

      if (subjectId) filtered = filtered.filter(a => a.subjectId === subjectId);
      if (date) {
        const dStr = new Date(date).toISOString().split('T')[0];
        filtered = filtered.filter(a => new Date(a.date).toISOString().split('T')[0] === dStr);
      }
      if (courseId) {
        filtered = filtered.filter(a => a.student && a.student.courseId === courseId);
      }

      return res.status(200).json({ success: true, data: filtered });
    }
  } catch (error) {
    console.error('Error getting attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance.' });
  }
};

export const markAttendanceBatch = async (req, res) => {
  try {
    const { subjectId, date, attendances } = req.body;
    // attendances: Array<{ studentId, status, remarks }>

    if (!subjectId || !date || !Array.isArray(attendances)) {
      return res.status(400).json({
        success: false,
        message: 'subjectId, date, and attendances array are required.'
      });
    }

    const attDate = new Date(date);

    if (isDatabaseConnected) {
      for (const item of attendances) {
        const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

        const existing = await prisma.attendance.findFirst({
          where: {
            studentId: item.studentId,
            subjectId,
            date: { gte: startOfDay, lte: endOfDay }
          }
        });

        if (existing) {
          await prisma.attendance.update({
            where: { id: existing.id },
            data: { status: item.status, remarks: item.remarks }
          });
        } else {
          await prisma.attendance.create({
            data: {
              studentId: item.studentId,
              subjectId,
              date: attDate,
              status: item.status,
              remarks: item.remarks
            }
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Attendance marked successfully for ${attendances.length} students.`
      });
    } else {
      const dStr = attDate.toISOString().split('T')[0];

      attendances.forEach(item => {
        const existingIdx = dataStore.attendance.findIndex(a =>
          a.studentId === item.studentId &&
          a.subjectId === subjectId &&
          new Date(a.date).toISOString().split('T')[0] === dStr
        );

        if (existingIdx !== -1) {
          dataStore.attendance[existingIdx].status = item.status;
          dataStore.attendance[existingIdx].remarks = item.remarks;
          dataStore.attendance[existingIdx].updatedAt = new Date();
        } else {
          dataStore.attendance.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            studentId: item.studentId,
            subjectId,
            date: attDate,
            status: item.status,
            remarks: item.remarks,
            createdAt: new Date()
          });
        }
      });

      return res.status(200).json({
        success: true,
        message: `Attendance marked successfully for ${attendances.length} students.`
      });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to submit attendance.' });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (isDatabaseConnected) {
      const records = await prisma.attendance.findMany({
        where: { studentId },
        include: { subject: true },
        orderBy: { date: 'desc' }
      });

      const total = records.length;
      const present = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
      const percentage = total > 0 ? +((present / total) * 100).toFixed(1) : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalSessions: total,
          attendedSessions: present,
          overallPercentage: percentage,
          records
        }
      });
    } else {
      const student = dataStore.students.find(s => s.id === studentId || s.userId === studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      const records = dataStore.attendance
        .filter(a => a.studentId === student.id)
        .map(a => ({
          ...a,
          subject: dataStore.subjects.find(s => s.id === a.subjectId)
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const total = records.length;
      const present = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
      const percentage = total > 0 ? +((present / total) * 100).toFixed(1) : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalSessions: total,
          attendedSessions: present,
          overallPercentage: percentage,
          records
        }
      });
    }
  } catch (error) {
    console.error('Error getting student attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student attendance.' });
  }
};
