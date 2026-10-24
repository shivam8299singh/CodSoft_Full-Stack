import { prisma, isDatabaseConnected } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';

// --- DEPARTMENTS ---
export const getDepartments = async (req, res) => {
  try {
    if (isDatabaseConnected) {
      const depts = await prisma.department.findMany({
        include: { courses: true, teachers: true, students: true },
        orderBy: { name: 'asc' }
      });
      return res.status(200).json({ success: true, data: depts });
    } else {
      const depts = dataStore.departments.map(d => ({
        ...d,
        courses: dataStore.courses.filter(c => c.departmentId === d.id),
        teachers: dataStore.teachers.filter(t => t.departmentId === d.id),
        students: dataStore.students.filter(s => s.departmentId === d.id)
      }));
      return res.status(200).json({ success: true, data: depts });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) return res.status(400).json({ success: false, message: 'Code and Name are required.' });

    if (isDatabaseConnected) {
      const dept = await prisma.department.create({ data: { code, name, description } });
      return res.status(201).json({ success: true, data: dept });
    } else {
      const id = `dept-${Date.now()}`;
      const newDept = { id, code, name, description, createdAt: new Date() };
      dataStore.departments.push(newDept);
      return res.status(201).json({ success: true, data: newDept });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create department.' });
  }
};

// --- COURSES ---
export const getCourses = async (req, res) => {
  try {
    const { departmentId } = req.query;

    if (isDatabaseConnected) {
      const where = departmentId ? { departmentId } : {};
      const courses = await prisma.course.findMany({
        where,
        include: { department: true, subjects: true, students: true },
        orderBy: { name: 'asc' }
      });
      return res.status(200).json({ success: true, data: courses });
    } else {
      let filtered = dataStore.courses.map(c => ({
        ...c,
        department: dataStore.departments.find(d => d.id === c.departmentId),
        subjects: dataStore.subjects.filter(s => s.courseId === c.id),
        students: dataStore.students.filter(s => s.courseId === c.id)
      }));
      if (departmentId) filtered = filtered.filter(c => c.departmentId === departmentId);
      return res.status(200).json({ success: true, data: filtered });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses.' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { code, name, departmentId, durationYears = 4, totalSemesters = 8 } = req.body;
    if (!code || !name || !departmentId) {
      return res.status(400).json({ success: false, message: 'Code, Name, and Department are required.' });
    }

    if (isDatabaseConnected) {
      const course = await prisma.course.create({
        data: {
          code,
          name,
          departmentId,
          durationYears: parseInt(durationYears),
          totalSemesters: parseInt(totalSemesters)
        },
        include: { department: true }
      });
      return res.status(201).json({ success: true, data: course });
    } else {
      const id = `course-${Date.now()}`;
      const newCourse = {
        id,
        code,
        name,
        departmentId,
        durationYears: parseInt(durationYears),
        totalSemesters: parseInt(totalSemesters),
        createdAt: new Date()
      };
      dataStore.courses.push(newCourse);
      const dept = dataStore.departments.find(d => d.id === departmentId);
      return res.status(201).json({ success: true, data: { ...newCourse, department: dept } });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create course.' });
  }
};

// --- SUBJECTS ---
export const getSubjects = async (req, res) => {
  try {
    const { courseId, semester, teacherId } = req.query;

    if (isDatabaseConnected) {
      const where = {};
      if (courseId) where.courseId = courseId;
      if (semester) where.semester = parseInt(semester);
      if (teacherId) where.teacherId = teacherId;

      const subjects = await prisma.subject.findMany({
        where,
        include: {
          course: { include: { department: true } },
          teacher: true
        },
        orderBy: { code: 'asc' }
      });
      return res.status(200).json({ success: true, data: subjects });
    } else {
      let filtered = dataStore.subjects.map(s => {
        const course = dataStore.courses.find(c => c.id === s.courseId);
        const dept = course ? dataStore.departments.find(d => d.id === course.departmentId) : null;
        const teacher = dataStore.teachers.find(t => t.userId === s.teacherId);
        return {
          ...s,
          course: course ? { ...course, department: dept } : null,
          teacher
        };
      });

      if (courseId) filtered = filtered.filter(s => s.courseId === courseId);
      if (semester) filtered = filtered.filter(s => s.semester === parseInt(semester));
      if (teacherId) filtered = filtered.filter(s => s.teacherId === teacherId);

      return res.status(200).json({ success: true, data: filtered });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { code, name, credits = 3, semester = 1, courseId, teacherId = null } = req.body;
    if (!code || !name || !courseId) {
      return res.status(400).json({ success: false, message: 'Code, Name, and Course are required.' });
    }

    if (isDatabaseConnected) {
      const subject = await prisma.subject.create({
        data: {
          code,
          name,
          credits: parseInt(credits),
          semester: parseInt(semester),
          courseId,
          teacherId: teacherId || null
        },
        include: { course: true, teacher: true }
      });
      return res.status(201).json({ success: true, data: subject });
    } else {
      const id = `sub-${Date.now()}`;
      const newSubject = {
        id,
        code,
        name,
        credits: parseInt(credits),
        semester: parseInt(semester),
        courseId,
        teacherId: teacherId || null,
        createdAt: new Date()
      };
      dataStore.subjects.push(newSubject);
      const course = dataStore.courses.find(c => c.id === courseId);
      const teacher = teacherId ? dataStore.teachers.find(t => t.userId === teacherId) : null;
      return res.status(201).json({ success: true, data: { ...newSubject, course, teacher } });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create subject.' });
  }
};
