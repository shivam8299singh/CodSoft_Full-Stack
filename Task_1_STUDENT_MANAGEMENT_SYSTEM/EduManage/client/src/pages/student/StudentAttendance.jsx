import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CalendarCheck, CheckCircle, Clock, XCircle, Calendar, BookOpen } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const StudentAttendance = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/student');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving attendance history..." size="lg" />;
  }

  const summary = data?.summary || {};
  const subjectAttendance = data?.subjectAttendance || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Attendance Portal</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your lecture attendance percentages, minimum compliance thresholds, and date logs.
        </p>
      </div>

      {/* Overview Card with Visual Ring / Percentage */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${summary.attendancePercentage || 92}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900">{summary.attendancePercentage}%</span>
              <span className="text-[10px] font-bold uppercase text-slate-400">Overall</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Attendance Status: Good Standing</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Institutional academic policy requires maintaining at least 75% attendance in every course module to remain eligible for term examinations.
            </p>
            <div className="mt-3 flex items-center space-x-3 text-xs">
              <span className="flex items-center text-emerald-600 font-semibold">
                <CheckCircle className="w-4 h-4 mr-1" /> Eligible for Finals
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center min-w-[120px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Status</span>
            <span className="text-lg font-black text-emerald-800 mt-1 block">Active</span>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center min-w-[120px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Cutoff</span>
            <span className="text-lg font-black text-indigo-800 mt-1 block">75.0% Min</span>
          </div>
        </div>
      </div>

      {/* Subject-Wise Breakdown Table */}
      <Card>
        <CardHeader
          title="Subject Module Breakdown"
          subtitle="Specific lecture statistics per enrolled subject"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Attended / Total</th>
                <th className="py-3.5 px-4 w-64">Attendance Progress</th>
                <th className="py-3.5 px-4">Percentage</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subjectAttendance.map((item) => (
                <tr key={item.subjectId} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{item.subjectName}</span>
                    <span className="font-mono text-[11px] text-slate-400">{item.subjectCode}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    {item.attended} / {item.total} sessions
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${
                          item.percentage >= 85
                            ? 'bg-emerald-500'
                            : item.percentage >= 75
                            ? 'bg-indigo-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {item.percentage}%
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={item.percentage >= 75 ? 'success' : 'danger'}>
                      {item.percentage >= 75 ? 'Satisfactory' : 'Critical Warning'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StudentAttendance;
