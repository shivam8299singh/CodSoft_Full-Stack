import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Settings, Shield, Building, Database, Save, RefreshCw } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const AdminSettings = () => {
  const [institutionName, setInstitutionName] = useState('EduManage Institute of Technology');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [adminEmail, setAdminEmail] = useState('admin@edumanage.com');
  const [currencySymbol, setCurrencySymbol] = useState('$ USD');
  const [isSaving, setIsSaving] = useState(false);

  const { showToast } = useToast();

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Institutional configurations saved successfully', 'success');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure university parameters, default terms, currency denominations, and administrative credentials.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <Card>
          <CardHeader
            title="Institution Profile"
            subtitle="Details visible across transcripts, fee invoices, and student communications"
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Institution Name"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
              />
              <Input
                label="Active Academic Year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />
              <Input
                label="Primary Administrator Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
              <Input
                label="Financial Currency"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                required
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Database & Service Health"
            subtitle="Architecture status for PostgreSQL and Prisma ORM integration"
          />
          <CardBody className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-indigo-900">Database Engine</h4>
                <p className="text-[11px] text-indigo-700 mt-0.5">PostgreSQL with Prisma Client ORM</p>
              </div>
              <span className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-full text-[10px]">
                Active Engine
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">API Gateway & Port</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Express.js on http://localhost:5000</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                Operational
              </span>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={Save} isLoading={isSaving}>
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
