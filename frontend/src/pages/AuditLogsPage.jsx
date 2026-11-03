import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Search, Code } from 'lucide-react';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await api.audit.list();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.correlation_id.toLowerCase().includes(search.toLowerCase());
    const matchesDecision = decisionFilter === 'ALL' || log.governance_decision === decisionFilter;
    return matchesSearch && matchesDecision;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A2230] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Security & Governance Audit Trail</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#18202D] text-slate-300 border border-[#232D40]">
              {logs.length} Audited Events
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end provenance: Every agent proposal, policy evaluation, cryptographic action hash, and decision is recorded.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-[#121620] p-3 rounded-2xl border border-[#1E2536] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search actor, action, resource, or correlation ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#232D3F] bg-[#0A0E16] text-white focus:outline-none focus:border-[#ccff00]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto text-xs">
          <span className="text-slate-500 text-[10px] font-bold uppercase pr-1">Verdict:</span>
          {['ALL', 'ALLOW', 'REQUIRE_APPROVAL', 'DENY'].map((dec) => (
            <button
              key={dec}
              onClick={() => setDecisionFilter(dec)}
              className={`px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap ${
                decisionFilter === dec
                  ? 'bg-[#ccff00] text-slate-950 shadow-xs'
                  : 'bg-[#161D2B] text-slate-400 hover:text-white hover:bg-[#1F2738]'
              }`}
            >
              {dec}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#121620] rounded-2xl border border-[#1E2536] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0E121B] border-b border-[#1A2230] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Reason Codes</th>
                <th className="py-3 px-4 text-right">Raw JSON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171D29]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-[#151C28] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-[#ccff00]">{log.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-white">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-300">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {log.resource}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={log.governance_decision}>{log.governance_decision}</Badge>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {log.reason_codes?.map((rc, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.2 bg-[#0B0F17] rounded text-[10px] font-mono text-slate-300 border border-[#1C2534]"
                          >
                            {rc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#ccff00] hover:bg-[#1A2230] transition-colors"
                        title="View Raw Audit Payload"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500 text-xs">
                    No audit records match current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit JSON Inspector Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={`Audit Event Inspection: ${selectedLog?.id}`}
        maxWidth="max-w-2xl"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="p-3 bg-[#0B0F17] rounded-xl border border-[#1A2230] text-xs space-y-1">
              <p className="font-bold text-white">{selectedLog.details}</p>
              <p className="text-[11px] text-slate-400 font-mono">
                Correlation ID: <strong className="text-[#ccff00]">{selectedLog.correlation_id}</strong>
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Immutable Audit JSON Document:
              </p>
              <div className="p-4 bg-[#080B10] text-[#ccff00] rounded-xl font-mono text-xs overflow-x-auto max-h-96 border border-[#192232]">
                <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl bg-[#ccff00] text-slate-950 text-xs font-extrabold hover:bg-[#bbf000]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
