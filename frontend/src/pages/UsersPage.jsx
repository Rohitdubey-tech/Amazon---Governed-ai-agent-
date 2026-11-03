import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';

export function UsersPage() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await api.auth.listUsers();
        setUsersList(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A2230] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Enterprise User Directory & RBAC</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#18202D] text-slate-300 border border-[#232D40]">
              {usersList.length} Accounts
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Backend-enforced role assignments. Hiding a button on the client is not authorization; the gateway verifies principal scope.
          </p>
        </div>
      </div>

      {/* RBAC Matrix Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121620] p-4 rounded-2xl border border-[#1E2536]">
          <Badge variant="EMPLOYEE">EMPLOYEE</Badge>
          <h4 className="text-sm font-bold text-white mt-2">Task Submitter</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Can submit natural-language tasks, attach receipts, view own submitted claims. Cannot approve claims or alter policies.
          </p>
        </div>
        <div className="bg-[#121620] p-4 rounded-2xl border border-[#1E2536]">
          <Badge variant="MANAGER">MANAGER</Badge>
          <h4 className="text-sm font-bold text-white mt-2">Approval Authority</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Can review paused workflows exceeding policy thresholds, inspect exact action hashes, and approve/reject claims.
          </p>
        </div>
        <div className="bg-[#121620] p-4 rounded-2xl border border-[#1E2536]">
          <Badge variant="ADMIN">ADMIN</Badge>
          <h4 className="text-sm font-bold text-white mt-2">Governance Administrator</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Can activate/deactivate deterministic policies, modify threshold limits, manage user directory, and run benchmark suites.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#121620] rounded-2xl border border-[#1E2536] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0E121B] border-b border-[#1A2230] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">RBAC Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171D29]">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-[#151C28] transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1A2230] text-[#ccff00] font-bold text-xs flex items-center justify-center border border-[#263347]">
                        {u.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                    {u.department}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={u.role}>{u.role}</Badge>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant={u.status}>{u.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
