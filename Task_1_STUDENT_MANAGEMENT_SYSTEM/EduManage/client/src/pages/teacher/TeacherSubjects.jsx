import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { BookOpen, Users, CalendarCheck, FileSpreadsheet } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const TeacherSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    fetchMySubjects();
  }, []);

  const fetchMySubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/teacher');
      if (res.data.success) {
        const subs = res.data.data.subjects || [];
        setSubjects(subs);
        if (subs.length > 0) {
          handleSelectSubject(subs[0]);
        }
      }
    } catch (err) {
      showToast('Failed to load assigned subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubject = async (sub) => {
    setSelectedSubject(sub);
    try {
      const res = await api.get(`/students?course=${sub.courseId}&semester=${sub.semester}&limit=50`);
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Teaching Subjects</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review curriculum syllabi and manage enrolled student rosters for each subject module.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving faculty modules..." />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects currently assigned"
          description="Contact the academic administrator to assign courses and subjects to your profile."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subjects List */}
          <div className="space-y-3">
            {subjects.map((sub) => {
              const isSelected = selectedSubject?.id === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {sub.code}
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {sub.credits} Credits
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mt-2">{sub.name}</h3>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    Semester {sub.semester} • {sub.course?.name || 'Computer Science'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Enrolled Students Roster */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title={`Class Roster — ${selectedSubject?.name || 'Selected Subject'}`}
                subtitle={`Enrolled students (${students.length} learners)`}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No enrolled students found for this subject.
                        </td>
                      </tr>
                    ) : (
                      students.map((stu) => (
                        <tr key={stu.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{stu.fullName}</span>
                            <span className="text-[11px] text-slate-400">{stu.user?.email || stu.email}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700">{stu.studentId}</td>
                          <td className="py-3 px-4">
                            <Badge variant="primary">Sem {stu.semester}</Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{stu.phone || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSubjects;
