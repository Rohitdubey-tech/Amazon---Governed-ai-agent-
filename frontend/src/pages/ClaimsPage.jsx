import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, Receipt } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadClaims() {
      try {
        const data = await api.claims.list();
        setClaims(data);
      } catch (err) {
        console.error("Failed to load claims:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClaims();
  }, []);

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.merchant.toLowerCase().includes(search.toLowerCase()) ||
      claim.id.toLowerCase().includes(search.toLowerCase()) ||
      claim.user_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A2230] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Simulated Expense Claims</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#18202D] text-slate-300 border border-[#232D40]">
              {claims.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulated business expense claims governed by deterministic policy rules. No real financial transfers occur.
          </p>
        </div>
        <Link to="/workspace">
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(204,255,0,0.35)' }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 bg-[#ccff00] hover:bg-[#bbf000] text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-[#ccff00]/15 transition-colors flex items-center gap-2 self-start cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Submit via AI Agent</span>
          </motion.button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#121620] p-3 rounded-2xl border border-[#1E2536] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search merchant, claim ID, or employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#232D3F] bg-[#0A0E16] text-white focus:outline-none focus:border-[#ccff00]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto text-xs">
          <span className="text-slate-500 text-[10px] font-bold uppercase pr-1">Filter:</span>
          {['ALL', 'PROCESSED', 'WAITING_FOR_APPROVAL', 'BLOCKED'].map((st) => (
            <motion.button
              key={st}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#ccff00] text-slate-950 shadow-xs'
                  : 'bg-[#161D2B] text-slate-400 hover:text-white hover:bg-[#1F2738]'
              }`}
            >
              {st === 'WAITING_FOR_APPROVAL' ? 'PENDING APPROVAL' : st}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-[#121620] rounded-2xl border border-[#1E2536] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0E121B] border-b border-[#1A2230] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Merchant / Purpose</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Governance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171D29]">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => (
                  <motion.tr
                    key={claim.id}
                    whileHover={{ x: 3, backgroundColor: '#151C28' }}
                    className="transition-colors cursor-pointer"
                    onClick={() => navigate(`/claims/${claim.id}`)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#ccff00] whitespace-nowrap">
                      {claim.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-white">{claim.merchant}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs">{claim.receipt_name}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-200 font-medium">{claim.user_name}</div>
                      <div className="text-[10px] text-slate-500">{claim.user_email}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-[#161D2B] border border-[#232D3F] text-[10px] text-slate-300 font-medium">
                        {claim.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-white font-mono">
                      ₹{claim.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={claim.governance_decision}>{claim.governance_decision}</Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={claim.status}>{claim.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <motion.button
                        whileHover={{ scale: 1.2, color: '#ccff00' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/claims/${claim.id}`);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-[#1A2230] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 text-xs">
                    No expense claims match current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
