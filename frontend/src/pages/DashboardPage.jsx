import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  ChevronDown,
  ArrowUpRight,
  Star,
  ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Today');
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const sum = await api.dashboard.getSummary();
        const claims = await api.claims.list();
        setSummary(sum);
        setRecentClaims(claims.slice(0, 4));
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Donut chart data matching the screenshot circular chart
  const donutData = [
    { name: 'Travel', value: 55640, color: '#ccff00' },
    { name: 'Hardware', value: 11420, color: '#22c55e' },
    { name: 'Services', value: 1840, color: '#38bdf8' },
    { name: 'Meals', value: 2120, color: '#e2e8f0' }
  ];

  // Wave area chart data matching the glowing green wave in the screenshot
  const waveData = [
    { time: '1', val: 32 },
    { time: '2', val: 45 },
    { time: '3', val: 40 },
    { time: '4', val: 68 },
    { time: '5', val: 55 },
    { time: '6', val: 85 },
    { time: '7', val: 78 },
    { time: '8', val: 95 }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header with 'Overview' and interactive time selector */}
      <div className="flex items-center justify-between relative">
        <h1 className="text-xl font-bold text-white tracking-tight">Overview</h1>
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121620] border border-[#1E2433] text-xs font-semibold text-slate-300 hover:border-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </motion.button>
          {timeDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-[#121620] border border-[#1E2536] rounded-xl shadow-xl py-1 z-20 text-xs">
              {['Today', 'This Week', 'This Quarter'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTimeRange(t); setTimeDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 transition-colors cursor-pointer ${
                    timeRange === t ? 'text-[#ccff00] font-bold bg-[#1A2232]' : 'text-slate-300 hover:text-white hover:bg-[#161D2B]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards Row (4 cards with subtle entrance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Revenue"
          value={`$${(3131021).toLocaleString()}`}
          trend="0.4% vs last month"
        />
        <StatCard
          title="ARR"
          value={`$${(1511121).toLocaleString()}`}
          trend="32% vs last quarter"
        />
        <StatCard
          title="Quarterly Revenue Goal"
          value="71%"
          gaugePercent={71}
          subtitle="Goal $2.1M"
        />
        <StatCard
          title="New Orders"
          value={(18221).toLocaleString()}
          trend="11% vs last quarter"
        />
      </div>

      {/* 3. Middle Row: Sales Overview Donut (left) + Mini Stats & Green Wave Chart (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Donut Chart Card (7 cols) */}
        <motion.div 
          whileHover={{ borderColor: '#26334A' }}
          className="lg:col-span-7 bg-[#121620] rounded-2xl p-5 border border-[#1E2433] flex flex-col justify-between transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">Sales Overview</h3>
            <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-2">
            {/* Donut Chart with center label */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={52}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#121620"
                    strokeWidth={3}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-extrabold text-white">102k</span>
                <span className="text-[10px] text-slate-400">Weekly Visits</span>
              </div>
            </div>

            {/* Right side breakdown with highlight badge */}
            <div className="flex-1 w-full space-y-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 p-2 rounded-xl bg-[#18202D] border border-[#253043] text-xs cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-neon-pulse" />
                <span className="text-slate-400 text-[11px]">Number of Sales</span>
                <span className="font-bold text-white font-mono">$71,020</span>
              </motion.div>

              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs pt-1">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
                    <span>Electronic</span>
                  </div>
                  <div className="font-bold text-white font-mono mt-0.5">$55,640</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span>Furniture</span>
                  </div>
                  <div className="font-bold text-white font-mono mt-0.5">$11,420</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                    <span>Clothes</span>
                  </div>
                  <div className="font-bold text-white font-mono mt-0.5">$1,840</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span>Shoes</span>
                  </div>
                  <div className="font-bold text-white font-mono mt-0.5">$2,120</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Stacked mini stats + glowing green wave area chart (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Top mini row */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              whileHover={{ y: -2, borderColor: '#2E3B52' }}
              className="bg-[#121620] rounded-2xl p-4 border border-[#1E2433] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
                <span>New customers</span>
              </div>
              <div className="text-xl font-extrabold text-white mt-1">002</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Last Week</div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2, borderColor: '#2E3B52' }}
              className="bg-[#121620] rounded-2xl p-4 border border-[#1E2433] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Gross profit</span>
              </div>
              <div className="text-xl font-extrabold text-white mt-1">$25.6k</div>
              <div className="text-[10px] text-[#ccff00] mt-0.5 font-semibold">▲ +47% Weekly Profit</div>
            </motion.div>
          </div>

          {/* Bottom glowing green wave chart */}
          <motion.div 
            whileHover={{ borderColor: '#2E3B52' }}
            className="bg-[#121620] rounded-2xl p-4 border border-[#1E2433] flex-1 flex flex-col justify-between transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Profit</p>
                <h4 className="text-base font-extrabold text-white font-mono mt-0.5">$136,755.77</h4>
              </div>
              <span className="text-[10px] text-[#ccff00] font-semibold bg-[#ccff00]/10 border border-[#ccff00]/20 px-2 py-0.5 rounded-full">
                Live Wave
              </span>
            </div>

            <div className="h-20 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waveData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glowWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ccff00" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#ccff00"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#glowWave)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. Bottom Row: Customer List (left) + Premium Plan Glowing Card (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Customer List Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#121620] rounded-2xl p-5 border border-[#1E2433]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Customer list</h3>
            <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2433] text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold text-center">Deals</th>
                  <th className="pb-3 font-semibold text-right">Total Deal Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18202D]">
                <motion.tr 
                  whileHover={{ backgroundColor: '#151C28' }}
                  className="transition-colors cursor-pointer" 
                  onClick={() => navigate('/claims')}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-bold text-[10px] flex items-center justify-center">
                        DL
                      </div>
                      <div>
                        <div className="font-bold text-white">Danny Liu</div>
                        <div className="text-[10px] text-slate-500">dannyliu@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-300 font-medium">1,023</td>
                  <td className="py-3 text-right font-bold text-white font-mono">$37,431</td>
                </motion.tr>

                <motion.tr 
                  whileHover={{ backgroundColor: '#151C28' }}
                  className="transition-colors cursor-pointer" 
                  onClick={() => navigate('/claims')}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white font-bold text-[10px] flex items-center justify-center">
                        BD
                      </div>
                      <div>
                        <div className="font-bold text-white">Bella Deviani</div>
                        <div className="text-[10px] text-slate-500">belladeviani@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-300 font-medium">963</td>
                  <td className="py-3 text-right font-bold text-white font-mono">$30,423</td>
                </motion.tr>

                <motion.tr 
                  whileHover={{ backgroundColor: '#151C28' }}
                  className="transition-colors cursor-pointer" 
                  onClick={() => navigate('/claims')}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-[10px] flex items-center justify-center">
                        DS
                      </div>
                      <div>
                        <div className="font-bold text-white">Darrell Steward</div>
                        <div className="text-[10px] text-slate-500">darrellsteward@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-300 font-medium">843</td>
                  <td className="py-3 text-right font-bold text-white font-mono">$28,549</td>
                </motion.tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Premium Plan Glowing Card with Spring Buttons */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="lg:col-span-5 rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-br from-[#0c2e17] via-[#0b1b14] to-[#0d141e] shadow-xl shadow-emerald-950/40 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute right-0 top-0 w-48 h-48 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-[#ccff00]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Premium Plan</span>
              </div>
              <MoreVertical className="w-4 h-4 text-emerald-400 cursor-pointer" />
            </div>

            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-white font-sans">$30</span>
              <span className="text-xs text-emerald-300 font-medium">/ Per Month Per User</span>
            </div>

            <p className="text-xs text-emerald-100/80 mt-3 leading-relaxed">
              Improve your workplace, view and analyze your agent execution, policy violations and losses.
            </p>
          </div>

          <div className="flex items-center gap-2.5 mt-5">
            <Link to="/workspace" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(204,255,0,0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#ccff00] text-slate-950 font-extrabold text-xs text-center transition-colors shadow-md shadow-[#ccff00]/20"
              >
                Get Started
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.15, rotate: 20 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/workspace')}
              className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-[#ccff00] hover:bg-emerald-800/50 transition-colors"
              title="Launch Workspace"
            >
              <Star className="w-4 h-4 fill-[#ccff00]" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
