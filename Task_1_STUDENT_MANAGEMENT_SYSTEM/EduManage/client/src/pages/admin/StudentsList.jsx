import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  BookOpen,
  Building,
  GraduationCap
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    departmentId: '',
    courseId: '',
    semester: 1,
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Confirm delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, selectedDept, selectedSem, page]);

  const fetchMetadata = async () => {
    try {
      const [deptRes, courseRes] = await Promise.all([
        api.get('/departments'),
        api.get('/courses')
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (courseRes.data.success) setCourses(courseRes.data.data);
    } catch (err) {
      console.error('Failed to fetch departments/courses:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students', {
        params: {
          search,
          department: selectedDept,
          semester: selectedSem,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setStudents(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast('Failed to load students directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentStudentId(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      gender: 'Male',
      dateOfBirth: '2004-05-15',
      address: '',
      departmentId: departments[0]?.id || '',
      courseId: courses[0]?.id || '',
      semester: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setModalMode('edit');
    setCurrentStudentId(student.id);
    setFormData({
      fullName: student.fullName,
      email: student.user?.email || '',
      phone: student.phone || '',
      gender: student.gender || 'Male',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      address: student.address || '',
      departmentId: student.departmentId,
      courseId: student.courseId,
      semester: student.semester,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      if (modalMode === 'add') {
        const res = await api.post('/students', formData);
        if (res.data.success) {
          showToast('Student enrolled successfully', 'success');
          setIsModalOpen(false);
          fetchStudents();
        }
      } else {
        const res = await api.put(`/students/${currentStudentId}`, formData);
        if (res.data.success) {
          showToast('Student information updated', 'success');
          setIsModalOpen(false);
          fetchStudents();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeletePrompt = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/students/${studentToDelete.id}`);
      showToast('Student record removed from directory', 'success');
      setDeleteDialogOpen(false);
      fetchStudents();
    } catch (err) {
      showToast('Failed to delete student', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage student registrations, academic enrollments, and institutional dossiers.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} icon={Plus}>
          Enroll New Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID (e.g. STU-2024-1001), or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={selectedSem}
            onChange={(e) => {
              setSelectedSem(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-36 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving student profiles..." />
        ) : students.length === 0 ? (
          <EmptyState
            title="No students matched your criteria"
            description="Try adjusting your filters or search keywords, or add a new student."
            actionLabel="Enroll Student"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Department & Program</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.profilePhoto || 'https://images.unsplash.com/photo-1534528741775?w=100&auto=format&fit=crop&q=80'}
                          alt={student.fullName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775?w=100&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{student.fullName}</span>
                          <span className="text-[11px] text-slate-400">{student.user?.email || student.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-[11px]">
                        {student.studentId}
                      </span>
                    </td>

                    {/* Department & Course */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {student.department?.code || 'CSE'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {student.course?.name || 'B.Tech Computer Science'}
                        </span>
                      </div>
                    </td>

                    {/* Semester */}
                    <td className="py-3.5 px-4">
                      <Badge variant="primary">Sem {student.semester}</Badge>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 block">{student.phone || '—'}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => navigate(`/admin/students/${student.id}`)}
                          title="View Profile Dossier"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          title="Edit Student"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(student)}
                          title="Delete Student"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          totalItems={pagination.total}
          itemsPerPage={10}
        />
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Enroll New Student' : 'Edit Student Dossier'}
        description={
          modalMode === 'add'
            ? 'Fill in the information below to enroll a new student and generate their academic login.'
            : 'Update the biographical or course details for this student record.'
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Legal Name"
              placeholder="e.g. Jordan Matthews"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label="Institutional Email"
              type="email"
              placeholder="jordan.m@edumanage.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={modalMode === 'edit'}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1 555-0199"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            <Select
              label="Gender"
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            />
            <Select
              label="Department"
              options={departments.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id }))}
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              required
            />
            <Select
              label="Degree Course"
              options={courses.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))}
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              required
            />
            <Select
              label="Current Semester"
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ label: `Semester ${s}`, value: s }))}
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Residential Address"
            placeholder="123 University Campus Way, Building B"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalLoading}>
              {modalMode === 'add' ? 'Enroll Student' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete student "${studentToDelete?.fullName}" (${studentToDelete?.studentId})? This will also remove associated enrollments and grade logs.`}
        confirmText="Confirm Deletion"
      />
    </div>
  );
};

export default StudentsList;
