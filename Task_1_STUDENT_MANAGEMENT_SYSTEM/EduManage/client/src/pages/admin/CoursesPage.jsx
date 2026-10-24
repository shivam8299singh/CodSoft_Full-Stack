import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Building,
  BookOpen,
  Layers,
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Users
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState('subjects'); // 'departments' | 'courses' | 'subjects'
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '' });

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({ code: '', name: '', departmentId: '', durationYears: 4, totalSemesters: 8 });

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    credits: 3,
    semester: 1,
    courseId: '',
    teacherId: ''
  });

  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dRes, cRes, sRes, tRes] = await Promise.all([
        api.get('/departments'),
        api.get('/courses'),
        api.get('/subjects'),
        api.get('/teachers')
      ]);
      if (dRes.data.success) setDepartments(dRes.data.data);
      if (cRes.data.success) setCourses(cRes.data.data);
      if (sRes.data.success) setSubjects(sRes.data.data);
      if (tRes.data.success) setTeachers(tRes.data.data);
    } catch (err) {
      showToast('Failed to load academic catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post('/departments', deptForm);
      if (res.data.success) {
        showToast('Department established successfully', 'success');
        setDeptModalOpen(false);
        setDeptForm({ code: '', name: '', description: '' });
        fetchAll();
      }
    } catch (err) {
      showToast('Failed to create department', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post('/courses', courseForm);
      if (res.data.success) {
        showToast('Degree Course program launched', 'success');
        setCourseModalOpen(false);
        setCourseForm({ code: '', name: '', departmentId: '', durationYears: 4, totalSemesters: 8 });
        fetchAll();
      }
    } catch (err) {
      showToast('Failed to create course', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post('/subjects', subjectForm);
      if (res.data.success) {
        showToast('Subject module added to curriculum', 'success');
        setSubjectModalOpen(false);
        setSubjectForm({ code: '', name: '', credits: 3, semester: 1, courseId: '', teacherId: '' });
        fetchAll();
      }
    } catch (err) {
      showToast('Failed to create subject', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Curriculum & Courses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain academic faculties, degree courses, syllabus subjects, and instructor alignments.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {activeTab === 'departments' && (
            <Button onClick={() => setDeptModalOpen(true)} icon={Plus}>
              New Department
            </Button>
          )}
          {activeTab === 'courses' && (
            <Button
              onClick={() => {
                setCourseForm({ ...courseForm, departmentId: departments[0]?.id || '' });
                setCourseModalOpen(true);
              }}
              icon={Plus}
            >
              New Degree Course
            </Button>
          )}
          {activeTab === 'subjects' && (
            <Button
              onClick={() => {
                setSubjectForm({ ...subjectForm, courseId: courses[0]?.id || '' });
                setSubjectModalOpen(true);
              }}
              icon={Plus}
            >
              Add Subject Module
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'subjects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Subjects ({subjects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'courses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses ({courses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'departments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving curriculum tree..." />
      ) : (
        <>
          {/* SUBJECTS TAB */}
          {activeTab === 'subjects' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Subject Code & Name</th>
                      <th className="py-3.5 px-4">Course Program</th>
                      <th className="py-3.5 px-4">Semester</th>
                      <th className="py-3.5 px-4">Credits</th>
                      <th className="py-3.5 px-4">Assigned Professor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <span className="font-mono font-bold text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
                              {sub.code}
                            </span>
                            <span className="font-bold text-slate-900">{sub.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {sub.course?.name || 'Computer Science'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="primary">Sem {sub.semester}</Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          {sub.credits} Credits
                        </td>
                        <td className="py-3.5 px-4">
                          {sub.teacher ? (
                            <span className="font-semibold text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-2.5 py-1 rounded-lg">
                              {sub.teacher.fullName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COURSES TAB */}
          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} hover>
                  <CardBody className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg">
                        {course.code}
                      </span>
                      <Badge variant="primary">{course.durationYears} Years Program</Badge>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center">
                        <Building className="w-3.5 h-3.5 mr-1" />
                        {course.department?.name || 'Faculty Department'}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Total Semesters: {course.totalSemesters}</span>
                      <span>{course.subjects?.length || 4} Subjects</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {/* DEPARTMENTS TAB */}
          {activeTab === 'departments' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <Card key={dept.id} hover>
                  <CardBody className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
                      <Building className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                    <span className="inline-block font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      CODE: {dept.code}
                    </span>
                    <p className="text-xs text-slate-500">{dept.description || 'Academic research and degree department'}</p>
                    <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                      <span>{dept.courses?.length || 1} Degrees</span>
                      <span>{dept.teachers?.length || 2} Faculty</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* New Department Modal */}
      <Modal isOpen={deptModalOpen} onClose={() => setDeptModalOpen(false)} title="Create Academic Department">
        <form onSubmit={handleCreateDept} className="space-y-4">
          <Input
            label="Department Code"
            placeholder="e.g. MECH"
            value={deptForm.code}
            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
            required
          />
          <Input
            label="Department Name"
            placeholder="e.g. Mechanical Engineering"
            value={deptForm.name}
            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
            required
          />
          <Input
            label="Description / Scope"
            placeholder="Academic studies in mechanics, robotics, and thermodynamics"
            value={deptForm.description}
            onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setDeptModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={actionLoading}>Create Department</Button>
          </div>
        </form>
      </Modal>

      {/* New Course Modal */}
      <Modal isOpen={courseModalOpen} onClose={() => setCourseModalOpen(false)} title="Create Degree Course">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Course Code"
            placeholder="e.g. BTECH-MECH"
            value={courseForm.code}
            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
            required
          />
          <Input
            label="Course Name"
            placeholder="e.g. Bachelor of Technology in Mechanical Engineering"
            value={courseForm.name}
            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            required
          />
          <Select
            label="Parent Department"
            options={departments.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id }))}
            value={courseForm.departmentId}
            onChange={(e) => setCourseForm({ ...courseForm, departmentId: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (Years)"
              type="number"
              min="1"
              max="6"
              value={courseForm.durationYears}
              onChange={(e) => setCourseForm({ ...courseForm, durationYears: e.target.value })}
              required
            />
            <Input
              label="Total Semesters"
              type="number"
              min="1"
              max="12"
              value={courseForm.totalSemesters}
              onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setCourseModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={actionLoading}>Create Degree</Button>
          </div>
        </form>
      </Modal>

      {/* New Subject Modal */}
      <Modal isOpen={subjectModalOpen} onClose={() => setSubjectModalOpen(false)} title="Add Subject Module">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subject Code"
              placeholder="e.g. ME301"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
              required
            />
            <Input
              label="Credits"
              type="number"
              min="1"
              max="6"
              value={subjectForm.credits}
              onChange={(e) => setSubjectForm({ ...subjectForm, credits: e.target.value })}
              required
            />
          </div>
          <Input
            label="Subject Name"
            placeholder="e.g. Thermodynamics and Heat Transfer"
            value={subjectForm.name}
            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
            required
          />
          <Select
            label="Belongs to Course"
            options={courses.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))}
            value={subjectForm.courseId}
            onChange={(e) => setSubjectForm({ ...subjectForm, courseId: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Semester"
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ label: `Semester ${s}`, value: s }))}
              value={subjectForm.semester}
              onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
              required
            />
            <Select
              label="Assigned Professor"
              placeholder="Select Instructor (Optional)"
              options={teachers.map((t) => ({ label: t.fullName, value: t.userId }))}
              value={subjectForm.teacherId}
              onChange={(e) => setSubjectForm({ ...subjectForm, teacherId: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setSubjectModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={actionLoading}>Add Subject</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CoursesPage;
