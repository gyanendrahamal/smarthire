import React, { useState, useEffect } from 'react';
import { Building, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import CompanyLogo from '../../components/common/CompanyLogo';

export const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      if (res.success) {
        setCompanies(res.companies);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleUpdateVerification = async (companyId, verificationStatus) => {
    try {
      const res = await api.patch(`/admin/companies/${companyId}/verification`, {
        verificationStatus,
      });
      if (res.success) {
        setCompanies(
          companies.map((c) => (c.id === companyId ? { ...c, verificationStatus } : c))
        );
      }
    } catch (err) {
      alert(err.message || 'Verification update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Employer & Company Verification
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review company credentials to ensure authentic and safe job listings for candidates.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Industry & Location</th>
                <th className="px-6 py-4">Recruiter Contacts</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        src={c.logo}
                        name={c.companyName}
                        className="w-10 h-10 rounded-xl flex-shrink-0 shadow-sm"
                      />
                      <div>
                        <div>{c.companyName}</div>
                        {c.website && (
                          <a href={c.website} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline font-normal">
                            {c.website}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div>{c.industry || 'Technology'}</div>
                    <div className="text-[11px] text-slate-400">{c.location || 'Remote'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {c.members?.map((m) => (
                      <div key={m.id} className="text-[11px]">
                        {m.user?.fullName} ({m.user?.email})
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={c.verificationStatus} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {c.verificationStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => handleUpdateVerification(c.id, 'VERIFIED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                        >
                          Verify
                        </button>
                      )}
                      {c.verificationStatus !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateVerification(c.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCompaniesPage;
