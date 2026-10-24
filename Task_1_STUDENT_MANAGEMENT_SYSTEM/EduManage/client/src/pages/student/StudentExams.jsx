import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileSpreadsheet, Calendar, BookOpen, Clock, AlertCircle } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/student');
      if (res.data.success) {
        setExams(res.data.data.upcomingExams || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving examination schedule..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Examination Timetable</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review upcoming midterm exams, practicals, finals, and testing regulations.
        </p>
      </div>

      {exams.length === 0 ? (
        <EmptyState
          title="No upcoming examinations scheduled"
          description="There are currently no active exam dates announced for your semester cohort."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((ex) => (
            <Card key={ex.id} hover className="flex flex-col justify-between">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={ex.examType === 'FINAL' ? 'danger' : 'primary'}>
                    {ex.examType}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400">
                    Semester {ex.semester}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{ex.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {ex.subject?.name}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                    <span className="font-semibold text-slate-800">{formatDate(ex.date)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Passing Criteria</span>
                    <span className="font-mono font-bold text-indigo-600">
                      {ex.passingMarks} / {ex.maxMarks} Marks
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> 10:00 AM - 01:00 PM
                  </span>
                  <span className="font-semibold text-indigo-600">Hall 302</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExams;
