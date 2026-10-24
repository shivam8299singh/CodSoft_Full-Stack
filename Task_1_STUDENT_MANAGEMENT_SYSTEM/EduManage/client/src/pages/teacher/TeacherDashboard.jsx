import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeacherStats();
  }, []);

  const fetchTeacherStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/teacher');
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
    return <LoadingSpinner text="Compiling faculty schedule and class metrics..." size="lg" />;
  }

  const summary = data?.summary || {};
  const teacher = data?.teacher || {};
  const subjects = data?.subjects || [];
  const todayClasses = data?.todayClasses || [];
  const upcomingExams = data?.upcomingExams || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/20">
            Faculty Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome, {teacher.fullName || 'Professor'}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
            {teacher.department?.name || 'Academic Faculty'} • {teacher.qualification || 'Faculty Member'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/teacher/attendance')}
            variant="secondary"
            className="bg-white text-indigo-700 font-bold border-none"
            icon={CalendarCheck}
          >
            Mark Attendance
          </Button>
          <Button
            onClick={() => navigate('/teacher/exams')}
            className="bg-indigo-900/60 border border-white/20 text-white font-bold"
            icon={FileSpreadsheet}
          >
            Enter Marks
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Subjects"
          value={summary.assignedSubjectsCount || 0}
          subtitle="Modules taught"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Total Students"
          value={summary.totalStudentsCount || 0}
          subtitle="Under your instruction"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Today's Lecture Sessions"
          value={summary.todayClassesCount || 0}
          subtitle="Scheduled classes"
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Class Attendance Rate"
          value={`${summary.avgAttendanceRate || 92}%`}
          subtitle="Average student attendance"
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Lectures Schedule */}
        <Card>
          <CardHeader
            title="Today's Academic Schedule"
            subtitle="Upcoming lecture periods and classrooms"
            action={
              <button
                onClick={() => navigate('/teacher/attendance')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <span>Take Roll</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            }
          />
          <div className="divide-y divide-slate-100">
            {todayClasses.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                    {item.code}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.subjectName}</h4>
                    <p className="text-[11px] text-slate-400">{item.course} • {item.room}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-800 block">{item.time}</span>
                  <Badge variant="primary">Scheduled</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* My Assigned Subjects List */}
        <Card>
          <CardHeader
            title="My Assigned Modules"
            subtitle="Curriculum subjects assigned to your teaching load"
            action={
              <button
                onClick={() => navigate('/teacher/subjects')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <span>View Rosters</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            }
          />
          <div className="divide-y divide-slate-100">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {sub.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{sub.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Semester {sub.semester} • {sub.credits} Academic Credits
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/teacher/attendance')}
                >
                  Mark Roll
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
