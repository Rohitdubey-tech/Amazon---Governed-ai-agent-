import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function StatCard({ title, value, subtitle, trend, gaugePercent }) {
  return (
    <motion.div
      whileHover={{ y: -3, borderColor: '#2D3950', transition: { duration: 0.2 } }}
      className="bg-[#121620] rounded-2xl p-5 border border-[#1E2433] transition-colors duration-200 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1.5 font-sans tracking-tight">{value}</h3>
          
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            {trend && (
              <span className="inline-flex items-center gap-0.5 text-[#ccff00] font-semibold text-[11px]">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{trend}</span>
              </span>
            )}
            {subtitle && (
              <span className="text-slate-500 text-[11px] font-medium">{subtitle}</span>
            )}
          </div>
        </div>

        {/* Circular Gauge if provided */}
        {gaugePercent !== undefined && (
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#1A2230]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#ccff00]"
                strokeDasharray={`${gaugePercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-200">{gaugePercent}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
