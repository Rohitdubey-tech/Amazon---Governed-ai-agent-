import React from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

export function ReceiptDropzone({ selectedReceipt, onSelectReceipt }) {
  const sampleReceipts = [
    {
      id: "sample_indigo",
      fileName: "indigo_flight_del_blr.pdf",
      merchant: "IndiGo Airlines",
      amount: 4500,
      currency: "INR",
      category: "Travel",
      notes: "Valid claim under ₹5,000 threshold (Expect: ALLOW)"
    },
    {
      id: "sample_apple",
      fileName: "apple_dock_hardware.pdf",
      merchant: "Apple Authorized Reseller",
      amount: 14200,
      currency: "INR",
      category: "Hardware",
      notes: "Exceeds ₹5,000 threshold (Expect: REQUIRE_APPROVAL)"
    },
    {
      id: "sample_psn",
      fileName: "psn_game_voucher.jpg",
      merchant: "PlayStation Network Store",
      amount: 3999,
      currency: "INR",
      category: "Personal / Gaming",
      notes: "Prohibited category POL-CAT-02 (Expect: DENY)"
    },
    {
      id: "sample_duplicate",
      fileName: "indigo_flight_del_blr.pdf",
      merchant: "IndiGo Airlines",
      amount: 4500,
      currency: "INR",
      category: "Travel",
      notes: "Duplicate receipt hash match with clm_8941 (Expect: DENY)"
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSelectReceipt({
        fileName: file.name,
        merchant: "Synthetic Merchant Extracted",
        amount: 4500,
        currency: "INR",
        category: "General Expense",
        file
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Receipt Attachment
        </label>
        <span className="text-[10px] text-slate-500 font-mono">Analyzed by Receipt Agent</span>
      </div>

      {/* Selected file preview or dropzone */}
      <div className="border border-dashed border-[#232C3E] rounded-2xl p-4 bg-[#0E121B] hover:border-[#344057] transition-colors">
        {selectedReceipt ? (
          <div className="flex items-center justify-between bg-[#141A26] p-3 rounded-xl border border-[#232D3F]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ccff00]/15 text-[#ccff00] rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{selectedReceipt.fileName}</p>
                <p className="text-[11px] text-slate-400">
                  {selectedReceipt.merchant} • ₹{selectedReceipt.amount?.toLocaleString('en-IN')} • {selectedReceipt.category}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectReceipt(null)}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2 py-1"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-200">Attach receipt file or select a preset demo below</p>
            <p className="text-[10px] text-slate-500 mt-0.5">PDF, PNG, JPG up to 10MB</p>
            <label className="mt-2.5 inline-block cursor-pointer px-3 py-1 bg-[#151C28] border border-[#253043] rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#1A2333] transition-colors">
              Browse Local File
              <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} />
            </label>
          </div>
        )}
      </div>

      {/* Quick Demo Receipt Presets */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Preset Scenarios:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleReceipts.map((preset) => {
            const isSelected = selectedReceipt?.fileName === preset.fileName && selectedReceipt?.amount === preset.amount && selectedReceipt?.category === preset.category;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectReceipt(preset)}
                className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'border-[#ccff00] bg-[#ccff00]/10 text-white'
                    : 'border-[#1E2536] bg-[#121620] hover:border-[#2D374D] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="truncate pr-1">{preset.merchant}</span>
                  <span className="text-[#ccff00] font-mono shrink-0">₹{preset.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">{preset.notes}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
