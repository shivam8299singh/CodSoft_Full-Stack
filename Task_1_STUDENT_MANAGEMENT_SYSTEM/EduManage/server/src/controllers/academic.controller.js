import { prisma, isDatabaseConnected } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';

export const getStudentAcademicRecords = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (isDatabaseConnected) {
      const student = await prisma.student.findFirst({
        where: { OR: [{ id: studentId }, { studentId }, { userId: studentId }] },
        include: { department: true, course: true }
      });

      if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

      const records = await prisma.academicRecord.findMany({
        where: { studentId: student.id },
        orderBy: { semester: 'asc' }
      });

      const examResults = await prisma.examResult.findMany({
        where: { studentId: student.id },
        include: { exam: { include: { subject: true } } }
      });

      return res.status(200).json({
        success: true,
        data: {
          student,
          records,
          examResults
        }
      });
    } else {
      const student = dataStore.students.find(s => s.id === studentId || s.studentId === studentId || s.userId === studentId);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

      const dept = dataStore.departments.find(d => d.id === student.departmentId);
      const course = dataStore.courses.find(c => c.id === student.courseId);

      const records = dataStore.academicRecords
        .filter(ar => ar.studentId === student.id)
        .sort((a, b) => a.semester - b.semester);

      const examResults = dataStore.examResults
        .filter(r => r.studentId === student.id)
        .map(r => {
          const ex = dataStore.exams.find(e => e.id === r.examId);
          const sub = ex ? dataStore.subjects.find(s => s.id === ex.subjectId) : null;
          return { ...r, exam: ex ? { ...ex, subject: sub } : null };
        });

      return res.status(200).json({
        success: true,
        data: {
          student: { ...student, department: dept, course },
          records,
          examResults
        }
      });
    }
  } catch (error) {
    console.error('Error getting academic records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch academic records.' });
  }
};

export const createAcademicRecord = async (req, res) => {
  try {
    const { studentId, semester, academicYear = '2025-2026', gpa, cgpa, totalCredits = 20, remarks } = req.body;

    if (!studentId || !semester || gpa === undefined) {
      return res.status(400).json({ success: false, message: 'studentId, semester, and gpa are required.' });
    }

    if (isDatabaseConnected) {
      const record = await prisma.academicRecord.upsert({
        where: {
          studentId_semester_academicYear: {
            studentId,
            semester: parseInt(semester),
            academicYear
          }
        },
        update: {
          gpa: parseFloat(gpa),
          cgpa: cgpa ? parseFloat(cgpa) : parseFloat(gpa),
          totalCredits: parseInt(totalCredits),
          remarks
        },
        create: {
          studentId,
          semester: parseInt(semester),
          academicYear,
          gpa: parseFloat(gpa),
          cgpa: cgpa ? parseFloat(cgpa) : parseFloat(gpa),
          totalCredits: parseInt(totalCredits),
          remarks
        }
      });

      return res.status(200).json({ success: true, message: 'Academic record saved.', data: record });
    } else {
      const existingIdx = dataStore.academicRecords.findIndex(ar =>
        ar.studentId === studentId && ar.semester === parseInt(semester) && ar.academicYear === academicYear
      );

      if (existingIdx !== -1) {
        dataStore.academicRecords[existingIdx].gpa = parseFloat(gpa);
        dataStore.academicRecords[existingIdx].cgpa = cgpa ? parseFloat(cgpa) : parseFloat(gpa);
        dataStore.academicRecords[existingIdx].totalCredits = parseInt(totalCredits);
        dataStore.academicRecords[existingIdx].remarks = remarks;
        dataStore.academicRecords[existingIdx].updatedAt = new Date();
      } else {
        dataStore.academicRecords.push({
          id: `ar-${Date.now()}`,
          studentId,
          semester: parseInt(semester),
          academicYear,
          gpa: parseFloat(gpa),
          cgpa: cgpa ? parseFloat(cgpa) : parseFloat(gpa),
          totalCredits: parseInt(totalCredits),
          remarks,
          createdAt: new Date()
        });
      }

      return res.status(200).json({ success: true, message: 'Academic record saved.' });
    }
  } catch (error) {
    console.error('Error creating academic record:', error);
    res.status(500).json({ success: false, message: 'Failed to record academic report.' });
  }
};
