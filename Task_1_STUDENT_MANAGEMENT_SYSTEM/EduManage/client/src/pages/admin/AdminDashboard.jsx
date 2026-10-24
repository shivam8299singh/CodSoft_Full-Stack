import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling institutional analytics..." size="lg" />;
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const recentActivities = data?.recentActivities || [];
  const upcomingExams = data?.upcomingExams || [];

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/20">
            Institutional Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            EduManage Executive Portal
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
            Welcome to the central academic dashboard. Real-time metrics for students, faculty, attendance, examinations, and fee collections.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/students')}
            className="px-4 py-2.5 bg-white text-indigo-700 font-bold text-xs rounded-xl shadow-md hover:bg-indigo-50 transition-all active:scale-95"
          >
            Manage Students
          </button>
          <button
            onClick={() => navigate('/admin/attendance')}
            className="px-4 py-2.5 bg-indigo-800/60 text-white font-bold text-xs rounded-xl border border-white/20 hover:bg-indigo-800 transition-all active:scale-95"
          >
            Daily Attendance
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={summary.totalStudents || 0}
          subtitle="Enrolled learners"
          icon={Users}
          color="indigo"
          change="+8.4%"
        />
        <StatCard
          title="Faculty Members"
          value={summary.totalTeachers || 0}
          subtitle="Active professors"
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Total Courses"
          value={summary.totalCourses || 0}
          subtitle="Degree programs"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Today's Attendance"
          value={`${summary.attendanceRate || 0}%`}
          subtitle="Institution-wide rate"
          icon={CalendarCheck}
          color="emerald"
          change="+1.2%"
        />
        <StatCard
          title="Pending Fees"
          value={formatCurrency(summary.pendingFeeAmount || 0)}
          subtitle="Outstanding dues"
          icon={CreditCard}
          color="rose"
          isPositive={false}
        />
        <StatCard
          title="Upcoming Exams"
          value={summary.upcomingExamsCount || 0}
          subtitle="Scheduled tests"
          icon={FileSpreadsheet}
          color="amber"
        />
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment by Department */}
        <Card>
          <CardHeader
            title="Department Enrollment"
            subtitle="Student distribution across active faculties"
          />
          <CardBody>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.enrollmentByDept || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="students" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Attendance Trends */}
        <Card>
          <CardHeader
            title="Attendance Performance Trend"
            subtitle="Daily institution attendance average (Last 7 Days)"
          />
          <CardBody>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.attendanceTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Attendance Rate']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Fee Collection Statistics */}
        <Card>
          <CardHeader
            title="Fee Collection Overview"
            subtitle="Breakdown of student fee payment obligations"
          />
          <CardBody>
            <div className="h-72 flex flex-col sm:flex-row items-center justify-around">
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.feeBreakdown || []}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(charts.feeBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 flex flex-col space-y-3 pl-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700">Paid in Full</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{summary.paidFeeCount || 0} students</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-slate-700">Partial Payment</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{summary.partialFeeCount || 0} students</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-semibold text-slate-700">Pending Dues</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{summary.pendingFeeCount || 0} students</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Exam Grade Distribution */}
        <Card>
          <CardHeader
            title="Institutional Exam Performance"
            subtitle="Overall student grade distribution across all examinations"
          />
          <CardBody>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.gradeDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="grade" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip
                    formatter={(val) => [val, 'Students']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bottom Section: Recent Enrollments & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students Table Preview */}
        <Card>
          <CardHeader
            title="Recently Enrolled Students"
            subtitle="Latest student additions to the institutional directory"
            action={
              <button
                onClick={() => navigate('/admin/students')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            }
          />
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {recentActivities.map((stu) => (
              <div key={stu.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                    {stu.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{stu.name}</h4>
                    <p className="text-[11px] text-slate-400">{stu.studentId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="primary">{stu.department}</Badge>
                  <span className="text-[11px] text-slate-400">{formatDate(stu.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Examinations */}
        <Card>
          <CardHeader
            title="Upcoming Examinations Schedule"
            subtitle="Scheduled midterms, finals, and assessments"
            action={
              <button
                onClick={() => navigate('/admin/exams')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <span>View Schedule</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            }
          />
          <div className="divide-y divide-slate-100">
            {upcomingExams.map((ex) => (
              <div key={ex.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{ex.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {ex.subject ? ex.subject.name : 'Computer Science'} • Max: {ex.maxMarks} Marks
                    </p>
                  </div>
                </div>
                <Badge variant="warning">{formatDate(ex.date)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
