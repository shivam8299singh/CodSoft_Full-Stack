import { prisma, isDatabaseConnected } from '../config/db.js';
import { dataStore } from '../services/dataStore.js';

export const getFees = async (req, res) => {
  try {
    const { status, studentId, search = '' } = req.query;

    if (isDatabaseConnected) {
      const where = {};
      if (status) where.status = status;
      if (studentId) where.studentId = studentId;
      if (search) {
        where.student = {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { studentId: { contains: search, mode: 'insensitive' } }
          ]
        };
      }

      const fees = await prisma.fee.findMany({
        where,
        include: {
          student: { include: { department: true, course: true } }
        },
        orderBy: { dueDate: 'asc' }
      });

      return res.status(200).json({ success: true, data: fees });
    } else {
      let filtered = dataStore.fees.map(f => {
        const student = dataStore.students.find(s => s.id === f.studentId);
        const dept = student ? dataStore.departments.find(d => d.id === student.departmentId) : null;
        const crs = student ? dataStore.courses.find(c => c.id === student.courseId) : null;
        return {
          ...f,
          student: student ? { ...student, department: dept, course: crs } : null
        };
      });

      if (status) filtered = filtered.filter(f => f.status === status);
      if (studentId) filtered = filtered.filter(f => f.studentId === studentId);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(f =>
          f.student &&
          (f.student.fullName.toLowerCase().includes(q) || f.student.studentId.toLowerCase().includes(q))
        );
      }

      return res.status(200).json({ success: true, data: filtered });
    }
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee records.' });
  }
};

export const createFee = async (req, res) => {
  try {
    const { studentId, academicYear = '2025-2026', semester = 1, totalAmount, dueDate, paidAmount = 0 } = req.body;

    if (!studentId || !totalAmount || !dueDate) {
      return res.status(400).json({ success: false, message: 'Student, totalAmount, and dueDate are required.' });
    }

    const total = parseFloat(totalAmount);
    const paid = parseFloat(paidAmount);
    const status = paid >= total ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'PENDING');

    if (isDatabaseConnected) {
      const fee = await prisma.fee.create({
        data: {
          studentId,
          academicYear,
          semester: parseInt(semester),
          totalAmount: total,
          paidAmount: paid,
          dueDate: new Date(dueDate),
          status,
          paymentMethod: paid > 0 ? 'Manual / Administrative' : null,
          lastPaymentDate: paid > 0 ? new Date() : null
        },
        include: { student: true }
      });

      return res.status(201).json({ success: true, message: 'Fee record created successfully.', data: fee });
    } else {
      const id = `fee-${Date.now()}`;
      const newFee = {
        id,
        studentId,
        academicYear,
        semester: parseInt(semester),
        totalAmount: total,
        paidAmount: paid,
        dueDate: new Date(dueDate),
        status,
        paymentMethod: paid > 0 ? 'Manual / Administrative' : null,
        lastPaymentDate: paid > 0 ? new Date() : null,
        createdAt: new Date()
      };

      dataStore.fees.push(newFee);
      const student = dataStore.students.find(s => s.id === studentId);

      return res.status(201).json({
        success: true,
        message: 'Fee record created successfully.',
        data: { ...newFee, student }
      });
    }
  } catch (error) {
    console.error('Error creating fee record:', error);
    res.status(500).json({ success: false, message: 'Failed to create fee record.' });
  }
};

export const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentAmount, paymentMethod = 'Online / Card' } = req.body;

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
    }

    const pay = parseFloat(paymentAmount);

    if (isDatabaseConnected) {
      const existing = await prisma.fee.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ success: false, message: 'Fee record not found.' });

      const newPaid = existing.paidAmount + pay;
      const status = newPaid >= existing.totalAmount ? 'PAID' : 'PARTIAL';

      const updated = await prisma.fee.update({
        where: { id },
        data: {
          paidAmount: newPaid,
          status,
          paymentMethod,
          lastPaymentDate: new Date()
        },
        include: { student: true }
      });

      return res.status(200).json({ success: true, message: 'Payment recorded successfully.', data: updated });
    } else {
      const index = dataStore.fees.findIndex(f => f.id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Fee record not found.' });

      const existing = dataStore.fees[index];
      const newPaid = existing.paidAmount + pay;
      const status = newPaid >= existing.totalAmount ? 'PAID' : 'PARTIAL';

      dataStore.fees[index] = {
        ...existing,
        paidAmount: newPaid,
        status,
        paymentMethod,
        lastPaymentDate: new Date(),
        updatedAt: new Date()
      };

      const student = dataStore.students.find(s => s.id === existing.studentId);
      return res.status(200).json({
        success: true,
        message: 'Payment recorded successfully.',
        data: { ...dataStore.fees[index], student }
      });
    }
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ success: false, message: 'Failed to process payment.' });
  }
};

export const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (isDatabaseConnected) {
      const fees = await prisma.fee.findMany({
        where: { studentId },
        orderBy: { dueDate: 'asc' }
      });
      return res.status(200).json({ success: true, data: fees });
    } else {
      const student = dataStore.students.find(s => s.id === studentId || s.userId === studentId);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

      const fees = dataStore.fees.filter(f => f.studentId === student.id);
      return res.status(200).json({ success: true, data: fees });
    }
  } catch (error) {
    console.error('Error getting student fees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student fees.' });
  }
};
