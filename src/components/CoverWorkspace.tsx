import React, { useState } from 'react';
import { ProjectMetadata, CoverProject } from '../types';
import { PAGE_SPECS } from '../utils/kdpCalculator';
import { exportCoverToPdf } from '../utils/coverPdfExport';
import { 
  Download, 
  Palette, 
  Type, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  BookOpen, 
  SlidersHorizontal 
} from 'lucide-react';

interface CoverWorkspaceProps {
  metadata: ProjectMetadata;
  totalPages: number;
  cover: CoverProject;
  onUpdateCover: (update: Partial<CoverProject>) => void;
  onSwitchToInterior: () => void;
}

export const CoverWorkspace: React.FC<CoverWorkspaceProps> = ({
  metadata,
  totalPages,
  cover,
  onUpdateCover,
  onSwitchToInterior,
}) => {
  const spec = PAGE_SPECS[metadata.targetKdpFormat] || PAGE_SPECS['A4'];
  const trimW = spec.widthMm;
  const trimH = spec.heightMm;

  // Realtime KDP Spine Math
  const paperMultIn = metadata.paperColor === 'cream' ? 0.0025 : 0.002252;
  const spineThicknessIn = Math.max(0.06, totalPages * paperMultIn);
  const spineWidthMm = spineThicknessIn * 25.4;
  const bleedMm = 3.2;

  const totalWidthMm = bleedMm + trimW + spineWidthMm + trimW + bleedMm;
  const totalHeightMm = bleedMm + trimH + bleedMm;

  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canHaveSpineText = totalPages >= 79;

  const handleExportCoverPdf = async () => {
    try {
      setIsExporting(true);
      await exportCoverToPdf(metadata, totalPages, cover);
      setSuccessMsg('Cover PDF KDP Full-Wrap berhasil diekspor!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const presetThemes = [
    { name: 'Midnight Navy', bg: '#0f172a', text: '#ffffff', accent: '#6366f1' },
    { name: 'Forest Adventure', bg: '#064e3b', text: '#ffffff', accent: '#10b981' },
    { name: 'Sunset Terracotta', bg: '#7c2d12', text: '#ffffff', accent: '#f97316' },
    { name: 'Royal Purple', bg: '#3b0764', text: '#ffffff', accent: '#a855f7' },
    { name: 'Minimalist Charcoal', bg: '#18181b', text: '#ffffff', accent: '#e4e4e7' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative select-none">
      {/* 1. TOP COVER STATUS & ACTION BAR */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>🎨</span> Full-Wrap Cover Designer (KDP)
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-500/30">
              Total {totalWidthMm.toFixed(1)} × {totalHeightMm.toFixed(1)} mm
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Spine: <strong className="text-amber-400">{spineWidthMm.toFixed(2)} mm</strong> ({totalPages} Halaman)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {successMsg && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Check size={14} /> {successMsg}
            </span>
          )}

          <button
            onClick={onSwitchToInterior}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen size={14} />
            <span>Kembali ke Interior</span>
          </button>

          <button
            onClick={handleExportCoverPdf}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExporting ? 'Memproses...' : 'Ekspor Cover KDP PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. BODY WORKSPACE: CANVAS (LEFT/CENTER) + CONTROLS (RIGHT) */}
      <div className="flex-1 flex overflow-hidden">
        {/* CENTER VIEWPORT: THE 3-PANEL FULL-WRAP SPREAD */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
          <div
            className="shadow-2xl relative rounded-xs transition-all duration-150 flex border border-slate-700/80 overflow-hidden"
            style={{
              width: `${Math.min(960, totalWidthMm * 2.2)}px`,
              aspectRatio: `${totalWidthMm} / ${totalHeightMm}`,
              backgroundColor: cover.backgroundColor,
            }}
          >
            {/* PANEL 1: BACK COVER (KIRI) */}
            <div
              className="h-full relative flex flex-col justify-between p-6 border-r border-dashed border-white/20"
              style={{ flex: `${trimW + bleedMm}` }}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1">
                  Back Cover (Sampul Belakang)
                </span>
                <h4 className="text-base font-bold text-white mb-2 leading-tight">
                  Teka-Teki & Aktivitas Cerdas
                </h4>
                <p className="text-[11px] text-slate-200/90 leading-relaxed max-w-[280px]">
                  Buku interaktif yang dirancang untuk mengasah kreativitas dan konsentrasi. Diperkaya dengan kunci jawaban lengkap.
                </p>
              </div>

              {/* Barcode Safe Zone */}
              <div className="self-end bg-white/95 rounded p-2 text-center shadow-md border border-slate-400/40 w-32 h-20 flex flex-col justify-center items-center">
                <span className="text-[8px] font-mono text-slate-700 font-bold">KDP BARCODE</span>
                <span className="text-[7px] text-slate-500 mt-1">Area Bebas Teks</span>
              </div>
            </div>

            {/* PANEL 2: SPINE (TENGAH / PUNGGUNG BUKU) */}
            <div
              className="h-full relative flex flex-col items-center justify-center bg-black/15 border-r border-dashed border-white/20 px-1"
              style={{
                flex: `${Math.max(spineWidthMm, 6)}`,
                minWidth: '24px',
              }}
            >
              {canHaveSpineText ? (
                <div
                  className="text-white text-[11px] font-bold font-mono tracking-wider whitespace-nowrap transform -rotate-90 select-none"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  {cover.spineText || cover.title || metadata.name}
                </div>
              ) : (
                <div className="text-[8px] text-amber-300/80 font-mono text-center rotate-90 leading-tight">
                  &lt;79 hlm
                </div>
              )}
            </div>

            {/* PANEL 3: FRONT COVER (KANAN) */}
            <div
              className="h-full relative flex flex-col justify-between p-6"
              style={{ flex: `${trimW + bleedMm}` }}
            >
              <div className="text-center pt-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1">
                  Front Cover (Sampul Depan)
                </span>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
                  {cover.title || metadata.name || 'ACTIVITY BOOK'}
                </h1>
                {cover.subtitle && (
                  <p className="text-xs text-indigo-200 mt-1.5 font-medium">
                    {cover.subtitle}
                  </p>
                )}
              </div>

              {/* Cover Graphic Centerpiece */}
              <div className="flex flex-col items-center justify-center my-4">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-4xl shadow-inner border border-white/20">
                  🚀
                </div>
                <span className="text-[10px] font-bold text-white/90 mt-3 bg-black/30 px-3 py-1 rounded-full border border-white/10">
                  {totalPages} Halaman Siap Cetak
                </span>
              </div>

              {/* Author */}
              <div className="text-center pb-2">
                <span className="text-xs font-medium text-slate-300">
                  {cover.author ? `Karya: ${cover.author}` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: COVER PROPERTIES & THEMES INSPECTOR */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-y-auto p-4 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Pengaturan Sampul KDP
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sesuaikan teks, warna tema, dan punggung buku secara instan.
            </p>
          </div>

          {/* Spine Compliance Notice */}
          <div className={`p-3 rounded-xl border text-xs ${
            canHaveSpineText
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              {canHaveSpineText ? <Check size={14} /> : <AlertTriangle size={14} />}
              <span>{canHaveSpineText ? 'KDP Spine Teks Memenuhi Syarat' : 'KDP Spine Notice (<79 Hlm)'}</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {canHaveSpineText
                ? `Ketebalan ${spineWidthMm.toFixed(2)} mm memungkinkan pencetakan teks punggung buku.`
                : 'Amazon KDP mewajibkan minimal 79 halaman untuk mencetak teks vertikal pada spine.'}
            </p>
          </div>

          {/* Theme Color Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Preset Tema Sampul</label>
            <div className="grid grid-cols-2 gap-2">
              {presetThemes.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => onUpdateCover({ backgroundColor: preset.bg })}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer flex items-center gap-2 ${
                    cover.backgroundColor === preset.bg
                      ? 'border-indigo-500 bg-indigo-950/40'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: preset.bg }}
                  />
                  <span className="text-[11px] text-slate-300 truncate font-medium">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Warna Kustom</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cover.backgroundColor}
                onChange={(e) => onUpdateCover({ backgroundColor: e.target.value })}
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer p-0.5"
              />
              <span className="font-mono text-[11px] text-slate-400">{cover.backgroundColor}</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-3">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Judul Utama</label>
              <input
                type="text"
                value={cover.title}
                onChange={(e) => onUpdateCover({ title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Subjudul</label>
              <input
                type="text"
                value={cover.subtitle || ''}
                onChange={(e) => onUpdateCover({ subtitle: e.target.value })}
                placeholder="Misal: 100+ Labirin & Puzzle Menantang"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Nama Penulis / Penerbit</label>
              <input
                type="text"
                value={cover.author || ''}
                onChange={(e) => onUpdateCover({ author: e.target.value })}
                placeholder="Nama Anda atau Brand Studio"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Spine Text (if available) */}
            {canHaveSpineText && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Teks Spine</label>
                <input
                  type="text"
                  value={cover.spineText || ''}
                  onChange={(e) => onUpdateCover({ spineText: e.target.value })}
                  placeholder={cover.title || metadata.name}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
