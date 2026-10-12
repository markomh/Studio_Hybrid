import React, { useState } from 'react';
import { Project, PageSize } from '../types';
import { validateKdpCompliance, PAGE_SPECS } from '../utils/kdpCalculator';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator, 
  DollarSign, 
  BookMarked,
  Layers,
  ArrowRight
} from 'lucide-react';

interface KdpToolkitModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onAutoFixMargins: () => void;
  onUpdateMetadata: (update: Partial<any>) => void;
}

export const KdpToolkitModal: React.FC<KdpToolkitModalProps> = ({
  project,
  isOpen,
  onClose,
  onAutoFixMargins,
  onUpdateMetadata,
}) => {
  const [listPrice, setListPrice] = useState<number>(7.99);

  if (!isOpen) return null;

  const validation = validateKdpCompliance(project.metadata, project.pages.length, listPrice);
  const spec = PAGE_SPECS[project.metadata.targetKdpFormat];

  // Cover dimensions in inches
  const bleedIn = 0.125;
  const coverWidthIn = (bleedIn * 2) + (spec.widthIn * 2) + validation.calculatedSpineThicknessIn;
  const coverHeightIn = (bleedIn * 2) + spec.heightIn;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Amazon KDP Publishing Toolkit</h2>
              <p className="text-xs text-slate-400">
                Validasi format cetak, margin gutter, ketebalan punggung buku & kalkulator royalti
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Status Alert Banner */}
          {validation.isValid ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 text-xs block font-bold">
                  Format Siap Terbit (Amazon KDP Print Ready)
                </strong>
                <p className="text-emerald-400/80 text-[11px] mt-0.5">
                  Interior buku Anda memenuhi spesifikasi margin potong, gutter binding, dan jumlah halaman minimum KDP.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 text-xs block font-bold">
                    Perhatian: Penyesuaian Margin Dibutuhkan
                  </strong>
                  <ul className="text-amber-400/90 text-[11px] mt-1 list-disc list-inside space-y-0.5">
                    {validation.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={onAutoFixMargins}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shrink-0 transition"
              >
                Auto-Fix Margin
              </button>
            </div>
          )}

          {/* Spine & Cover Geometry Calculator */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <BookMarked size={14} className="text-indigo-400" />
                Kalkulator Ketebalan Punggung (Spine Thickness)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {project.pages.length} Halaman
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Ketebalan Spine</span>
                <span className="text-base font-bold text-indigo-300 mt-1 block">
                  {validation.calculatedSpineThicknessMm.toFixed(2)} mm{' '}
                  <span className="text-xs text-slate-400">
                    ({validation.calculatedSpineThicknessIn.toFixed(3)} in)
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Standar kertas putih 55lb KDP
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Ukuran File Sampul Penuh</span>
                <span className="text-base font-bold text-purple-300 mt-1 block">
                  {coverWidthIn.toFixed(3)} x {coverHeightIn.toFixed(3)} in
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Termasuk Bleed 0.125" keliling
                </span>
              </div>
            </div>

            {/* Visual Cover Layout Diagram */}
            <div className="border border-slate-800 bg-slate-900/60 p-3 rounded-lg flex items-center justify-center gap-1 text-[10px] font-mono text-slate-400 text-center">
              <div className="flex-1 bg-slate-800/80 p-2 rounded border border-slate-700">
                Back Cover ({spec.widthIn}")
              </div>
              <div className="w-12 bg-indigo-900/40 p-2 rounded border border-indigo-500/40 text-indigo-300 font-bold">
                Spine ({validation.calculatedSpineThicknessIn.toFixed(2)}")
              </div>
              <div className="flex-1 bg-slate-800/80 p-2 rounded border border-slate-700">
                Front Cover ({spec.widthIn}")
              </div>
            </div>
          </div>

          {/* Royalty & Print Cost Calculator (Amazon KDP 60% rule) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Calculator size={14} className="text-emerald-400" />
                Kalkulator Biaya Cetak & Estimasi Royalti KDP
              </span>
              <span className="text-emerald-400 font-mono text-xs font-bold">
                Buku Hitam Putih (Black & White)
              </span>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Harga Jual Buku di Amazon (USD):</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">${listPrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="4.99"
                  max="19.99"
                  step="0.50"
                  value={listPrice}
                  onChange={(e) => setListPrice(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Biaya Cetak KDP</span>
                <span className="font-bold text-slate-200 mt-1 block font-mono">
                  ${validation.estimatedPrintCostUsd.toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Bagi Hasil Amazon (40%)</span>
                <span className="font-bold text-slate-200 mt-1 block font-mono">
                  ${(listPrice * 0.40).toFixed(2)}
                </span>
              </div>
              <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/40">
                <span className="text-emerald-300 text-[10px] block font-bold">Royalti Bersih Anda</span>
                <span className="font-extrabold text-emerald-400 text-sm mt-0.5 block font-mono">
                  ${validation.estimatedRoyaltyUsd.toFixed(2)} / copy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 transition"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onAutoFixMargins();
              onClose();
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            Terapkan Format KDP & Kembali ke Kanvas
          </button>
        </div>
      </div>
    </div>
  );
};
