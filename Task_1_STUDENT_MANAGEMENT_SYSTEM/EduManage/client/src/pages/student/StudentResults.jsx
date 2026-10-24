import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, CheckCircle, XCircle, TrendingUp, BookOpen } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { getGradeColor } from '../../utils/formatters';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/student');
      if (res.data.success) {
        setResults(res.data.data.recentResults || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving academic grades..." size="lg" />;
  }

  // Calculate aggregates
  let totalMax = 0;
  let totalObtained = 0;
  let passedCount = 0;

  results.forEach((r) => {
    const max = r.exam?.maxMarks || 100;
    totalMax += max;
    totalObtained += r.marksObtained;
    if (r.marksObtained >= (r.exam?.passingMarks || 40)) passedCount++;
  });

  const aggregatePct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Examination Results</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review individual subject grades, cumulative percentage, and assessment remarks.
        </p>
      </div>

      {/* Aggregate Score Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Marks Scored</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {totalObtained} <span className="text-sm font-semibold text-slate-400">/ {totalMax}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Percentage</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{aggregatePct}%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Passing Standing</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {passedCount} / {results.length} Passed
          </p>
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader
          title="Graded Examinations Ledger"
          subtitle="Score distribution and letter grades"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-4">Subject Module</th>
                <th className="py-3.5 px-4">Examination</th>
                <th className="py-3.5 px-4">Marks Obtained</th>
                <th className="py-3.5 px-4">Percentage</th>
                <th className="py-3.5 px-4 text-center">Grade</th>
                <th className="py-3.5 px-4">Remarks</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No results currently published.
                  </td>
                </tr>
              ) : (
                results.map((r) => {
                  const max = r.exam?.maxMarks || 100;
                  const pct = ((r.marksObtained / max) * 100).toFixed(1);
                  const isPass = r.marksObtained >= (r.exam?.passingMarks || 40);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{r.exam?.subject?.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{r.exam?.subject?.code}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{r.exam?.name}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {r.marksObtained} / {max}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{pct}%</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md font-bold border text-xs ${getGradeColor(r.grade)}`}>
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{r.remarks || '—'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isPass ? 'success' : 'danger'}>
                          {isPass ? 'Passed' : 'Failed'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StudentResults;
