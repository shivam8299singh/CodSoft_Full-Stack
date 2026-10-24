import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  CalendarCheck,
  Award,
  CreditCard,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, getGradeColor } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from 'recharts';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/student');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading student academic dashboard..." size="lg" />;
  }

  const summary = data?.summary || {};
  const student = data?.student || {};
  const subjectAttendance = data?.subjectAttendance || [];
  const recentResults = data?.recentResults || [];
  const upcomingExams = data?.upcomingExams || [];
  const feeDetails = data?.feeDetails || {};
  const academicRecords = data?.academicRecords || [];

  // Chart data: GPA trend
  const gpaTrend = academicRecords.map((ar) => ({
    semester: `Sem ${ar.semester}`,
    gpa: ar.gpa,
    cgpa: ar.cgpa
  }));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-600/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/20">
            Student Academic Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome back, {student.fullName || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            {student.course?.name || 'Undergraduate Degree Program'} • Semester {student.semester} • ID: {student.studentId}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/student/results')}
            variant="secondary"
            className="bg-white text-emerald-800 font-bold border-none"
            icon={Award}
          >
            My Results
          </Button>
          <Button
            onClick={() => navigate('/student/attendance')}
            className="bg-emerald-900/60 border border-white/20 text-white font-bold"
            icon={CalendarCheck}
          >
            Attendance Log
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${summary.attendancePercentage || 92}%`}
          subtitle="Requirement: 75% min"
          icon={CalendarCheck}
          color="emerald"
          change="+1.5%"
        />
        <StatCard
          title="Cumulative CGPA"
          value={`${summary.cumulativeCGPA || 3.70}`}
          subtitle="Out of 4.0 Scale"
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="Outstanding Tuition"
          value={formatCurrency(summary.pendingFeeAmount || 0)}
          subtitle={`Status: ${summary.feeStatus || 'PAID'}`}
          icon={CreditCard}
          color={summary.pendingFeeAmount > 0 ? 'amber' : 'emerald'}
          isPositive={summary.pendingFeeAmount === 0}
        />
        <StatCard
          title="Upcoming Exams"
          value={summary.upcomingExamsCount || 0}
          subtitle="Next 30 days"
          icon={FileSpreadsheet}
          color="purple"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Attendance Breakdown */}
        <Card>
          <CardHeader
            title="Course-wise Attendance"
            subtitle="Lectures attended versus total sessions"
            action={
              <button
                onClick={() => navigate('/student/attendance')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            }
          />
          <CardBody className="space-y-4">
            {subjectAttendance.map((item) => (
              <div key={item.subjectId} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.subjectName} ({item.subjectCode})</span>
                  <span className="font-bold text-slate-700">{item.percentage}% ({item.attended}/{item.total})</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      item.percentage >= 85
                        ? 'bg-emerald-500'
                        : item.percentage >= 75
                        ? 'bg-indigo-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Academic Performance Progress Chart */}
        <Card>
          <CardHeader
            title="GPA Progression Chart"
            subtitle="Semester GPA and Cumulative Grade Average"
          />
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gpaTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="semester" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis domain={[0, 4.0]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="gpa" fill="#10b981" radius={[8, 8, 0, 0]} name="Semester GPA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader
            title="Recent Examination Results"
            subtitle="Latest graded papers and assessments"
            action={
              <button
                onClick={() => navigate('/student/results')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            }
          />
          <div className="divide-y divide-slate-100">
            {recentResults.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">No grades published yet.</p>
            ) : (
              recentResults.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{r.exam?.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{r.exam?.subject?.name}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {r.marksObtained} / {r.exam?.maxMarks || 100}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold border text-xs ${getGradeColor(r.grade)}`}>
                      {r.grade}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Examinations Timetable */}
        <Card>
          <CardHeader
            title="Upcoming Examination Schedule"
            subtitle="Scheduled midterm and final tests"
            action={
              <button
                onClick={() => navigate('/student/exams')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            }
          />
          <div className="divide-y divide-slate-100">
            {upcomingExams.map((ex) => (
              <div key={ex.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{ex.name}</h4>
                    <p className="text-[11px] text-slate-400">{ex.subject?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-800 block">{formatDate(ex.date)}</span>
                  <span className="text-[10px] text-slate-400">Max: {ex.maxMarks} Marks</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
