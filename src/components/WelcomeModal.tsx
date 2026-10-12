import React from 'react';
import { Sparkles, Layers, BookOpen, Plus, FileText, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlank: () => void;
  onSelectTemplate: () => void;
  onSelectBookBuilder: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onSelectBlank,
  onSelectTemplate,
  onSelectBookBuilder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 text-center relative">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-lg mb-3">
            🧩
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Selamat Datang di Studio Publisher Buku Aktivitas KDP
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hari ini Anda ingin membuat project apa? Pilih alur kerja yang sesuai dengan kebutuhan Anda.
          </p>
        </div>

        {/* Options Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Blank Canvas */}
          <button
            onClick={() => {
              onSelectBlank();
              onClose();
            }}
            className="group text-left p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/80 transition flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-indigo-500/10"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition">
                Buat dari Nol (Blank Project)
              </h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Mulai dengan kanvas bersih. Bebas merancang layout, teks, dan puzzle sesuai kreativitas Anda sendiri.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-400">
              <span>Mulai Kosong</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Option 2: Preset Template */}
          <button
            onClick={() => {
              onSelectTemplate();
              onClose();
            }}
            className="group text-left p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/80 transition flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-amber-500/10"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                Gunakan Template (Mars Mission)
              </h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Gunakan contoh template buku aktivitas interaktif lengkap dengan labirin, word search, dan solusi siap pakai.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
              <span>Gunakan Template</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Option 3: Book Builder / Multi-page */}
          <button
            onClick={() => {
              onSelectBookBuilder();
              onClose();
            }}
            className="group text-left p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/80 transition flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-emerald-500/10"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BookOpen size={20} />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition">
                Kelola Struktur Buku (Builder)
              </h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Atur urutan halaman buku multi-halaman, tambahkan halaman baru, atau siapkan ekspor PDF cetak.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <span>Buka Builder</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Studio Hybrid v2.5 • KDP Publishing Engine</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            Lewati & Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};
