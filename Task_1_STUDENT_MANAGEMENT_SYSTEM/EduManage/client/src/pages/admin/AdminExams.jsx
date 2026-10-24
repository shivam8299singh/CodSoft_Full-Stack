import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FileSpreadsheet, Plus, Calendar, BookOpen, Award, CheckCircle, BarChart3 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Exam Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    name: '',
    examType: 'MIDTERM',
    courseId: '',
    subjectId: '',
    semester: 1,
    date: '2025-11-15',
    maxMarks: 100,
    passingMarks: 40
  });
  const [formLoading, setFormLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eRes, cRes, sRes] = await Promise.all([
        api.get('/exams'),
        api.get('/courses'),
        api.get('/subjects')
      ]);
      if (eRes.data.success) setExams(eRes.data.data);
      if (cRes.data.success) setCourses(cRes.data.data);
      if (sRes.data.success) setSubjects(sRes.data.data);
    } catch (err) {
      showToast('Failed to load examination schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const res = await api.post('/exams', examForm);
      if (res.data.success) {
        showToast('Examination created and scheduled', 'success');
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create exam', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Examination Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Schedule midterms, finals, practical tests, and configure institutional grading parameters.
          </p>
        </div>
        <Button
          onClick={() => {
            setExamForm({
              ...examForm,
              courseId: courses[0]?.id || '',
              subjectId: subjects[0]?.id || ''
            });
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          Schedule Examination
        </Button>
      </div>

      {/* Grid of Exams */}
      {loading ? (
        <LoadingSpinner text="Retrieving exam schedules..." />
      ) : exams.length === 0 ? (
        <EmptyState
          title="No scheduled examinations"
          description="Create and schedule a new examination session for students."
          actionLabel="Schedule Exam"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} hover className="flex flex-col justify-between">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={exam.examType === 'FINAL' ? 'danger' : 'primary'}>
                    {exam.examType}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    Sem {exam.semester}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{exam.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {exam.subject?.name || 'Subject Module'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                    <span className="font-semibold text-slate-800">{formatDate(exam.date)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Marks</span>
                    <span className="font-mono font-bold text-indigo-600">
                      {exam.passingMarks} / {exam.maxMarks} Pass
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Enrolled Course: {exam.course?.name}</span>
                  <span className="font-semibold text-emerald-600">
                    {exam.results?.length || 0} Graded
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Examination"
        description="Configure testing date, enrolled course, subject module, and passing criteria."
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <Input
            label="Exam Title"
            placeholder="e.g. End Semester Final Examination"
            value={examForm.name}
            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Exam Type"
              options={[
                { label: 'Midterm', value: 'MIDTERM' },
                { label: 'Final Exam', value: 'FINAL' },
                { label: 'Class Quiz', value: 'QUIZ' },
                { label: 'Assignment / Project', value: 'ASSIGNMENT' },
              ]}
              value={examForm.examType}
              onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
              required
            />
            <Input
              label="Examination Date"
              type="date"
              value={examForm.date}
              onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
              required
            />
          </div>

          <Select
            label="Target Degree Course"
            options={courses.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))}
            value={examForm.courseId}
            onChange={(e) => setExamForm({ ...examForm, courseId: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Subject Module"
              options={subjects.map((s) => ({ label: `${s.code} - ${s.name}`, value: s.id }))}
              value={examForm.subjectId}
              onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
              required
            />
            <Select
              label="Target Semester"
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ label: `Semester ${s}`, value: s }))}
              value={examForm.semester}
              onChange={(e) => setExamForm({ ...examForm, semester: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Maximum Marks"
              type="number"
              min="10"
              max="500"
              value={examForm.maxMarks}
              onChange={(e) => setExamForm({ ...examForm, maxMarks: e.target.value })}
              required
            />
            <Input
              label="Passing Marks"
              type="number"
              min="1"
              max={examForm.maxMarks}
              value={examForm.passingMarks}
              onChange={(e) => setExamForm({ ...examForm, passingMarks: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={formLoading}>
              Schedule Examination
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminExams;
