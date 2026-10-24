import { PrismaClient, Role, AttendanceStatus, ExamType, FeeStatus, EnrollmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
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
} from '../src/config/demoData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EduManage PostgreSQL Database Seeding...');

  // 1. Clean existing records in reverse order
  console.log('Cleaning existing records...');
  await prisma.academicRecord.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.course.deleteMany();
  await prisma.department.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin User
  console.log('Creating Admin account...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@edumanage.com',
      password: ADMIN_PASSWORD_HASH,
      role: Role.ADMIN,
      adminProfile: {
        create: {
          fullName: 'Dr. Arthur Pendelton',
          phone: '+1 555-0001',
          designation: 'Principal Administrator'
        }
      }
    }
  });

  // 3. Create Departments
  console.log('Creating Departments...');
  for (const dept of departments) {
    await prisma.department.create({
      data: dept
    });
  }

  // 4. Create Courses
  console.log('Creating Courses...');
  for (const course of courses) {
    await prisma.course.create({
      data: course
    });
  }

  // 5. Create Teachers
  console.log('Creating Teachers...');
  const teacherUserMap = {};
  for (const t of teachers) {
    const user = await prisma.user.create({
      data: {
        id: t.userId,
        email: t.email,
        password: TEACHER_PASSWORD_HASH,
        role: Role.TEACHER,
        teacher: {
          create: {
            teacherId: t.teacherId,
            fullName: t.fullName,
            phone: t.phone,
            departmentId: t.departmentId,
            qualification: t.qualification,
            joiningDate: t.joiningDate
          }
        }
      },
      include: { teacher: true }
    });
    teacherUserMap[t.userId] = user.teacher.id;
  }

  // 6. Create Subjects
  console.log('Creating Subjects...');
  for (const sub of subjects) {
    await prisma.subject.create({
      data: {
        id: sub.id,
        code: sub.code,
        name: sub.name,
        credits: sub.credits,
        semester: sub.semester,
        courseId: sub.courseId,
        teacherId: sub.teacherId ? teacherUserMap[sub.teacherId] : null
      }
    });
  }

  // 7. Create 30 Students & Enrollments & Fees & Academic Records
  console.log('Creating 30 Students, Enrollments, and Fee Records...');
  const createdStudents = [];
  for (const s of students) {
    const user = await prisma.user.create({
      data: {
        id: s.userId,
        email: s.email,
        password: STUDENT_PASSWORD_HASH,
        role: Role.STUDENT,
        student: {
          create: {
            studentId: s.studentId,
            fullName: s.fullName,
            phone: s.phone,
            dateOfBirth: s.dateOfBirth,
            gender: s.gender,
            address: s.address,
            departmentId: s.departmentId,
            courseId: s.courseId,
            semester: s.semester,
            enrollmentDate: s.enrollmentDate,
            profilePhoto: s.profilePhoto
          }
        }
      },
      include: { student: true }
    });
    createdStudents.push(user.student);

    // Create Enrollment
    await prisma.enrollment.create({
      data: {
        studentId: user.student.id,
        courseId: s.courseId,
        semester: s.semester,
        academicYear: '2025-2026',
        status: EnrollmentStatus.ACTIVE
      }
    });

    // Create Fee Record (varying statuses)
    const isAlex = s.email === 'student@edumanage.com';
    const feeStatus = isAlex ? FeeStatus.PARTIAL : (user.student.studentId.endsWith('2') || user.student.studentId.endsWith('5') ? FeeStatus.PENDING : (user.student.studentId.endsWith('7') ? FeeStatus.PARTIAL : FeeStatus.PAID));
    const totalAmount = 4500;
    const paidAmount = feeStatus === FeeStatus.PAID ? 4500 : (feeStatus === FeeStatus.PARTIAL ? 2500 : 0);

    await prisma.fee.create({
      data: {
        studentId: user.student.id,
        academicYear: '2025-2026',
        semester: s.semester,
        totalAmount,
        paidAmount,
        dueDate: new Date('2025-11-30'),
        status: feeStatus,
        paymentMethod: paidAmount > 0 ? 'Card / Online NetBanking' : null,
        lastPaymentDate: paidAmount > 0 ? new Date('2025-08-15') : null
      }
    });

    // Academic Record for Semester 1 & 2
    const gpa1 = +(3.2 + Math.random() * 0.7).toFixed(2);
    const gpa2 = +(3.4 + Math.random() * 0.5).toFixed(2);
    const cgpa = +((gpa1 + gpa2) / 2).toFixed(2);

    await prisma.academicRecord.create({
      data: {
        studentId: user.student.id,
        semester: 1,
        academicYear: '2024-2025',
        gpa: gpa1,
        cgpa: gpa1,
        totalCredits: 20,
        remarks: 'Exemplary Performance'
      }
    });

    await prisma.academicRecord.create({
      data: {
        studentId: user.student.id,
        semester: 2,
        academicYear: '2024-2025',
        gpa: gpa2,
        cgpa: cgpa,
        totalCredits: 20,
        remarks: 'Dean’s Honor List'
      }
    });
  }

  // 8. Create Exams
  console.log('Creating Exams...');
  const createdExams = [];
  for (const ex of exams) {
    const exam = await prisma.exam.create({
      data: ex
    });
    createdExams.push(exam);
  }

  // 9. Create Exam Results for students matching courses
  console.log('Creating Exam Results...');
  for (const stu of createdStudents) {
    const studentCourseExams = createdExams.filter(e => e.courseId === stu.courseId);
    for (const ex of studentCourseExams) {
      const marks = Math.floor(65 + Math.random() * 32);
      const pct = (marks / ex.maxMarks) * 100;
      await prisma.examResult.create({
        data: {
          examId: ex.id,
          studentId: stu.id,
          marksObtained: marks,
          grade: getGrade(pct),
          remarks: pct >= 50 ? 'Passed' : 'Needs Improvement'
        }
      });
    }
  }

  // 10. Create Attendance Records for recent 15 academic days
  console.log('Creating Attendance records...');
  const today = new Date();
  for (let d = 1; d <= 15; d++) {
    const attDate = new Date(today);
    attDate.setDate(today.getDate() - d);
    // Skip weekends
    if (attDate.getDay() === 0 || attDate.getDay() === 6) continue;

    for (const sub of subjects) {
      // Find students in this course
      const courseStudents = createdStudents.filter(s => s.courseId === sub.courseId);
      for (const stu of courseStudents) {
        const rand = Math.random();
        const status = rand > 0.15 ? AttendanceStatus.PRESENT : (rand > 0.05 ? AttendanceStatus.LATE : AttendanceStatus.ABSENT);
        await prisma.attendance.create({
          data: {
            studentId: stu.id,
            subjectId: sub.id,
            date: attDate,
            status,
            remarks: status === AttendanceStatus.ABSENT ? 'Medical / Unexcused' : (status === AttendanceStatus.LATE ? 'Arrived 10m late' : 'Attended session')
          }
        });
      }
    }
  }

  console.log('✅ EduManage PostgreSQL Database Seeding Finished Successfully!');
  console.log('Demo Credentials:');
  console.log('  Admin:   admin@edumanage.com   / admin123');
  console.log('  Teacher: teacher@edumanage.com / teacher123');
  console.log('  Student: student@edumanage.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
