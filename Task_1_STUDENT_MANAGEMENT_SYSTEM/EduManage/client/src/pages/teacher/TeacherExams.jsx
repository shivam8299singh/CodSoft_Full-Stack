import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FileSpreadsheet, Plus, Save, Award, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getGradeColor } from '../../utils/formatters';

const TeacherExams = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({}); // { [studentId]: { marks: number, remarks: string } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Exam Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [examForm, setExamForm] = useState({
    name: '',
    examType: 'MIDTERM',
    subjectId: '',
    courseId: '',
    semester: 3,
    date: '2025-11-20',
    maxMarks: 100,
    passingMarks: 40
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchExamsAndSubjects();
  }, []);

  const fetchExamsAndSubjects = async () => {
    try {
      setLoading(true);
      const [exRes, teachRes] = await Promise.all([
        api.get('/exams'),
        api.get('/dashboard/teacher')
      ]);

      if (teachRes.data.success) {
        const subs = teachRes.data.data.subjects || [];
        setTeacherSubjects(subs);
        const subIds = subs.map(s => s.id);
        const filteredExams = (exRes.data.data || []).filter(e => subIds.includes(e.subjectId));
        setExams(filteredExams);

        if (filteredExams.length > 0) {
          handleSelectExam(filteredExams[0]);
        }
      }
    } catch (err) {
      showToast('Failed to load examinations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExam = async (exam) => {
    setSelectedExam(exam);
    try {
      setLoading(true);
      // Fetch students in this course
      const stuRes = await api.get(`/students?course=${exam.courseId}&semester=${exam.semester}&limit=50`);
      const stuList = stuRes.data.data || [];
      setStudents(stuList);

      // Populate existing marks if any
      const initialMarks = {};
      const existingResults = exam.results || [];
      stuList.forEach((stu) => {
        const res = existingResults.find(r => r.studentId === stu.id);
        if (res) {
          initialMarks[stu.id] = { marks: res.marksObtained, remarks: res.remarks || '' };
        } else {
          initialMarks[stu.id] = { marks: '', remarks: '' };
        }
      });
      setMarksMap(initialMarks);
    } catch (e) {
      showToast('Failed to load student marks table', 'error');
    } finally {
      setLoading(false);
    }
  };

  const computeGrade = (marks, maxMarks) => {
    if (marks === '' || marks === undefined || isNaN(marks)) return '—';
    const pct = (parseFloat(marks) / maxMarks) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) return;
    try {
      setSaving(true);
      const resultsPayload = Object.keys(marksMap)
        .filter((stuId) => marksMap[stuId].marks !== '' && !isNaN(marksMap[stuId].marks))
        .map((stuId) => ({
          studentId: stuId,
          marksObtained: parseFloat(marksMap[stuId].marks),
          remarks: marksMap[stuId].remarks
        }));

      const res = await api.post(`/exams/${selectedExam.id}/results`, {
        results: resultsPayload
      });

      if (res.data.success) {
        showToast(`Successfully saved grades for ${resultsPayload.length} students!`, 'success');
        fetchExamsAndSubjects();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit marks', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const sub = teacherSubjects.find(s => s.id === examForm.subjectId);
      const payload = {
        ...examForm,
        courseId: sub ? sub.courseId : examForm.courseId,
        semester: sub ? sub.semester : examForm.semester
      };

      const res = await api.post('/exams', payload);
      if (res.data.success) {
        showToast('Exam created successfully', 'success');
        setCreateModalOpen(false);
        fetchExamsAndSubjects();
      }
    } catch (err) {
      showToast('Failed to create examination', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Examinations & Grading</h1>
          <p className="text-xs text-slate-500 mt-1">
            Administer testing assessments and record evaluated examination scores.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              if (teacherSubjects.length > 0) {
                setExamForm({
                  ...examForm,
                  subjectId: teacherSubjects[0].id,
                  courseId: teacherSubjects[0].courseId,
                  semester: teacherSubjects[0].semester
                });
              }
              setCreateModalOpen(true);
            }}
            icon={Plus}
          >
            Create Exam
          </Button>
          {selectedExam && (
            <Button
              onClick={handleSaveMarks}
              icon={Save}
              variant="success"
              isLoading={saving}
            >
              Save Grades
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exams List Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Teaching Assessments ({exams.length})
          </h3>

          {exams.map((ex) => {
            const isSelected = selectedExam?.id === ex.id;
            return (
              <div
                key={ex.id}
                onClick={() => handleSelectExam(ex)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {ex.examType}
                  </span>
                  <span className={`text-[11px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    Max: {ex.maxMarks} Marks
                  </span>
                </div>
                <h4 className="font-bold text-sm mt-2">{ex.name}</h4>
                <p className={`text-xs mt-1 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {ex.subject?.name} • {formatDate(ex.date)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Marks Entry Sheet */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title={`Marks Grading Sheet — ${selectedExam?.name || 'Selected Exam'}`}
              subtitle={`Maximum Marks: ${selectedExam?.maxMarks || 100} • Passing Threshold: ${selectedExam?.passingMarks || 40}`}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4 w-32">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4">Instructor Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((stu) => {
                    const current = marksMap[stu.id] || { marks: '', remarks: '' };
                    const grade = computeGrade(current.marks, selectedExam?.maxMarks || 100);
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{stu.fullName}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{stu.studentId}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max={selectedExam?.maxMarks || 100}
                            placeholder={`0-${selectedExam?.maxMarks || 100}`}
                            value={current.marks}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMarksMap((prev) => ({
                                ...prev,
                                [stu.id]: {
                                  ...prev[stu.id],
                                  marks: val
                                }
                              }));
                            }}
                            className="w-24 py-1.5 px-3 font-mono font-bold text-slate-900 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md font-bold border text-xs ${getGradeColor(grade)}`}>
                            {grade}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Feedback (e.g. Excellent, Redo)..."
                            value={current.remarks}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMarksMap((prev) => ({
                                ...prev,
                                [stu.id]: {
                                  ...prev[stu.id],
                                  remarks: val
                                }
                              }));
                            }}
                            className="w-full py-1.5 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Exam Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Exam for Subject"
        description="Establish testing date and grading parameters."
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <Input
            label="Exam Title"
            placeholder="e.g. Midterm Test 1"
            value={examForm.name}
            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Subject Module"
              options={teacherSubjects.map((s) => ({ label: `${s.code} — ${s.name}`, value: s.id }))}
              value={examForm.subjectId}
              onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
              required
            />
            <Select
              label="Assessment Type"
              options={[
                { label: 'Midterm', value: 'MIDTERM' },
                { label: 'Final Exam', value: 'FINAL' },
                { label: 'Quiz', value: 'QUIZ' },
                { label: 'Assignment', value: 'ASSIGNMENT' },
              ]}
              value={examForm.examType}
              onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Marks"
              type="number"
              value={examForm.maxMarks}
              onChange={(e) => setExamForm({ ...examForm, maxMarks: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Date"
              type="date"
              value={examForm.date}
              onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Exam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherExams;
