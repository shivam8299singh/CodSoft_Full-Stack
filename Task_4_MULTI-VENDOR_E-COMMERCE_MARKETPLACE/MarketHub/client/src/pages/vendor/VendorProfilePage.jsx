import React from 'react';
import { Store, MapPin, Mail, Phone, ShieldCheck, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const VendorProfilePage = () => {
  const { user } = useAuth();
  const vendor = user?.vendor;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="pb-6 border-b border-slate-200/80">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vendor Storefront Profile</h2>
        <p className="text-xs text-slate-500 mt-1">Official merchant registration and storefront details</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shrink-0">
            {vendor?.logo ? (
              <img src={vendor.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-10 h-10" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900">{vendor?.businessName}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                {vendor?.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Managed by {vendor?.ownerName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Merchant Email</span>
            <p className="font-semibold text-slate-900">{vendor?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contact Phone</span>
            <p className="font-semibold text-slate-900">{vendor?.phone || '—'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 space-y-1 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Business Address</span>
            <p className="font-semibold text-slate-900">{vendor?.address}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 space-y-1 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Marketplace Commission Agreement</span>
            <p className="font-semibold text-slate-900">{vendor?.commissionRate}% standard fee per delivered order</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;
