import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GraduationCap, Mail, Phone, Building, BookOpen, Award, Save } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TeacherProfile = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [teacher, setTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/teacher');
      if (res.data.success) {
        setTeacher(res.data.data.teacher);
        setSubjects(res.data.data.subjects || []);
        setPhone(res.data.data.teacher?.phone || '');
        setQualification(res.data.data.teacher?.qualification || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put(`/teachers/${teacher.id}`, { phone, qualification });
      if (res.data.success) {
        showToast('Profile information updated successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving faculty profile..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review academic qualifications and update institutional contact records.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center space-x-5">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-600/20">
          {teacher?.fullName?.[0] || 'P'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{teacher?.fullName}</h2>
          <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {teacher?.teacherId}
          </span>
          <p className="text-xs text-slate-500 mt-1">
            {teacher?.department?.name || 'Department of Computer Science'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Contact & Qualifications" subtitle="Edit your personal phone and academic degrees" />
          <CardBody>
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="Email (Institutional Login)"
                value={user?.email || teacher?.email || ''}
                disabled
              />
              <Input
                label="Phone Contact"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0101"
              />
              <Input
                label="Academic Qualifications"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. Ph.D. in Computer Science"
              />
              <div className="pt-2">
                <Button type="submit" variant="primary" icon={Save} isLoading={saving}>
                  Update Profile
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Assigned Modules" subtitle="Current term teaching allocation" />
          <CardBody className="space-y-3">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                    {sub.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1">{sub.name}</h4>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Sem {sub.semester} • {sub.credits} Credits
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default TeacherProfile;
