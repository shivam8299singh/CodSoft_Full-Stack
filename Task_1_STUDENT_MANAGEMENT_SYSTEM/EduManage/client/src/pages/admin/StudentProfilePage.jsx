import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  GraduationCap,
  CalendarCheck,
  Award,
  CreditCard,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatCurrency, getStatusBadgeColor, getGradeColor } from '../../utils/formatters';

const StudentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${id}`);
      if (res.data.success) {
        setStudent(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load student profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading student dossier..." size="lg" />;
  }

  if (!student) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800">Student Not Found</h2>
        <Button onClick={() => navigate('/admin/students')} className="mt-4" icon={ArrowLeft}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const attendance = student.attendance || [];
  const results = student.examResults || [];
  const fees = student.fees || [];
  const academicRecords = student.academicRecords || [];

  // Attendance metrics
  const totalSessions = attendance.length;
  const attendedSessions = attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalSessions > 0 ? +((attendedSessions / totalSessions) * 100).toFixed(1) : 92.0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/admin/students')}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
          <p className="text-xs text-slate-400">Viewing comprehensive institutional dossier for {student.fullName}</p>
        </div>
      </div>

      {/* Header Profile Dossier Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <img
              src={student.profilePhoto || 'https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80'}
              alt={student.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">{student.fullName}</h2>
                <Badge variant="primary">Sem {student.semester}</Badge>
              </div>
              <p className="font-mono text-xs font-semibold text-indigo-600 mt-0.5">{student.studentId}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {student.user?.email || student.email}
                </span>
                <span className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {student.phone || '—'}
                </span>
                <span className="flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {student.department?.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 self-stretch sm:self-auto justify-around">
            <div className="text-center px-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance</span>
              <p className="text-lg font-extrabold text-emerald-600">{attendanceRate}%</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CGPA</span>
              <p className="text-lg font-extrabold text-indigo-600">
                {academicRecords.slice(-1)[0]?.cgpa || '3.70'}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fee Status</span>
              <p className="text-xs font-extrabold text-slate-800 mt-1">
                <Badge variant={fees[0]?.status === 'PAID' ? 'success' : 'warning'}>
                  {fees[0]?.status || 'PAID'}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 mt-8 space-x-6 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview & Bio' },
            { id: 'attendance', label: `Attendance Log (${attendance.length})` },
            { id: 'results', label: `Examination Scores (${results.length})` },
            { id: 'fees', label: 'Fee Invoices' },
            { id: 'transcript', label: 'Academic Transcript' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Academic Information" />
            <CardBody className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400">Enrolled Degree Program</span>
                <span className="font-bold text-slate-800">{student.course?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400">Academic Department</span>
                <span className="font-bold text-slate-800">{student.department?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400">Current Semester</span>
                <span className="font-bold text-slate-800">Semester {student.semester}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400">Enrollment Date</span>
                <span className="font-bold text-slate-800">{formatDate(student.enrollmentDate)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Account Status</span>
                <Badge variant={student.user?.isActive ? 'success' : 'danger'}>
                  {student.user?.isActive ? 'Active Matriculated' : 'Suspended'}
                </Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Personal & Contact Information" />
            <CardBody className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400">Gender</span>
                <span className="font-bold text-slate-800">{student.gender || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400">Date of Birth</span>
                <span className="font-bold text-slate-800">{formatDate(student.dateOfBirth)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-bold text-slate-800">{student.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Permanent Address</span>
                <span className="font-bold text-slate-800 text-right max-w-xs">{student.address || '—'}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'attendance' && (
        <Card>
          <CardHeader
            title="Attendance Attendance Sheet"
            subtitle={`Overall rate: ${attendanceRate}% (${attendedSessions} of ${totalSessions} sessions attended)`}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No attendance records found for this student.
                    </td>
                  </tr>
                ) : (
                  attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-medium text-slate-800">{formatDate(att.date)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{att.subject?.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant={att.status === 'PRESENT' ? 'success' : (att.status === 'LATE' ? 'warning' : 'danger')}>
                          {att.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{att.remarks || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'results' && (
        <Card>
          <CardHeader title="Examination Results & Grades" subtitle="All term exams, quizzes, and midterm marks" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Examination</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Marks Obtained</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No examination results published yet.
                    </td>
                  </tr>
                ) : (
                  results.map((res) => {
                    const maxMarks = res.exam?.maxMarks || 100;
                    const pct = ((res.marksObtained / maxMarks) * 100).toFixed(1);
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-800">{res.exam?.name}</td>
                        <td className="py-3 px-4 text-slate-600">{res.exam?.subject?.name}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {res.marksObtained} / {maxMarks}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{pct}%</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold border text-xs ${getGradeColor(res.grade)}`}>
                            {res.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={res.marksObtained >= (res.exam?.passingMarks || 40) ? 'success' : 'danger'}>
                            {res.marksObtained >= (res.exam?.passingMarks || 40) ? 'Passed' : 'Failed'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'fees' && (
        <Card>
          <CardHeader title="Fee Records & Ledger" subtitle="Obligations, payments made, and outstanding balances" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Academic Year & Term</th>
                  <th className="py-3 px-4">Total Fee</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Remaining Balance</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {fee.academicYear} (Semester {fee.semester})
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{formatCurrency(fee.totalAmount)}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">{formatCurrency(fee.paidAmount)}</td>
                    <td className="py-3 px-4 font-semibold text-rose-600">
                      {formatCurrency(fee.totalAmount - fee.paidAmount)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(fee.dueDate)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={fee.status === 'PAID' ? 'success' : (fee.status === 'PARTIAL' ? 'warning' : 'danger')}>
                        {fee.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'transcript' && (
        <Card>
          <CardHeader title="Official Academic Transcript" subtitle="Term-by-term GPA progression and cumulative CGPA" />
          <div className="divide-y divide-slate-100">
            {academicRecords.map((rec) => (
              <div key={rec.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Semester {rec.semester} ({rec.academicYear})</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Total Credits: {rec.totalCredits} • {rec.remarks}</p>
                </div>
                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Term GPA</span>
                    <span className="text-base font-extrabold text-indigo-600">{rec.gpa}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cumulative CGPA</span>
                    <span className="text-base font-extrabold text-emerald-600">{rec.cgpa}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentProfilePage;
