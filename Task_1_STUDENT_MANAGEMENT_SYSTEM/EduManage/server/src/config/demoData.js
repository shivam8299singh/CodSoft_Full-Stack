import bcrypt from 'bcryptjs';

// Pre-hashed passwords for 'admin123', 'teacher123', 'student123'
const salt = bcrypt.genSaltSync(10);
export const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', salt);
export const TEACHER_PASSWORD_HASH = bcrypt.hashSync('teacher123', salt);
export const STUDENT_PASSWORD_HASH = bcrypt.hashSync('student123', salt);

export const departments = [
  {
    id: 'dept-1',
    code: 'CSE',
    name: 'Computer Science & Engineering',
    description: 'Department of Computer Science and Software Engineering'
  },
  {
    id: 'dept-2',
    code: 'EEE',
    name: 'Electrical & Electronics Engineering',
    description: 'Department of Electrical, Electronics and Power Engineering'
  },
  {
    id: 'dept-3',
    code: 'BBA',
    name: 'Business Administration',
    description: 'Department of Management, Finance and Business Studies'
  }
];

export const courses = [
  {
    id: 'course-1',
    code: 'CS-BTECH',
    name: 'B.Tech in Computer Science',
    departmentId: 'dept-1',
    durationYears: 4,
    totalSemesters: 8
  },
  {
    id: 'course-2',
    code: 'EE-BTECH',
    name: 'B.Tech in Electrical Engineering',
    departmentId: 'dept-2',
    durationYears: 4,
    totalSemesters: 8
  },
  {
    id: 'course-3',
    code: 'BBA-BACHELOR',
    name: 'Bachelor of Business Administration',
    departmentId: 'dept-3',
    durationYears: 3,
    totalSemesters: 6
  }
];

export const teachers = [
  {
    userId: 'user-t1',
    email: 'teacher@edumanage.com',
    fullName: 'Dr. Alan Vance',
    phone: '+1 555-0101',
    teacherId: 'TCH-1001',
    departmentId: 'dept-1',
    qualification: 'Ph.D. in Computer Science (MIT)',
    joiningDate: new Date('2021-08-15')
  },
  {
    userId: 'user-t2',
    email: 'sarah.jenkins@edumanage.com',
    fullName: 'Prof. Sarah Jenkins',
    phone: '+1 555-0102',
    teacherId: 'TCH-1002',
    departmentId: 'dept-1',
    qualification: 'M.Tech in Artificial Intelligence',
    joiningDate: new Date('2022-01-10')
  },
  {
    userId: 'user-t3',
    email: 'david.ross@edumanage.com',
    fullName: 'Dr. David Ross',
    phone: '+1 555-0103',
    teacherId: 'TCH-1003',
    departmentId: 'dept-2',
    qualification: 'Ph.D. in Power Electronics',
    joiningDate: new Date('2020-07-20')
  },
  {
    userId: 'user-t4',
    email: 'emily.clark@edumanage.com',
    fullName: 'Dr. Emily Clark',
    phone: '+1 555-0104',
    teacherId: 'TCH-1004',
    departmentId: 'dept-2',
    qualification: 'M.S. in Embedded Systems',
    joiningDate: new Date('2023-02-01')
  },
  {
    userId: 'user-t5',
    email: 'robert.miller@edumanage.com',
    fullName: 'Prof. Robert Miller',
    phone: '+1 555-0105',
    teacherId: 'TCH-1005',
    departmentId: 'dept-3',
    qualification: 'MBA in Finance & Strategy',
    joiningDate: new Date('2019-09-12')
  }
];

export const subjects = [
  {
    id: 'sub-1',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    credits: 4,
    semester: 3,
    courseId: 'course-1',
    teacherId: 'user-t1'
  },
  {
    id: 'sub-2',
    code: 'CS202',
    name: 'Database Management Systems',
    credits: 4,
    semester: 3,
    courseId: 'course-1',
    teacherId: 'user-t1'
  },
  {
    id: 'sub-3',
    code: 'CS203',
    name: 'Operating Systems',
    credits: 3,
    semester: 3,
    courseId: 'course-1',
    teacherId: 'user-t2'
  },
  {
    id: 'sub-4',
    code: 'CS204',
    name: 'Computer Networks',
    credits: 3,
    semester: 3,
    courseId: 'course-1',
    teacherId: 'user-t2'
  },
  {
    id: 'sub-5',
    code: 'EE201',
    name: 'Electric Circuits & Network Theory',
    credits: 4,
    semester: 3,
    courseId: 'course-2',
    teacherId: 'user-t3'
  },
  {
    id: 'sub-6',
    code: 'EE202',
    name: 'Digital Electronics & Microprocessors',
    credits: 4,
    semester: 3,
    courseId: 'course-2',
    teacherId: 'user-t4'
  },
  {
    id: 'sub-7',
    code: 'BBA201',
    name: 'Financial Accounting & Reporting',
    credits: 3,
    semester: 3,
    courseId: 'course-3',
    teacherId: 'user-t5'
  },
  {
    id: 'sub-8',
    code: 'BBA202',
    name: 'Principles of Marketing',
    credits: 3,
    semester: 3,
    courseId: 'course-3',
    teacherId: 'user-t5'
  }
];

// Helper to generate 30 students
export const rawStudents = [
  { name: 'Alex Morgan', gender: 'Male', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Sophia Chen', gender: 'Female', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Liam Patel', gender: 'Male', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Emma Watson', gender: 'Female', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Noah Davis', gender: 'Male', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Olivia Taylor', gender: 'Female', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Ethan Brown', gender: 'Male', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Ava Wilson', gender: 'Female', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Lucas Martinez', gender: 'Male', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Mia Anderson', gender: 'Female', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Jackson Lee', gender: 'Male', dept: 'dept-1', course: 'course-1', sem: 3 },
  { name: 'Isabella Garcia', gender: 'Female', dept: 'dept-1', course: 'course-1', sem: 3 },

  { name: 'Aiden Wright', gender: 'Male', dept: 'dept-2', course: 'course-2', sem: 3 },
  { name: 'Harper Scott', gender: 'Female', dept: 'dept-2', course: 'course-2', sem: 3 },
  { name: 'Benjamin Green', gender: 'Male', dept: 'dept-2', course: 'course-2', sem: 3 },
  { name: 'Evelyn Adams', gender: 'Female', dept: 'dept-2', course: 'course-2', sem: 3 },
  { name: 'Daniel Nelson', gender: 'Male', dept: 'dept-2', course: 'course-2', sem: 3 },
  { name: 'Abigail Baker', gender: 'Female', dept: 'dept-2', course: 'course-2', sem: 3 },
  { name: 'Matthew Hall', gender: 'Male', dept: 'dept-2', course: 'course-2', sem: 3 },
  { name: 'Ella Rivera', gender: 'Female', dept: 'dept-2', course: 'course-2', sem: 3 },

  { name: 'James Campbell', gender: 'Male', dept: 'dept-3', course: 'course-3', sem: 3 },
  { name: 'Charlotte Mitchell', gender: 'Female', dept: 'dept-3', course: 'course-3', sem: 3 },
  { name: 'Henry Roberts', gender: 'Male', dept: 'dept-3', course: 'course-3', sem: 3 },
  { name: 'Amelia Carter', gender: 'Female', dept: 'dept-3', course: 'course-3', sem: 3 },
  { name: 'Alexander Phillips', gender: 'Male', dept: 'dept-3', course: 'course-3', sem: 3 },
  { name: 'Scarlett Evans', gender: 'Female', dept: 'dept-3', course: 'course-3', sem: 3 },
  { name: 'Sebastian Turner', gender: 'Male', dept: 'dept-3', course: 'course-3', sem: 3 },
  { name: 'Grace Torres', gender: 'Female', dept: 'dept-3', course: 'course-3', sem: 3 },
  { name: 'Jack Parker', gender: 'Male', dept: 'dept-3', course: 'course-3', sem: 3 },
  { name: 'Chloe Edwards', gender: 'Female', dept: 'dept-3', course: 'course-3', sem: 3 },
];

export const students = rawStudents.map((s, idx) => {
  const num = idx + 1;
  const isPrimary = num === 1;
  const email = isPrimary ? 'student@edumanage.com' : `${s.name.toLowerCase().replace(' ', '.')}@edumanage.com`;
  return {
    userId: `user-s${num}`,
    studentId: `STU-2024-${1000 + num}`,
    fullName: s.name,
    email: email,
    phone: `+1 555-${(2000 + num).toString()}`,
    dateOfBirth: new Date(`2004-${(idx % 12) + 1}-15`),
    gender: s.gender,
    address: `${100 + num} Academic Way, University City`,
    departmentId: s.dept,
    courseId: s.course,
    semester: s.sem,
    enrollmentDate: new Date('2024-08-01'),
    profilePhoto: `https://images.unsplash.com/photo-${1534528741775 + (idx * 1000)}?w=150&auto=format&fit=crop&q=80`
  };
});

export const exams = [
  {
    id: 'exam-1',
    name: 'DSA Midterm Examination',
    examType: 'MIDTERM',
    subjectId: 'sub-1',
    courseId: 'course-1',
    semester: 3,
    date: new Date('2025-10-15'),
    maxMarks: 100,
    passingMarks: 40
  },
  {
    id: 'exam-2',
    name: 'DBMS Midterm Examination',
    examType: 'MIDTERM',
    subjectId: 'sub-2',
    courseId: 'course-1',
    semester: 3,
    date: new Date('2025-10-18'),
    maxMarks: 100,
    passingMarks: 40
  },
  {
    id: 'exam-3',
    name: 'Operating Systems Quiz 1',
    examType: 'QUIZ',
    subjectId: 'sub-3',
    courseId: 'course-1',
    semester: 3,
    date: new Date('2025-09-25'),
    maxMarks: 50,
    passingMarks: 20
  },
  {
    id: 'exam-4',
    name: 'Electric Circuits Midterm',
    examType: 'MIDTERM',
    subjectId: 'sub-5',
    courseId: 'course-2',
    semester: 3,
    date: new Date('2025-10-14'),
    maxMarks: 100,
    passingMarks: 40
  },
  {
    id: 'exam-5',
    name: 'Financial Accounting Midterm',
    examType: 'MIDTERM',
    subjectId: 'sub-7',
    courseId: 'course-3',
    semester: 3,
    date: new Date('2025-10-16'),
    maxMarks: 100,
    passingMarks: 40
  }
];

// Helper to calculate Grade
export const getGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};
