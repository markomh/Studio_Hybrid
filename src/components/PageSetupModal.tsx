import React, { useState } from 'react';
import { ProjectMetadata, PageSize, PaginationConfig } from '../types';
import { PAGE_SPECS } from '../utils/kdpCalculator';
import { 
  X, 
  Check, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  Hash, 
  BookOpen, 
  Maximize2,
  Sparkles,
  Info
} from 'lucide-react';

interface PageSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ProjectMetadata;
  totalPages: number;
  onUpdateMetadata: (update: Partial<ProjectMetadata>) => void;
}

export const PageSetupModal: React.FC<PageSetupModalProps> = ({
  isOpen,
  onClose,
  metadata,
  totalPages,
  onUpdateMetadata,
}) => {
  const [activeTab, setActiveTab] = useState<'paper' | 'bleed' | 'margins' | 'pagination'>('paper');

  if (!isOpen) return null;

  const currentSpec = PAGE_SPECS[metadata.targetKdpFormat] || PAGE_SPECS['Letter'];

  // KDP Recommended Gutter calculation based on page count
  const getRecommendedGutter = (pages: number): number => {
    if (pages <= 150) return 9.5; // 0.375"
    if (pages <= 300) return 12.7; // 0.500"
    if (pages <= 500) return 15.9; // 0.625"
    return 19.1; // 0.750"
  };

  const recommendedGutter = getRecommendedGutter(totalPages);
  const calculatedSpineMm = Number((totalPages * 0.0572).toFixed(2));
  const fullCoverWidthMm = Number(
    ((currentSpec.widthMm * 2) + calculatedSpineMm + (metadata.bleed ? 6.4 : 0)).toFixed(1)
  );

  const pagination: PaginationConfig = metadata.pagination || {
    enabled: true,
    startPage: 1,
    position: 'bottom-center',
    format: 'dash',
  };

  // Auto-Fix Margins to KDP Standards
  const handleApplyKdpStandardMargins = () => {
    onUpdateMetadata({
      bleed: true,
      margins: {
        topMm: 15,
        bottomMm: 15,
        insideMm: recommendedGutter,
        outsideMm: 15,
      },
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-base">
              📐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100">
                  Page Setup — Pengaturan Dokumen
                </h2>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono font-medium hidden sm:inline">
                  Single Source of Truth
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pusat kendali ukuran kertas, margin, gutter, bleed, dan penomoran buku Amazon KDP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Tutup (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-2 shrink-0 overflow-x-auto">
          {[
            { id: 'paper', label: '1. Format & Ukuran Kertas', icon: BookOpen },
            { id: 'bleed', label: '2. Bleed (Cetak Tepi)', icon: Layers },
            { id: 'margins', label: '3. Margin & Gutter KDP', icon: ShieldCheck },
            { id: 'pagination', label: '4. Penomoran Halaman', icon: Hash },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 px-3 text-xs font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* ================= TAB 1: FORMAT & UKURAN KERTAS ================= */}
          {activeTab === 'paper' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Pilih Format Standar Amazon KDP & POD:
                </label>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  Semua halaman dalam dokumen ini otomatis mengikuti standar proporsi dimensi berikut tanpa distorsi:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['Letter', '6x9', '8.5x8.5', 'A4'] as PageSize[]).map((fmt) => {
                    const spec = PAGE_SPECS[fmt];
                    const isSelected = metadata.targetKdpFormat === fmt;
                    return (
                      <div
                        key={fmt}
                        onClick={() => onUpdateMetadata({ targetKdpFormat: fmt })}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm ring-1 ring-indigo-500/30'
                            : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{spec.name}</span>
                            {fmt === 'Letter' && (
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-medium">
                                Populer
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {spec.widthIn}" x {spec.heightIn}" • {spec.widthMm} x {spec.heightMm} mm
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {fmt === 'Letter' && 'Standar buku aktivitas & mewarnai'}
                            {fmt === '6x9' && 'Buku cerita anak, novel, & saku'}
                            {fmt === '8.5x8.5' && 'Format persegi ramah anak (Square)'}
                            {fmt === 'A4' && 'Standar lembar kerja internasional'}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SPEC SUMMARY & SPINE CALCULATION */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200 border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Info size={13} className="text-indigo-400" /> Spesifikasi Teknis Cetak Amazon KDP (300 DPI)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Siap Terbit
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 font-sans">Resolusi 300 DPI</div>
                    <div className="text-slate-200 font-bold">
                      {Math.round(currentSpec.widthIn * 300)} × {Math.round(currentSpec.heightIn * 300)} px
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 font-sans">Rasio Aspek</div>
                    <div className="text-slate-200 font-bold">{currentSpec.aspectRatio.toFixed(2)} : 1</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 font-sans">Total Halaman</div>
                    <div className="text-indigo-300 font-bold">{totalPages} Halaman</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 font-sans">Estimasi Punggung</div>
                    <div className="text-amber-300 font-bold">{calculatedSpineMm} mm</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  💡 Lebar Sampul Terbuka (Full Cover Width): <strong className="text-slate-200">{fullCoverWidthMm} mm</strong>{' '}
                  (Termasuk 2 sisi + Punggung {calculatedSpineMm} mm {metadata.bleed ? '+ Bleed 6.4 mm' : ''}).
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: BLEED SETTINGS ================= */}
          {activeTab === 'bleed' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Layers size={14} className="text-indigo-400" /> Mode Bleed (Cetak Tepi Penuh)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Standar pemotongan Amazon KDP: 0.125 inci (3.2 mm) pada sisi atas, bawah, dan luar.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metadata.bleed}
                      onChange={(e) => onUpdateMetadata({ bleed: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  metadata.bleed
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}>
                  {metadata.bleed ? (
                    <div className="space-y-1">
                      <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                        <Check size={13} /> Status: Bleed Aktif (+3.2 mm Safe Bleed Margin)
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Sangat disarankan untuk buku mewarnai, labirin dengan latar belakang, dan ilustrasi tepi penuh agar tidak menghasilkan garis putih tak sengaja saat dipotong oleh mesin Amazon KDP.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-300">
                        Status: Tanpa Bleed (No Bleed)
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Semua elemen buku akan diisolasi di dalam batas margin aman. Cocok untuk novel teks murni.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Paper Interior Stock */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Pilihan Kertas Interior KDP:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => onUpdateMetadata({ paperColor: 'white' })}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center justify-between ${
                      metadata.paperColor === 'white'
                        ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-200">Kertas Putih (White Paper)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Standar 55# - 60# untuk buku aktivitas</div>
                    </div>
                    {metadata.paperColor === 'white' && <Check size={13} className="text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => onUpdateMetadata({ paperColor: 'cream' })}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center justify-between ${
                      metadata.paperColor === 'cream'
                        ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-200">Kertas Krem (Cream Paper)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Nuansa novel fiksi klasik</div>
                    </div>
                    {metadata.paperColor === 'cream' && <Check size={13} className="text-indigo-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: MARGINS & GUTTER ================= */}
          {activeTab === 'margins' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">
                    Batas Aman Margin & Gutter Dalam
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Gutter adalah margin ekstra pada sisi punggung jilid buku agar konten tidak tertelan lipatan.
                  </p>
                </div>
                <button
                  onClick={handleApplyKdpStandardMargins}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  title="Hitung dan terapkan batas margin aman sesuai jumlah halaman buku Anda"
                >
                  <Sparkles size={12} />
                  <span>⚡ Terapkan Standar KDP</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Inside Gutter */}
                <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-amber-400">Inside Gutter (mm)</label>
                    <span className="text-[9px] text-slate-400 font-mono">Punggung</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="6.4"
                    max="35"
                    value={metadata.margins.insideMm}
                    onChange={(e) =>
                      onUpdateMetadata({
                        margins: { ...metadata.margins, insideMm: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[9px] text-slate-400 block pt-0.5">
                    Rekomendasi ({totalPages} hal): ≥ {recommendedGutter} mm
                  </span>
                </div>

                {/* Outside Margin */}
                <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-300">Outside Margin (mm)</label>
                    <span className="text-[9px] text-slate-400 font-mono">Luar</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="6.4"
                    max="30"
                    value={metadata.margins.outsideMm}
                    onChange={(e) =>
                      onUpdateMetadata({
                        margins: { ...metadata.margins, outsideMm: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[9px] text-slate-400 block pt-0.5">Min KDP: 6.4 mm</span>
                </div>

                {/* Top Margin */}
                <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-300">Top Margin (mm)</label>
                    <span className="text-[9px] text-slate-400 font-mono">Atas</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="6.4"
                    max="30"
                    value={metadata.margins.topMm}
                    onChange={(e) =>
                      onUpdateMetadata({
                        margins: { ...metadata.margins, topMm: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[9px] text-slate-400 block pt-0.5">Min KDP: 6.4 mm</span>
                </div>

                {/* Bottom Margin */}
                <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-300">Bottom Margin (mm)</label>
                    <span className="text-[9px] text-slate-400 font-mono">Bawah</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="6.4"
                    max="30"
                    value={metadata.margins.bottomMm}
                    onChange={(e) =>
                      onUpdateMetadata({
                        margins: { ...metadata.margins, bottomMm: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[9px] text-slate-400 block pt-0.5">Min KDP: 6.4 mm</span>
                </div>
              </div>

              {/* Status Validation Box */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    metadata.margins.insideMm >= recommendedGutter ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <span className="text-slate-300">
                    {metadata.margins.insideMm >= recommendedGutter
                      ? `Inside Gutter (${metadata.margins.insideMm} mm) memenuhi aturan Amazon KDP untuk ${totalPages} halaman.`
                      : `Inside Gutter (${metadata.margins.insideMm} mm) disarankan minimal ${recommendedGutter} mm untuk ${totalPages} halaman.`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: PAGINATION (BOOK DOMAIN MIGRATED) ================= */}
          {activeTab === 'pagination' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
                <Info size={16} className="text-indigo-400 shrink-0" />
                <span>
                  <strong>Integrasi Book Builder:</strong> Aturan penomoran halaman (Pagination) kini terhubung langsung dengan Book Builder untuk mendukung penomoran hierarkis Front Matter (romawi) dan Isi Buku.
                </span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Hash size={14} className="text-indigo-400" /> Aktifkan Nomor Halaman Otomatis
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Nomor halaman dicetak otomatis di setiap lembar isi buku tanpa perlu input manual.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pagination.enabled}
                      onChange={(e) =>
                        onUpdateMetadata({
                          pagination: { ...pagination, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {pagination.enabled && (
                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    {/* Start Page */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-300">
                        Mulai Penomoran dari Angka:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={pagination.startPage}
                        onChange={(e) =>
                          onUpdateMetadata({
                            pagination: {
                              ...pagination,
                              startPage: Math.max(1, Number(e.target.value)),
                            },
                          })
                        }
                        className="w-32 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Position */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-300">
                        Posisi Nomor Halaman:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'bottom-center', label: 'Bawah Tengah' },
                          { id: 'bottom-outer', label: 'Bawah Luar (Spread Kiri/Kanan)' },
                          { id: 'top-center', label: 'Atas Tengah' },
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() =>
                              onUpdateMetadata({
                                pagination: { ...pagination, position: pos.id as any },
                              })
                            }
                            className={`p-2 rounded-lg border text-xs text-left transition cursor-pointer ${
                              pagination.position === pos.id
                                ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium'
                                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Format */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-300">
                        Gaya Format Nomor:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'dash', label: '- 1 - (Garis Penghubung)' },
                          { id: 'number', label: '1 (Angka Murni)' },
                          { id: 'text', label: 'Hal 1 (Awalan Kata)' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            onClick={() =>
                              onUpdateMetadata({
                                pagination: { ...pagination, format: fmt.id as any },
                              })
                            }
                            className={`p-2 rounded-lg border text-xs text-left transition cursor-pointer ${
                              pagination.format === fmt.id
                                ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium'
                                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Perubahan otomatis tersimpan sebagai sumber data tunggal (Single Source of Truth)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
