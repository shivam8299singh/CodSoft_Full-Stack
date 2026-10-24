import {
  ADMIN_PASSWORD_HASH,
  TEACHER_PASSWORD_HASH,
  STUDENT_PASSWORD_HASH,
  departments,
  courses,
  teachers,
  subjects,
  students,
  exams,
  getGrade
} from '../config/demoData.js';

class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = [];
    this.adminProfiles = [];
    this.departments = [...departments];
    this.courses = [...courses];
    this.teachers = [];
    this.subjects = [...subjects];
    this.students = [];
    this.enrollments = [];
    this.attendance = [];
    this.exams = [...exams];
    this.examResults = [];
    this.fees = [];
    this.academicRecords = [];

    this.initData();
  }

  initData() {
    // 1. Admin
    const adminId = 'user-admin';
    this.users.push({
      id: adminId,
      email: 'admin@edumanage.com',
      password: ADMIN_PASSWORD_HASH,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: new Date()
    });

    this.adminProfiles.push({
      id: 'adm-1',
      userId: adminId,
      fullName: 'Dr. Arthur Pendelton',
      phone: '+1 555-0001',
      designation: 'Principal Administrator',
      createdAt: new Date()
    });

    // 2. Teachers
    teachers.forEach((t) => {
      this.users.push({
        id: t.userId,
        email: t.email,
        password: TEACHER_PASSWORD_HASH,
        role: 'TEACHER',
        avatar: `https://images.unsplash.com/photo-${1534528741775 + this.users.length * 100}?w=150&auto=format&fit=crop&q=80`,
        isActive: true,
        createdAt: new Date()
      });

      this.teachers.push({
        id: `t-${t.teacherId}`,
        teacherId: t.teacherId,
        userId: t.userId,
        fullName: t.fullName,
        phone: t.phone,
        departmentId: t.departmentId,
        qualification: t.qualification,
        joiningDate: t.joiningDate,
        createdAt: new Date()
      });
    });

    // 3. Students
    students.forEach((s, idx) => {
      this.users.push({
        id: s.userId,
        email: s.email,
        password: STUDENT_PASSWORD_HASH,
        role: 'STUDENT',
        avatar: s.profilePhoto,
        isActive: true,
        createdAt: new Date()
      });

      const studentObj = {
        id: `s-${s.studentId}`,
        studentId: s.studentId,
        userId: s.userId,
        fullName: s.fullName,
        phone: s.phone,
        dateOfBirth: s.dateOfBirth,
        gender: s.gender,
        address: s.address,
        departmentId: s.departmentId,
        courseId: s.courseId,
        semester: s.semester,
        enrollmentDate: s.enrollmentDate,
        profilePhoto: s.profilePhoto,
        createdAt: new Date()
      };
      this.students.push(studentObj);

      // Enrollment
      this.enrollments.push({
        id: `enr-${idx + 1}`,
        studentId: studentObj.id,
        courseId: s.courseId,
        semester: s.semester,
        academicYear: '2025-2026',
        status: 'ACTIVE',
        enrolledAt: new Date('2024-08-01')
      });

      // Fee
      const isAlex = s.email === 'student@edumanage.com';
      const feeStatus = isAlex ? 'PARTIAL' : (studentObj.studentId.endsWith('2') || studentObj.studentId.endsWith('5') ? 'PENDING' : (studentObj.studentId.endsWith('7') ? 'PARTIAL' : 'PAID'));
      const totalAmount = 4500;
      const paidAmount = feeStatus === 'PAID' ? 4500 : (feeStatus === 'PARTIAL' ? 2500 : 0);

      this.fees.push({
        id: `fee-${idx + 1}`,
        studentId: studentObj.id,
        academicYear: '2025-2026',
        semester: s.semester,
        totalAmount,
        paidAmount,
        dueDate: new Date('2025-11-30'),
        status: feeStatus,
        paymentMethod: paidAmount > 0 ? 'Card / Online NetBanking' : null,
        lastPaymentDate: paidAmount > 0 ? new Date('2025-08-15') : null,
        createdAt: new Date()
      });

      // Academic Records for Sem 1 & 2
      const gpa1 = +(3.2 + (idx % 6) * 0.12).toFixed(2);
      const gpa2 = +(3.4 + (idx % 5) * 0.11).toFixed(2);
      const cgpa = +((gpa1 + gpa2) / 2).toFixed(2);

      this.academicRecords.push({
        id: `ar-${idx + 1}-1`,
        studentId: studentObj.id,
        semester: 1,
        academicYear: '2024-2025',
        gpa: gpa1,
        cgpa: gpa1,
        totalCredits: 20,
        remarks: 'Exemplary Performance',
        createdAt: new Date()
      });

      this.academicRecords.push({
        id: `ar-${idx + 1}-2`,
        studentId: studentObj.id,
        semester: 2,
        academicYear: '2024-2025',
        gpa: gpa2,
        cgpa: cgpa,
        totalCredits: 20,
        remarks: 'Dean’s Honor List',
        createdAt: new Date()
      });
    });

    // 4. Exam Results
    this.students.forEach((stu, sIdx) => {
      const studentCourseExams = this.exams.filter(e => e.courseId === stu.courseId);
      studentCourseExams.forEach((ex, eIdx) => {
        const marks = Math.min(ex.maxMarks, Math.floor(65 + ((sIdx * 3 + eIdx * 7) % 32)));
        const pct = (marks / ex.maxMarks) * 100;
        this.examResults.push({
          id: `res-${stu.id}-${ex.id}`,
          examId: ex.id,
          studentId: stu.id,
          marksObtained: marks,
          grade: getGrade(pct),
          remarks: pct >= 50 ? 'Passed' : 'Needs Improvement',
          createdAt: new Date()
        });
      });
    });

    // 5. Attendance over last 15 days
    const today = new Date();
    let attCounter = 1;
    for (let d = 1; d <= 15; d++) {
      const attDate = new Date(today);
      attDate.setDate(today.getDate() - d);
      if (attDate.getDay() === 0 || attDate.getDay() === 6) continue;

      this.subjects.forEach((sub) => {
        const courseStudents = this.students.filter(s => s.courseId === sub.courseId);
        courseStudents.forEach((stu, stuIdx) => {
          const hash = (d * 7 + stuIdx * 13 + sub.name.length) % 100;
          const status = hash < 80 ? 'PRESENT' : (hash < 90 ? 'LATE' : 'ABSENT');
          this.attendance.push({
            id: `att-${attCounter++}`,
            studentId: stu.id,
            subjectId: sub.id,
            date: attDate,
            status,
            remarks: status === 'ABSENT' ? 'Unexcused' : (status === 'LATE' ? 'Late 10m' : 'Attended session'),
            createdAt: new Date()
          });
        });
      });
    }
  }
}

export const dataStore = new DataStore();
