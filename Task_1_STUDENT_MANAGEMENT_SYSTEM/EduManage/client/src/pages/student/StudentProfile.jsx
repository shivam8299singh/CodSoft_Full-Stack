import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, MapPin, Building, GraduationCap, Calendar, Award } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const StudentProfile = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/student');
      if (res.data.success) {
        setStudent(res.data.data.student);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving student dossier..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Academic Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review official institutional matriculation records and contact details.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center space-x-5">
        <img
          src={student?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80'}
          alt={student?.fullName}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
        />
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">{student?.fullName}</h2>
            <Badge variant="primary">Sem {student?.semester}</Badge>
          </div>
          <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
            {student?.studentId}
          </span>
          <p className="text-xs text-slate-500 mt-1">
            {student?.course?.name} • {student?.department?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Academic Program" />
          <CardBody className="space-y-4 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-400">Degree Program</span>
              <span className="font-bold text-slate-800">{student?.course?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-400">Department</span>
              <span className="font-bold text-slate-800">{student?.department?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-400">Current Semester</span>
              <span className="font-bold text-slate-800">Semester {student?.semester}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Enrollment Date</span>
              <span className="font-bold text-slate-800">{formatDate(student?.enrollmentDate)}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Personal Information" />
          <CardBody className="space-y-4 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-400">Institutional Email</span>
              <span className="font-bold text-slate-800">{student?.user?.email || user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-400">Phone Contact</span>
              <span className="font-bold text-slate-800">{student?.phone || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-400">Date of Birth</span>
              <span className="font-bold text-slate-800">{formatDate(student?.dateOfBirth)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Address</span>
              <span className="font-bold text-slate-800 text-right">{student?.address || '—'}</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
