import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { CheckCircle2, XCircle, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const permissions = [
    { name: "Submit AI Agent Tasks", employee: true, manager: true, admin: true },
    { name: "Attach and Process Synthetic Receipts", employee: true, manager: true, admin: true },
    { name: "View Own Submitted Claims", employee: true, manager: true, admin: true },
    { name: "Review Pending Threshold Approvals", employee: false, manager: true, admin: true },
    { name: "Approve / Reject Proposed Actions", employee: false, manager: true, admin: true },
    { name: "Activate / Deactivate Policies", employee: false, manager: false, admin: true },
    { name: "Modify Threshold Limits & Policy Versions", employee: false, manager: false, admin: true },
    { name: "Run 50-Benchmark Evaluation Suite", employee: false, manager: true, admin: true },
    { name: "Access Raw Immutable Audit Payload", employee: true, manager: true, admin: true }
  ];

  const currentRole = user?.role || 'EMPLOYEE';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-[#1A2230] pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">User Profile & RBAC Permissions</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your authenticated identity, security credentials, and active policy authority.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-[#121620] rounded-2xl border border-[#1E2536] p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-lime-400 text-slate-950 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#ccff00]/20">
            {user?.avatar || 'PS'}
          </div>
          <h3 className="text-base font-bold text-white mt-4">{user?.name}</h3>
          <p className="text-xs text-slate-400">{user?.email}</p>
          <div className="mt-2">
            <Badge variant={user?.role} size="lg">{user?.role}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">{user?.department}</p>

          <div className="mt-6 pt-6 border-t border-[#1A2230] space-y-2 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">User Identifier:</span>
              <span className="font-mono text-slate-200 font-semibold">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Authentication:</span>
              <span className="font-mono text-[#ccff00] font-semibold">JWT Bearer (Valid)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Session Status:</span>
              <span className="font-semibold text-emerald-400">ACTIVE</span>
            </div>
          </div>

          {/* Quick Persona Switcher */}
          <div className="mt-6 pt-6 border-t border-[#1A2230]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Demo Persona Switcher:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(['EMPLOYEE', 'MANAGER', 'ADMIN']).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    user?.role === r
                      ? 'bg-[#ccff00] text-slate-950 shadow-xs'
                      : 'bg-[#161D2B] text-slate-400 hover:text-white hover:bg-[#1E2738]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="mt-6 pt-6 border-t border-[#1A2230]">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-950/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of AgentShield AI</span>
            </button>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-2 bg-[#121620] rounded-2xl border border-[#1E2536] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A2230] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Effective Permissions Matrix</h3>
              <p className="text-xs text-slate-400">Enforced by backend Governance Gateway on every operation</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#ccff00] bg-[#172214] border border-[#23381E] px-2.5 py-1 rounded-xl">
              Role: {currentRole}
            </span>
          </div>

          <div className="divide-y divide-[#171D29] text-xs">
            {permissions.map((perm, idx) => {
              const isAllowed =
                (currentRole === 'EMPLOYEE' && perm.employee) ||
                (currentRole === 'MANAGER' && perm.manager) ||
                (currentRole === 'ADMIN' && perm.admin);

              return (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <span className={isAllowed ? 'text-slate-200 font-medium' : 'text-slate-600'}>
                    {perm.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isAllowed ? (
                      <span className="inline-flex items-center gap-1 text-[#ccff00] font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authorized</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <XCircle className="w-4 h-4" />
                        <span>Forbidden</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
