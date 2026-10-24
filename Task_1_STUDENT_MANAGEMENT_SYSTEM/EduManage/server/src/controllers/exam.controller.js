import { prisma, isDatabaseConnected } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';
import { getGrade } from '../config/demoData.js';

export const getExams = async (req, res) => {
  try {
    const { courseId, semester, subjectId } = req.query;

    if (isDatabaseConnected) {
      const where = {};
      if (courseId) where.courseId = courseId;
      if (semester) where.semester = parseInt(semester);
      if (subjectId) where.subjectId = subjectId;

      const exams = await prisma.exam.findMany({
        where,
        include: {
          subject: true,
          course: true,
          results: { include: { student: true } }
        },
        orderBy: { date: 'asc' }
      });

      return res.status(200).json({ success: true, data: exams });
    } else {
      let filtered = dataStore.exams.map(e => ({
        ...e,
        subject: dataStore.subjects.find(s => s.id === e.subjectId),
        course: dataStore.courses.find(c => c.id === e.courseId),
        results: dataStore.examResults.filter(r => r.examId === e.id).map(r => ({
          ...r,
          student: dataStore.students.find(s => s.id === r.studentId)
        }))
      }));

      if (courseId) filtered = filtered.filter(e => e.courseId === courseId);
      if (semester) filtered = filtered.filter(e => e.semester === parseInt(semester));
      if (subjectId) filtered = filtered.filter(e => e.subjectId === subjectId);

      return res.status(200).json({ success: true, data: filtered });
    }
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exams.' });
  }
};

export const createExam = async (req, res) => {
  try {
    const { name, examType = 'MIDTERM', subjectId, courseId, semester = 1, date, maxMarks = 100, passingMarks = 40 } = req.body;

    if (!name || !subjectId || !courseId || !date) {
      return res.status(400).json({ success: false, message: 'Name, Subject, Course, and Date are required.' });
    }

    if (isDatabaseConnected) {
      const exam = await prisma.exam.create({
        data: {
          name,
          examType,
          subjectId,
          courseId,
          semester: parseInt(semester),
          date: new Date(date),
          maxMarks: parseInt(maxMarks),
          passingMarks: parseInt(passingMarks)
        },
        include: { subject: true, course: true }
      });

      return res.status(201).json({ success: true, message: 'Exam created successfully.', data: exam });
    } else {
      const id = `exam-${Date.now()}`;
      const newExam = {
        id,
        name,
        examType,
        subjectId,
        courseId,
        semester: parseInt(semester),
        date: new Date(date),
        maxMarks: parseInt(maxMarks),
        passingMarks: parseInt(passingMarks),
        createdAt: new Date()
      };

      dataStore.exams.push(newExam);
      const sub = dataStore.subjects.find(s => s.id === subjectId);
      const crs = dataStore.courses.find(c => c.id === courseId);

      return res.status(201).json({
        success: true,
        message: 'Exam created successfully.',
        data: { ...newExam, subject: sub, course: crs }
      });
    }
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ success: false, message: 'Failed to create exam.' });
  }
};

export const submitExamMarks = async (req, res) => {
  try {
    const { examId } = req.params;
    const { results } = req.body; // Array<{ studentId, marksObtained, remarks }>

    if (!Array.isArray(results)) {
      return res.status(400).json({ success: false, message: 'Results array is required.' });
    }

    if (isDatabaseConnected) {
      const exam = await prisma.exam.findUnique({ where: { id: examId } });
      if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

      for (const item of results) {
        const marks = parseFloat(item.marksObtained);
        const percentage = (marks / exam.maxMarks) * 100;
        const grade = getGrade(percentage);

        await prisma.examResult.upsert({
          where: { examId_studentId: { examId, studentId: item.studentId } },
          update: {
            marksObtained: marks,
            grade,
            remarks: item.remarks || (marks >= exam.passingMarks ? 'Passed' : 'Failed')
          },
          create: {
            examId,
            studentId: item.studentId,
            marksObtained: marks,
            grade,
            remarks: item.remarks || (marks >= exam.passingMarks ? 'Passed' : 'Failed')
          }
        });
      }

      return res.status(200).json({ success: true, message: `Marks submitted for ${results.length} students.` });
    } else {
      const exam = dataStore.exams.find(e => e.id === examId);
      if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

      results.forEach(item => {
        const marks = parseFloat(item.marksObtained);
        const percentage = (marks / exam.maxMarks) * 100;
        const grade = getGrade(percentage);

        const existingIdx = dataStore.examResults.findIndex(r => r.examId === examId && r.studentId === item.studentId);
        if (existingIdx !== -1) {
          dataStore.examResults[existingIdx].marksObtained = marks;
          dataStore.examResults[existingIdx].grade = grade;
          dataStore.examResults[existingIdx].remarks = item.remarks || (marks >= exam.passingMarks ? 'Passed' : 'Failed');
          dataStore.examResults[existingIdx].updatedAt = new Date();
        } else {
          dataStore.examResults.push({
            id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            examId,
            studentId: item.studentId,
            marksObtained: marks,
            grade,
            remarks: item.remarks || (marks >= exam.passingMarks ? 'Passed' : 'Failed'),
            createdAt: new Date()
          });
        }
      });

      return res.status(200).json({ success: true, message: `Marks submitted for ${results.length} students.` });
    }
  } catch (error) {
    console.error('Error submitting marks:', error);
    res.status(500).json({ success: false, message: 'Failed to record marks.' });
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (isDatabaseConnected) {
      const results = await prisma.examResult.findMany({
        where: { studentId },
        include: {
          exam: { include: { subject: true, course: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({ success: true, data: results });
    } else {
      const student = dataStore.students.find(s => s.id === studentId || s.userId === studentId);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

      const results = dataStore.examResults
        .filter(r => r.studentId === student.id)
        .map(r => {
          const ex = dataStore.exams.find(e => e.id === r.examId);
          const sub = ex ? dataStore.subjects.find(s => s.id === ex.subjectId) : null;
          const crs = ex ? dataStore.courses.find(c => c.id === ex.courseId) : null;
          return {
            ...r,
            exam: ex ? { ...ex, subject: sub, course: crs } : null
          };
        });

      return res.status(200).json({ success: true, data: results });
    }
  } catch (error) {
    console.error('Error getting student results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student results.' });
  }
};
