import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  ChevronDown,
  ArrowUpRight,
  Star,
  ShieldCheck,
  Download,
  RefreshCw,
  ExternalLink,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList
} from 'recharts';

export function DashboardPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const waveColor = isLight ? '#16a34a' : '#ccff00';

  const [summary, setSummary] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Today');
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // 'sales' | 'customers' | 'plan' | null
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenu(null);
      setTimeDropdownOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setTimeDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const sum = await api.dashboard.getSummary();
      const claims = await api.claims.list();
      setSummary(sum);
      setRecentClaims(claims.slice(0, 4));
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const exportCSV = (filename, headers, rows) => {
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  // Dynamic datasets reacting seamlessly to Today / This Week / This Quarter selection
  const timeRangeData = {
    'Today': {
      metrics: {
        netRevenue: 128450,
        netRevenueTrend: '+2.4% vs yesterday',
        arr: 1498200,
        arrTrend: '+0.2% vs yesterday',
        goalPercent: 18,
        goalSubtitle: 'Goal $150k / Day',
        newOrders: 342,
        newOrdersTrend: '+8% vs yesterday',
        newCustomers: '014',
        newCustomersLabel: 'Today',
        grossProfit: '$4.2k',
        grossProfitTrend: '▲ +18% Daily Profit',
        totalProfit: '$18,420.50'
      },
      totalSales: 11520,
      centerVisits: {
        value: '14k',
        label: 'Daily Visits'
      },
      donutData: [
        { name: 'Electronic', value: 8240, color: '#ccff00' },
        { name: 'Furniture', value: 2180, color: '#22c55e' },
        { name: 'Clothes', value: 680, color: '#38bdf8' },
        { name: 'Shoes', value: 420, color: '#e2e8f0' }
      ],
      waveData: [
        { time: '9h', val: 18 },
        { time: '10h', val: 24 },
        { time: '11h', val: 36 },
        { time: '12h', val: 42 },
        { time: '13h', val: 38 },
        { time: '14h', val: 56 },
        { time: '15h', val: 64 },
        { time: '16h', val: 72 }
      ],
      customerList: [
        { name: 'Danny Liu', email: 'dannyliu@gmail.com', deals: '14', value: '$1,420', initials: 'DL', color: 'from-pink-500 to-rose-400' },
        { name: 'Bella Deviani', email: 'belladeviani@gmail.com', deals: '9', value: '$890', initials: 'BD', color: 'from-amber-500 to-orange-400' },
        { name: 'Darrell Steward', email: 'darrellsteward@gmail.com', deals: '6', value: '$640', initials: 'DS', color: 'from-emerald-500 to-teal-400' }
      ]
    },
    'This Week': {
      metrics: {
        netRevenue: 842190,
        netRevenueTrend: '+5.8% vs last week',
        arr: 1504800,
        arrTrend: '+1.8% vs last week',
        goalPercent: 45,
        goalSubtitle: 'Goal $900k / Wk',
        newOrders: 2840,
        newOrdersTrend: '+12% vs last week',
        newCustomers: '084',
        newCustomersLabel: 'This Week',
        grossProfit: '$25.6k',
        grossProfitTrend: '▲ +47% Weekly Profit',
        totalProfit: '$136,755.77'
      },
      totalSales: 71020,
      centerVisits: {
        value: '102k',
        label: 'Weekly Visits'
      },
      donutData: [
        { name: 'Electronic', value: 55640, color: '#ccff00' },
        { name: 'Furniture', value: 11420, color: '#22c55e' },
        { name: 'Clothes', value: 1840, color: '#38bdf8' },
        { name: 'Shoes', value: 2120, color: '#e2e8f0' }
      ],
      waveData: [
        { time: 'Mon', val: 32 },
        { time: 'Tue', val: 45 },
        { time: 'Wed', val: 40 },
        { time: 'Thu', val: 68 },
        { time: 'Fri', val: 55 },
        { time: 'Sat', val: 85 },
        { time: 'Sun', val: 95 }
      ],
      customerList: [
        { name: 'Danny Liu', email: 'dannyliu@gmail.com', deals: '1,023', value: '$37,431', initials: 'DL', color: 'from-pink-500 to-rose-400' },
        { name: 'Bella Deviani', email: 'belladeviani@gmail.com', deals: '963', value: '$30,423', initials: 'BD', color: 'from-amber-500 to-orange-400' },
        { name: 'Darrell Steward', email: 'darrellsteward@gmail.com', deals: '843', value: '$28,549', initials: 'DS', color: 'from-emerald-500 to-teal-400' }
      ]
    },
    'This Quarter': {
      metrics: {
        netRevenue: 3131021,
        netRevenueTrend: '+14.2% vs last quarter',
        arr: 1511121,
        arrTrend: '+32% vs last quarter',
        goalPercent: 71,
        goalSubtitle: 'Goal $2.1M / Qtr',
        newOrders: 18221,
        newOrdersTrend: '+11% vs last quarter',
        newCustomers: '412',
        newCustomersLabel: 'This Quarter',
        grossProfit: '$188.4k',
        grossProfitTrend: '▲ +34% Quarterly Profit',
        totalProfit: '$742,910.15'
      },
      totalSales: 348650,
      centerVisits: {
        value: '680k',
        label: 'Quarterly Visits'
      },
      donutData: [
        { name: 'Electronic', value: 242100, color: '#ccff00' },
        { name: 'Furniture', value: 64800, color: '#22c55e' },
        { name: 'Clothes', value: 24500, color: '#38bdf8' },
        { name: 'Shoes', value: 17250, color: '#e2e8f0' }
      ],
      waveData: [
        { time: 'W1', val: 48 },
        { time: 'W2', val: 54 },
        { time: 'W3', val: 62 },
        { time: 'W4', val: 75 },
        { time: 'W5', val: 82 },
        { time: 'W6', val: 90 },
        { time: 'W7', val: 110 },
        { time: 'W8', val: 125 }
      ],
      customerList: [
        { name: 'Danny Liu', email: 'dannyliu@gmail.com', deals: '4,210', value: '$162,400', initials: 'DL', color: 'from-pink-500 to-rose-400' },
        { name: 'Bella Deviani', email: 'belladeviani@gmail.com', deals: '3,890', value: '$128,650', initials: 'BD', color: 'from-amber-500 to-orange-400' },
        { name: 'Darrell Steward', email: 'darrellsteward@gmail.com', deals: '3,410', value: '$114,800', initials: 'DS', color: 'from-emerald-500 to-teal-400' }
      ]
    }
  };

  const currentData = timeRangeData[timeRange] || timeRangeData['Today'];
  const { metrics, donutData, waveData, customerList, totalSales, centerVisits } = currentData;

  const exportSalesCSV = () => {
    const headers = ['Category', 'Sales Amount (USD)', 'Percentage of Total'];
    const rows = donutData.map(d => [
      d.name,
      `$${d.value.toLocaleString()}`,
      `${((d.value / totalSales) * 100).toFixed(1)}%`
    ]);
    exportCSV(`sales_overview_${timeRange.toLowerCase().replace(/\\s+/g, '_')}.csv`, headers, rows);
  };

  const exportCustomersCSV = () => {
    const headers = ['Name', 'Email', 'Deals Completed', 'Total Deal Value'];
    const rows = customerList.map(c => [c.name, c.email, c.deals, c.value]);
    exportCSV(`customer_deals_${timeRange.toLowerCase().replace(/\\s+/g, '_')}.csv`, headers, rows);
  };

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
          value={`$${metrics.netRevenue.toLocaleString()}`}
          trend={metrics.netRevenueTrend}
        />
        <StatCard
          title="ARR"
          value={`$${metrics.arr.toLocaleString()}`}
          trend={metrics.arrTrend}
        />
        <StatCard
          title="Quarterly Revenue Goal"
          value={`${metrics.goalPercent}%`}
          gaugePercent={metrics.goalPercent}
          subtitle={metrics.goalSubtitle}
        />
        <StatCard
          title="New Orders"
          value={metrics.newOrders.toLocaleString()}
          trend={metrics.newOrdersTrend}
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
            <div className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === 'sales' ? null : 'sales');
                }}
                aria-label="Sales Overview actions"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {activeMenu === 'sales' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-52 rounded-xl bg-[#151C28]/95 backdrop-blur-xl border border-white/10 shadow-2xl py-1.5 z-40 text-xs text-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        navigate('/claims');
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5 hover:text-[#ccff00] transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Claims Breakdown</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        exportSalesCSV();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5 hover:text-[#ccff00] transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Export Breakdown (CSV)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        handleRefresh();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5 hover:text-[#ccff00] transition-colors border-t border-white/5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
                      <span>Refresh Sales Metrics</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-2">
            {/* Donut Chart with dedicated, clash-free center readout */}
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={54}
                    outerRadius={hoveredSlice ? 74 : 70}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#121620"
                    strokeWidth={3}
                    onMouseEnter={(_, index) => setHoveredSlice(donutData[index])}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={hoveredSlice ? (hoveredSlice.name === entry.name ? 1 : 0.35) : 1}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Dedicated center readout - completely eliminates tooltip clash */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none p-2">
                <AnimatePresence mode="wait">
                  {hoveredSlice ? (
                    <motion.div
                      key={hoveredSlice.name}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider truncate max-w-[90px]">
                        {hoveredSlice.name}
                      </span>
                      <span className="text-xl font-black text-[#ccff00] font-mono leading-tight tracking-tight my-0.5">
                        ${hoveredSlice.value.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-400">
                        {((hoveredSlice.value / totalSales) * 100).toFixed(1)}%
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`default-${timeRange}`}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <span className="text-2xl font-black text-white leading-none tracking-tight">{centerVisits.value}</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-1">{centerVisits.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right side breakdown with interactive synchronization */}
            <div className="flex-1 w-full space-y-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => setHoveredSlice(null)}
                className="inline-flex items-center gap-2 p-2 rounded-xl bg-[#18202D] border border-[#253043] text-xs cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-neon-pulse" />
                <span className="text-slate-400 text-[11px]">Number of Sales:</span>
                <span className="font-bold text-white font-mono">${totalSales.toLocaleString()}</span>
              </motion.div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                {donutData.map((item) => {
                  const isHovered = hoveredSlice?.name === item.name;
                  return (
                    <div
                      key={item.name}
                      onMouseEnter={() => setHoveredSlice(item)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isHovered 
                          ? 'bg-[#18202D] border-[#ccff00]/40 shadow-sm' 
                          : 'bg-[#0E121B] border-[#1A2230] hover:border-[#2A3548]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className={`text-[11px] truncate ${isHovered ? 'text-white font-bold' : 'text-slate-400'}`}>
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {((item.value / totalSales) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={`font-mono text-xs ${isHovered ? 'font-black text-[#ccff00]' : 'font-bold text-white'}`}>
                        ${item.value.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
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
              <div className="text-xl font-extrabold text-white mt-1">{metrics.newCustomers}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{metrics.newCustomersLabel}</div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2, borderColor: '#2E3B52' }}
              className="bg-[#121620] rounded-2xl p-4 border border-[#1E2433] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Gross profit</span>
              </div>
              <div className="text-xl font-extrabold text-white mt-1">{metrics.grossProfit}</div>
              <div className="text-[10px] text-[#ccff00] mt-0.5 font-semibold">{metrics.grossProfitTrend}</div>
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
                <h4 className="text-base font-extrabold text-white font-mono mt-0.5">{metrics.totalProfit}</h4>
              </div>
              <span className="text-[10px] text-[#ccff00] font-semibold bg-[#ccff00]/10 border border-[#ccff00]/20 px-2 py-0.5 rounded-full">
                Live Wave ({timeRange})
              </span>
            </div>

            <div className="h-24 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waveData} margin={{ top: 18, right: 14, left: 14, bottom: 4 }}>
                  <defs>
                    <linearGradient id="glowWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={waveColor} stopOpacity={isLight ? 0.25 : 0.45} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0B0F17]/95 border border-[#ccff00]/30 rounded-lg px-2.5 py-1 shadow-xl text-[11px] font-mono backdrop-blur-md">
                            <span className="text-slate-400">Node {data.time}: </span>
                            <span className="text-[#ccff00] font-bold">${data.val}k profit</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke={waveColor}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#glowWave)"
                    dot={{
                      r: 3.5,
                      fill: waveColor,
                      stroke: isLight ? '#ffffff' : '#0B0F17',
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 5.5,
                      fill: '#ffffff',
                      stroke: waveColor,
                      strokeWidth: 2.5,
                    }}
                  >
                    <LabelList
                      dataKey="val"
                      position="top"
                      offset={8}
                      content={(props) => {
                        const { x, y, value } = props;
                        if (x == null || y == null) return null;
                        return (
                          <text
                            x={x}
                            y={y - 7}
                            fill={waveColor}
                            fontSize="10"
                            fontWeight="800"
                            textAnchor="middle"
                            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                            className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                          >
                            {value}
                          </text>
                        );
                      }}
                    />
                  </Area>
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
            <div className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === 'customers' ? null : 'customers');
                }}
                aria-label="Customer list actions"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {activeMenu === 'customers' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-52 rounded-xl bg-[#151C28]/95 backdrop-blur-xl border border-white/10 shadow-2xl py-1.5 z-40 text-xs text-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        navigate('/claims');
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5 hover:text-[#ccff00] transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Customer Ledger</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        exportCustomersCSV();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5 hover:text-[#ccff00] transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Export Deals (CSV)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        handleRefresh();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5 hover:text-[#ccff00] transition-colors border-t border-white/5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
                      <span>Refresh Customer List</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                {customerList.map((cust) => (
                  <motion.tr 
                    key={cust.name}
                    whileHover={{ backgroundColor: '#151C28' }}
                    className="transition-colors cursor-pointer" 
                    onClick={() => navigate('/claims')}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${cust.color} text-white font-bold text-[10px] flex items-center justify-center`}>
                          {cust.initials}
                        </div>
                        <div>
                          <div className="font-bold text-white">{cust.name}</div>
                          <div className="text-[10px] text-slate-500">{cust.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center text-slate-300 font-medium">{cust.deals}</td>
                    <td className="py-3 text-right font-bold text-white font-mono">{cust.value}</td>
                  </motion.tr>
                ))}
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
              <div className="relative">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === 'plan' ? null : 'plan');
                  }}
                  aria-label="Plan actions"
                  className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {activeMenu === 'plan' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.12 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-1 w-52 rounded-xl bg-[#0B1E13]/95 backdrop-blur-xl border border-emerald-500/30 shadow-2xl py-1.5 z-40 text-xs text-slate-200"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenu(null);
                          navigate('/policies');
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-emerald-500/20 hover:text-[#ccff00] transition-colors cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Configure Policy Scope</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenu(null);
                          navigate('/workspace');
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-emerald-500/20 hover:text-[#ccff00] transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Launch Agent Workspace</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenu(null);
                          navigate('/evaluations');
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-emerald-500/20 hover:text-[#ccff00] transition-colors border-t border-emerald-500/20 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Security Benchmarks</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
