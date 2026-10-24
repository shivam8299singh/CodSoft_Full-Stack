import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CalendarCheck, Search, Filter, Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedCourse, selectedSubject, selectedDate]);

  const fetchMetadata = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/courses'),
        api.get('/subjects')
      ]);
      if (cRes.data.success) setCourses(cRes.data.data);
      if (sRes.data.success) setSubjects(sRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance', {
        params: {
          courseId: selectedCourse,
          subjectId: selectedSubject,
          date: selectedDate
        }
      });
      if (res.data.success) {
        setRecords(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load attendance logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const total = records.length;
  const present = records.filter(r => r.status === 'PRESENT').length;
  const late = records.filter(r => r.status === 'LATE').length;
  const absent = records.filter(r => r.status === 'ABSENT').length;
  const attendanceRate = total > 0 ? +(((present + late) / total) * 100).toFixed(1) : 93.5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Attendance</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor daily classroom rolls, lecture attendance trends, and absenteeism logs.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recorded Sessions</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Present</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{present}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Late Attendance</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{late}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Absent</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{absent}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Degree Programs</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {selectedDate && (
          <button
            onClick={() => setSelectedDate('')}
            className="text-xs text-indigo-600 hover:underline font-semibold"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving institutional attendance ledger..." />
        ) : records.length === 0 ? (
          <EmptyState
            title="No attendance records match your filter"
            description="Clear or adjust your filters to view institutional records."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {records.slice(0, 50).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{r.student?.fullName}</span>
                        <span className="font-mono text-[11px] text-slate-400">{r.student?.studentId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {r.subject?.code} — {r.subject?.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDate(r.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={r.status === 'PRESENT' ? 'success' : (r.status === 'LATE' ? 'warning' : 'danger')}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {r.remarks || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
