import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CalendarCheck, Check, X, Clock, Save, Users, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TeacherAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: { status: 'PRESENT'|'ABSENT'|'LATE', remarks: '' } }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchTeacherSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      loadClassStudentsAndExistingRoll();
    }
  }, [selectedSubjectId, attendanceDate]);

  const fetchTeacherSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/teacher');
      if (res.data.success) {
        const subs = res.data.data.subjects || [];
        setSubjects(subs);
        if (subs.length > 0) {
          setSelectedSubjectId(subs[0].id);
        }
      }
    } catch (err) {
      showToast('Failed to load assigned subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudentsAndExistingRoll = async () => {
    try {
      setLoading(true);
      const sub = subjects.find(s => s.id === selectedSubjectId);
      if (!sub) return;

      // 1. Fetch students in this subject's course & semester
      const stuRes = await api.get(`/students?course=${sub.courseId}&semester=${sub.semester}&limit=50`);
      const stuList = stuRes.data.data || [];
      setStudents(stuList);

      // 2. Fetch existing attendance records for this date & subject
      const attRes = await api.get('/attendance', {
        params: { subjectId: sub.id, date: attendanceDate }
      });
      const existingRecords = attRes.data.data || [];

      // 3. Populate attendanceMap
      const initialMap = {};
      stuList.forEach((stu) => {
        const found = existingRecords.find(r => r.studentId === stu.id);
        if (found) {
          initialMap[stu.id] = { status: found.status, remarks: found.remarks || '' };
        } else {
          // Default to PRESENT
          initialMap[stu.id] = { status: 'PRESENT', remarks: '' };
        }
      });
      setAttendanceMap(initialMap);
    } catch (err) {
      console.error(err);
      showToast('Error loading student roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = {
        status,
        remarks: status === 'PRESENT' ? '' : (status === 'ABSENT' ? 'Unexcused' : 'Late')
      };
    });
    setAttendanceMap(updated);
    showToast(`Marked all students as ${status}`, 'info');
  };

  const handleSubmitAttendance = async () => {
    try {
      setSubmitting(true);
      const payload = {
        subjectId: selectedSubjectId,
        date: attendanceDate,
        attendances: Object.keys(attendanceMap).map((stuId) => ({
          studentId: stuId,
          status: attendanceMap[stuId].status,
          remarks: attendanceMap[stuId].remarks
        }))
      };

      const res = await api.post('/attendance', payload);
      if (res.data.success) {
        showToast('Daily attendance successfully recorded & saved!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Counts
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  Object.values(attendanceMap).forEach((val) => {
    if (val.status === 'PRESENT') presentCount++;
    else if (val.status === 'LATE') lateCount++;
    else if (val.status === 'ABSENT') absentCount++;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daily Lecture Attendance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct roll call, record student presence, and update real-time attendance percentages.
          </p>
        </div>
        <Button
          onClick={handleSubmitAttendance}
          icon={Save}
          variant="success"
          isLoading={submitting}
        >
          Save & Submit Roll
        </Button>
      </div>

      {/* Control Panel: Subject & Date Picker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-72">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Teaching Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} — {sub.name} (Sem {sub.semester})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Lecture Date
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => markAll('PRESENT')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll('ABSENT')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex items-center space-x-4 text-xs">
        <span className="text-slate-500 font-medium">Class Roll Summary:</span>
        <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          Present: {presentCount}
        </span>
        <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          Late: {lateCount}
        </span>
        <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
          Absent: {absentCount}
        </span>
      </div>

      {/* Roll Call Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading classroom roster for roll call..." />
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No students enrolled in this subject's course.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {students.map((stu) => {
                  const current = attendanceMap[stu.id] || { status: 'PRESENT', remarks: '' };
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{stu.fullName}</span>
                        <span className="text-[11px] text-slate-400">{stu.user?.email || stu.email}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {stu.studentId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setStatus(stu.id, 'PRESENT')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all ${
                              current.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatus(stu.id, 'LATE')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all ${
                              current.status === 'LATE'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Late</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatus(stu.id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all ${
                              current.status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Optional notes (e.g. Excused, Illness)..."
                          value={current.remarks || ''}
                          onChange={(e) => {
                            setAttendanceMap((prev) => ({
                              ...prev,
                              [stu.id]: {
                                ...prev[stu.id],
                                remarks: e.target.value
                              }
                            }));
                          }}
                          className="w-full max-w-xs py-1.5 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
