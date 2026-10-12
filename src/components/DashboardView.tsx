import React from 'react';
import { Project } from '../types';
import { 
  BookOpen, 
  Layers, 
  Wand2, 
  Sparkles, 
  Download, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Plus,
  Printer
} from 'lucide-react';

interface DashboardViewProps {
  project: Project;
  onOpenProject: () => void;
  onNewBatchPreset: (preset: 'maze50' | 'worksheet25' | 'sudoku50' | 'mixed50') => void;
  onOpenKdpModal: () => void;
  onOpenExportModal: () => void;
  onOpenAiAssistant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  onOpenProject,
  onNewBatchPreset,
  onOpenKdpModal,
  onOpenExportModal,
  onOpenAiAssistant,
}) => {
  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-4 md:p-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
            <Sparkles size={12} className="text-amber-400" />
            Studio Hybrid Workspace v2.0
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Pusat Produksi Activity Book & Creative Publishing
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
            Otomatisasi pembuatan labirin, word search, sudoku, dan worksheet edukasi siap cetak Amazon KDP & Print on Demand dalam hitungan menit.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onOpenProject}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <BookOpen size={16} />
              Buka Editor Kanvas ({project.pages.length} Hal)
            </button>
            <button
              onClick={onOpenKdpModal}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs md:text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} className="text-emerald-400" />
              Periksa Validasi KDP
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards (Module A) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Total Halaman</span>
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">📖</span>
          </div>
          <div className="text-2xl font-black text-white">{project.pages.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 size={12} /> Siap Jilid Amazon KDP
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Format Cetak</span>
            <span className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">📐</span>
          </div>
          <div className="text-2xl font-black text-white">{project.metadata.targetKdpFormat}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Margin Gutter {project.metadata.margins.insideMm}mm
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Estimasi Royalti / Buku</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">💵</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">$2.49</div>
          <div className="text-[11px] text-slate-400 mt-1">Harga jual $7.99 KDP</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Waktu Hemat Produksi</span>
            <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">⚡</span>
          </div>
          <div className="text-2xl font-black text-amber-400">~14 Jam</div>
          <div className="text-[11px] text-slate-400 mt-1">Dibanding desain manual</div>
        </div>
      </div>

      {/* Quick Start Presets (Workflow Otomatis) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wand2 size={16} className="text-indigo-400" />
            Preset Proyek Kilat (1-Click Batch Generation)
          </h2>
          <span className="text-xs text-slate-400">Pilih template untuk menghasilkan seluruh buku</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={() => onNewBatchPreset('maze50')}
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 p-4 rounded-xl cursor-pointer group transition hover:scale-[1.01] shadow"
          >
            <div className="text-2xl mb-2">🧩</div>
            <h3 className="font-bold text-xs md:text-sm text-slate-200 group-hover:text-indigo-300 transition">
              50 Labirin Antariksa (KDP Ready)
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              50 variasi labirin bergradasi (Mudah ➔ Sedang ➔ Sulit) dengan kunci jawaban lampiran.
            </p>
            <div className="mt-3 text-[10px] font-bold text-indigo-400 flex items-center gap-1">
              Generate Instan <ArrowRight size={12} />
            </div>
          </div>

          <div
            onClick={() => onNewBatchPreset('worksheet25')}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 p-4 rounded-xl cursor-pointer group transition hover:scale-[1.01] shadow"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-bold text-xs md:text-sm text-slate-200 group-hover:text-emerald-300 transition">
              25 Lembar Kerja Math & STEM
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Soal hitung berorientasi kurikulum sekolah dasar dengan garis isian jawaban rapi.
            </p>
            <div className="mt-3 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              Generate Instan <ArrowRight size={12} />
            </div>
          </div>

          <div
            onClick={() => onNewBatchPreset('sudoku50')}
            className="bg-slate-900/90 border border-slate-800 hover:border-violet-500/60 p-4 rounded-xl cursor-pointer group transition hover:scale-[1.01] shadow"
          >
            <div className="text-2xl mb-2">🔢</div>
            <h3 className="font-bold text-xs md:text-sm text-slate-200 group-hover:text-violet-300 transition">
              50 Pocket Sudoku (Format 6x9)
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Buku teka-teki saku klasik 9x9 dengan kotak tebal simetris & kunci jawaban multi-up.
            </p>
            <div className="mt-3 text-[10px] font-bold text-violet-400 flex items-center gap-1">
              Generate Instan <ArrowRight size={12} />
            </div>
          </div>

          <div
            onClick={() => onNewBatchPreset('mixed50')}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 p-4 rounded-xl cursor-pointer group transition hover:scale-[1.01] shadow"
          >
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-bold text-xs md:text-sm text-slate-200 group-hover:text-amber-300 transition">
              50 Mixed Activity Book
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Kombinasi variatif: Labirin, Word Search, Sudoku, dan Lembar Fakta Edukasi.
            </p>
            <div className="mt-3 text-[10px] font-bold text-amber-400 flex items-center gap-1">
              Generate Instan <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects & Export Central */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Overview Card */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={15} className="text-indigo-400" />
              Proyek Aktif Saat Ini
            </h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
              Auto-Save Aktif
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-200">{project.metadata.name}</h4>
              <p className="text-xs text-slate-400">
                {project.pages.length} Halaman • {project.metadata.targetKdpFormat} • Margin Gutter{' '}
                {project.metadata.margins.insideMm}mm
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.metadata.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={onOpenProject}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition shrink-0 cursor-pointer"
            >
              Lanjutkan Mengedit
            </button>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Aktivitas Terbaru
            </span>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400">12 menit lalu:</span>
                <span>Regenerasi pola Labirin Mars Level 1 dengan algoritma BFS selesai.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span className="text-slate-400">28 menit lalu:</span>
                <span>Margin Gutter diperbarui ke 20mm untuk memenuhi standar Amazon KDP 50 hal.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="text-slate-400">1 jam lalu:</span>
                <span>AI Prompt Assistant menyusun narasi instruksi untuk penjelajah cilik.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Publishing & POD Toolkit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Printer size={15} className="text-emerald-400" />
            Checklist Amazon KDP
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Trim Size & Bleed</strong>
                <span className="text-slate-400 text-[11px]">
                  {project.metadata.targetKdpFormat} dengan margin 3.2mm bleed compliant.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Tebal Punggung (Spine)</strong>
                <span className="text-slate-400 text-[11px]">
                  ~2.86mm pada {project.pages.length} halaman kertas putih standar KDP.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Kunci Jawaban Otomatis</strong>
                <span className="text-slate-400 text-[11px]">
                  Format lampiran solusi multi-up 4-in-1 siap diekspor di akhir buku.
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenExportModal}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-lg border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={14} />
            Buka Download Center
          </button>
        </div>
      </div>
    </div>
  );
};
