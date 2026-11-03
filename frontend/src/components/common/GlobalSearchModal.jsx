import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  LayoutGrid,
  Sparkles,
  Receipt,
  CheckSquare,
  ShieldCheck,
  History,
  BarChart3,
  Users,
  UserCheck,
  ArrowRight,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

export function GlobalSearchModal({ isOpen, onClose, initialQuery = '' }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState(initialQuery);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      async function fetchData() {
        try {
          const [c, p, u] = await Promise.all([
            api.claims.list(),
            api.policies.list(),
            api.auth.listUsers()
          ]);
          setClaims(c || []);
          setPolicies(p || []);
          setUsersList(u || []);
        } catch (e) {
          // quiet
        }
      }
      fetchData();
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const navPages = [
    { title: 'Overview Dashboard', subtitle: 'Executive metrics & sales breakdown', route: '/dashboard', icon: LayoutGrid, category: 'Navigation' },
    { title: 'AI Agent Workspace', subtitle: 'Interactive natural language execution', route: '/workspace', icon: Sparkles, category: 'Navigation' },
    { title: 'Expense Claims', subtitle: 'Browse simulated ledger claims', route: '/claims', icon: Receipt, category: 'Navigation' },
    { title: 'Approvals Queue', subtitle: 'Manager authorization & hash binding', route: '/approvals', icon: CheckSquare, category: 'Navigation' },
    { title: 'Policy Engine', subtitle: 'Deterministic governance rules', route: '/policies', icon: ShieldCheck, category: 'Navigation' },
    { title: 'Security Audit Trail', subtitle: 'End-to-end verifiable events', route: '/audit-logs', icon: History, category: 'Navigation' },
    { title: '50-Benchmark Suite', subtitle: 'Automated test suite evaluation', route: '/evaluations', icon: BarChart3, category: 'Navigation' },
    { title: 'User Directory', subtitle: 'Enterprise user directory & RBAC', route: '/admin/users', icon: Users, category: 'Navigation' },
    { title: 'Profile & RBAC', subtitle: 'Your active identity & permissions', route: '/profile', icon: UserCheck, category: 'Navigation' }
  ];

  const q = query.trim().toLowerCase();

  // Filter navigation pages
  const filteredPages = navPages.filter(p =>
    !q || p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
  );

  // Filter claims
  const filteredClaims = claims.filter(c =>
    q && (
      c.merchant?.toLowerCase().includes(q) ||
      c.id?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      String(c.amount).includes(q) ||
      c.user_name?.toLowerCase().includes(q)
    )
  ).slice(0, 4).map(c => ({
    title: `${c.merchant} • ₹${c.amount?.toLocaleString('en-IN')}`,
    subtitle: `Claim ID: ${c.id} • Status: ${c.status} (${c.category})`,
    route: `/claims/${c.id}`,
    icon: Receipt,
    category: 'Claims'
  }));

  // Filter policies
  const filteredPolicies = policies.filter(pol =>
    q && (
      pol.policy_code?.toLowerCase().includes(q) ||
      pol.name?.toLowerCase().includes(q) ||
      pol.description?.toLowerCase().includes(q)
    )
  ).slice(0, 3).map(pol => ({
    title: `${pol.policy_code}: ${pol.name}`,
    subtitle: pol.description,
    route: '/policies',
    icon: ShieldCheck,
    category: 'Policies'
  }));

  // Filter users
  const filteredUsers = usersList.filter(u =>
    q && (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    )
  ).slice(0, 3).map(u => ({
    title: `${u.name} (${u.role})`,
    subtitle: `${u.email} • ${u.department}`,
    route: '/admin/users',
    icon: Users,
    category: 'Users'
  }));

  const allResults = [
    ...filteredClaims,
    ...filteredPolicies,
    ...filteredUsers,
    ...filteredPages
  ];

  const handleSelect = (item) => {
    onClose();
    navigate(item.route);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allResults.length) % (allResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-[#0F141F] border border-[#222B3D] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-[#1A2230] flex items-center gap-3 bg-[#131926]">
              <Search className="w-5 h-5 text-[#ccff00] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search claims, policies, pages, employees, or tasks..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-[#1A2230] border border-[#263347]">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-3 space-y-1 divide-y divide-[#171D2A] flex-1">
              {allResults.length > 0 ? (
                allResults.map((item, idx) => {
                  const Icon = item.icon || FileText;
                  const isSelected = selectedIndex === idx;

                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 2 }}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#ccff00] text-slate-950 shadow-md'
                          : 'hover:bg-[#161D2B] text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isSelected ? 'bg-slate-950 text-[#ccff00]' : 'bg-[#18202D] text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${
                            isSelected ? 'text-slate-950' : 'text-white'
                          }`}>
                            {item.title}
                          </div>
                          <div className={`text-[11px] truncate ${
                            isSelected ? 'text-slate-800 font-medium' : 'text-slate-400'
                          }`}>
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pl-3">
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-slate-950 text-[#ccff00]' : 'bg-[#141A26] text-slate-500 border border-[#20293A]'
                        }`}>
                          {item.category}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-600'}`} />
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <p>No results found for "{query}".</p>
                  <p className="text-[11px] text-slate-600 mt-1">Try searching "IndiGo", "POL-CAT-02", "Priya", or "Workspace".</p>
                </div>
              )}
            </div>

            {/* Footer keyboard hints */}
            <div className="px-4 py-2.5 bg-[#0C1019] border-t border-[#18202E] flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.2 bg-[#171E2B] rounded text-[10px] text-slate-300 font-mono">↑↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.2 bg-[#171E2B] rounded text-[10px] text-slate-300 font-mono">↵</kbd>
                  <span>select</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-600">Global Command Search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
