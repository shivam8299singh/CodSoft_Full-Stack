import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Building,
  Mail,
  Phone,
  Calendar,
  Check
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    departmentId: '',
    qualification: '',
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Assign Subjects Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState(null);
  const [assignedSubjectIds, setAssignedSubjectIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, [search, selectedDept]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, dRes, sRes] = await Promise.all([
        api.get('/teachers', { params: { search, department: selectedDept } }),
        api.get('/departments'),
        api.get('/subjects')
      ]);
      if (tRes.data.success) setTeachers(tRes.data.data);
      if (dRes.data.success) setDepartments(dRes.data.data);
      if (sRes.data.success) setSubjects(sRes.data.data);
    } catch (err) {
      showToast('Failed to load faculty directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentTeacherId(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      qualification: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher) => {
    setModalMode('edit');
    setCurrentTeacherId(teacher.id);
    setFormData({
      fullName: teacher.fullName,
      email: teacher.user?.email || '',
      phone: teacher.phone || '',
      departmentId: teacher.departmentId,
      qualification: teacher.qualification || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      if (modalMode === 'add') {
        const res = await api.post('/teachers', formData);
        if (res.data.success) {
          showToast('Faculty member registered successfully', 'success');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/teachers/${currentTeacherId}`, formData);
        if (res.data.success) {
          showToast('Faculty details updated', 'success');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenAssignModal = (teacher) => {
    setSelectedTeacherForAssign(teacher);
    const currentSubs = teacher.subjects ? teacher.subjects.map(s => s.id) : [];
    setAssignedSubjectIds(currentSubs);
    setAssignModalOpen(true);
  };

  const toggleSubjectAssign = (subjectId) => {
    setAssignedSubjectIds(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSaveAssignedSubjects = async () => {
    if (!selectedTeacherForAssign) return;
    try {
      setAssignLoading(true);
      const res = await api.post(`/teachers/${selectedTeacherForAssign.id}/assign-subjects`, {
        subjectIds: assignedSubjectIds
      });
      if (res.data.success) {
        showToast('Assigned subjects updated successfully', 'success');
        setAssignModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast('Failed to assign subjects', 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeletePrompt = (teacher) => {
    setTeacherToDelete(teacher);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/teachers/${teacherToDelete.id}`);
      showToast('Faculty member removed from directory', 'success');
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to remove faculty member', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic professors, assign course modules, and oversee teaching allocations.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} icon={Plus}>
          Add Faculty Member
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by faculty name or ID (e.g. TCH-1001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full sm:w-56 py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Teachers Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving faculty roster..." />
        ) : teachers.length === 0 ? (
          <EmptyState
            title="No faculty members found"
            description="Add a new teacher or adjust your search filter."
            actionLabel="Add Faculty Member"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Faculty Member</th>
                  <th className="py-3.5 px-4">Teacher ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Qualification</th>
                  <th className="py-3.5 px-4">Assigned Subjects</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
                          {teacher.fullName[0]}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{teacher.fullName}</span>
                          <span className="text-[11px] text-slate-400">{teacher.user?.email || '—'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Teacher ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-[11px]">
                        {teacher.teacherId}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <Badge variant="primary">{teacher.department?.name || 'Department'}</Badge>
                    </td>

                    {/* Qualification */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 block">{teacher.qualification || 'Master of Science'}</span>
                    </td>

                    {/* Assigned Subjects */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((sub) => (
                            <span
                              key={sub.id}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[11px] font-medium text-indigo-700"
                            >
                              {sub.code}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None assigned</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenAssignModal(teacher)}
                          title="Assign Subjects"
                          className="px-2.5 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors font-semibold text-[11px] flex items-center space-x-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(teacher)}
                          title="Edit Faculty Member"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(teacher)}
                          title="Delete Faculty Member"
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
      </div>

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Register New Faculty Member' : 'Edit Faculty Member'}
        description="Provide academic and contact details to maintain institutional teaching records."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Full Name & Academic Title"
            placeholder="e.g. Dr. Robert Langdon"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Institutional Email"
            type="email"
            placeholder="robert.langdon@edumanage.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={modalMode === 'edit'}
            required
          />
          <Input
            label="Phone Number"
            placeholder="+1 555-0105"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            label="Academic Department"
            options={departments.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id }))}
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            required
          />
          <Input
            label="Academic Qualifications"
            placeholder="e.g. Ph.D. in Computer Science (MIT)"
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
          />

          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalLoading}>
              {modalMode === 'add' ? 'Register Teacher' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Subjects Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Subjects — ${selectedTeacherForAssign?.fullName}`}
        description="Select the academic modules and courses taught by this faculty member."
        maxWidth="max-w-xl"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {subjects.map((sub) => {
            const isAssigned = assignedSubjectIds.includes(sub.id);
            return (
              <div
                key={sub.id}
                onClick={() => toggleSubjectAssign(sub.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isAssigned
                    ? 'border-indigo-500 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                      {sub.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">{sub.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Semester {sub.semester} • {sub.credits} Credits • {sub.course?.name || 'Computer Science'}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                    isAssigned ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isAssigned && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveAssignedSubjects} isLoading={assignLoading}>
            Update Assignments
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
        title="Remove Faculty Member"
        message={`Are you sure you want to delete ${teacherToDelete?.fullName}? This will unassign all their courses and remove their access.`}
        confirmText="Confirm Removal"
      />
    </div>
  );
};

export default TeachersList;
