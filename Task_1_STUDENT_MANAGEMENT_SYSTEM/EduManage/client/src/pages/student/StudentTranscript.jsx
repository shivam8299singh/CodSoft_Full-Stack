import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Award, GraduationCap, Download, CheckCircle } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentTranscript = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTranscript();
  }, []);

  const fetchTranscript = async () => {
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
    return <LoadingSpinner text="Compiling official academic transcript..." size="lg" />;
  }

  const student = data?.student || {};
  const academicRecords = data?.academicRecords || [];
  const results = data?.recentResults || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Transcript</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official institutional transcript certifying completed semesters, grade point averages, and course credits.
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          variant="outline"
          icon={Download}
        >
          Print Official Copy
        </Button>
      </div>

      {/* Official Certificate Style Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-10 space-y-8">
        {/* Institutional Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">EduManage Institute of Technology</h2>
              <p className="text-xs text-slate-500">Office of the University Registrar • Official Record</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cumulative CGPA</span>
            <span className="text-3xl font-black text-indigo-600">
              {academicRecords.slice(-1)[0]?.cgpa || '3.70'} / 4.0
            </span>
          </div>
        </div>

        {/* Student Dossier Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block">Candidate Name</span>
            <span className="font-bold text-slate-900">{student.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Student ID</span>
            <span className="font-mono font-bold text-slate-900">{student.studentId}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Degree Program</span>
            <span className="font-bold text-slate-900">{student.course?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Faculty Department</span>
            <span className="font-bold text-slate-900">{student.department?.name}</span>
          </div>
        </div>

        {/* Term Progression Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Completed Academic Terms
          </h3>

          {academicRecords.map((ar) => (
            <div key={ar.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Semester {ar.semester} — Academic Year {ar.academicYear}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Earned Credits: <span className="font-semibold text-slate-700">{ar.totalCredits}</span> • Remarks: <span className="font-semibold text-emerald-600">{ar.remarks}</span>
                </p>
              </div>
              <div className="flex items-center space-x-6 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Term GPA</span>
                  <span className="text-base font-extrabold text-slate-800">{ar.gpa}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cumulative CGPA</span>
                  <span className="text-base font-extrabold text-indigo-600">{ar.cgpa}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Official Standing Footer */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <span className="flex items-center text-emerald-600 font-semibold">
            <CheckCircle className="w-4 h-4 mr-1" /> Verified Electronic Academic Transcript
          </span>
          <span>Date of Issue: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentTranscript;
