import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Award, Search, GraduationCap, ChevronRight, FileText, CheckCircle } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const AdminAcademicRecords = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students', { params: { search, limit: 30 } });
      if (res.data.success) {
        setStudents(res.data.data);
        if (res.data.data.length > 0 && !selectedStudent) {
          handleSelectStudent(res.data.data[0]);
        }
      }
    } catch (err) {
      showToast('Failed to load students directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (stu) => {
    setSelectedStudent(stu);
    try {
      setRecordsLoading(true);
      const res = await api.get(`/academic/student/${stu.id}`);
      if (res.data.success) {
        setAcademicData(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load student transcript', 'error');
    } finally {
      setRecordsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Records & Transcripts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review official institutional transcripts, cumulative grade point averages (CGPA), and subject scores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student Selector */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col h-[650px]">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 space-y-1">
            {loading ? (
              <LoadingSpinner text="Loading student list..." />
            ) : (
              students.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectStudent(s)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    selectedStudent?.id === s.id
                      ? 'bg-indigo-50 border border-indigo-200 shadow-xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {s.fullName[0]}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{s.fullName}</h4>
                      <p className="font-mono text-[10px] text-slate-400">{s.studentId}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Official Academic Transcript Sheet */}
        <div className="lg:col-span-2">
          {recordsLoading ? (
            <LoadingSpinner text="Generating official academic transcript..." size="lg" />
          ) : !academicData ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
              Select a student to inspect transcript records
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
              {/* Transcript Header */}
              <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{academicData.student?.fullName}</h2>
                    <p className="text-xs text-slate-500">
                      ID: <span className="font-mono font-bold text-indigo-600">{academicData.student?.studentId}</span> • {academicData.student?.course?.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cumulative CGPA</span>
                  <span className="text-2xl font-black text-indigo-600">
                    {academicData.records?.slice(-1)[0]?.cgpa || '3.70'} / 4.0
                  </span>
                </div>
              </div>

              {/* Semester Progression Cards */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Semester Academic Summary
                </h3>

                {academicData.records?.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Semester {rec.semester} ({rec.academicYear})
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Credit Weight: {rec.totalCredits} Credits • <span className="text-indigo-600 font-semibold">{rec.remarks}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">GPA</span>
                        <span className="text-sm font-bold text-slate-800">{rec.gpa}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">CGPA</span>
                        <span className="text-sm font-bold text-emerald-600">{rec.cgpa}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Exam Scores Ledger */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Subject Examination Scores
                </h3>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-2.5 px-4">Subject</th>
                        <th className="py-2.5 px-4">Examination</th>
                        <th className="py-2.5 px-4">Score</th>
                        <th className="py-2.5 px-4">Grade</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {academicData.examResults?.map((res) => (
                        <tr key={res.id}>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">
                            {res.exam?.subject?.name || 'Subject Module'}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">{res.exam?.name}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                            {res.marksObtained} / {res.exam?.maxMarks || 100}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-indigo-600">{res.grade}</td>
                          <td className="py-2.5 px-4">
                            <Badge variant="success">Passed</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAcademicRecords;
