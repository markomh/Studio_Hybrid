import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { 
  RotateCcw, 
  RotateCw, 
  Printer, 
  Share2, 
  ChevronDown, 
  Eye,
  Maximize2,
  Cloud, 
  Copy, 
  Plus, 
  Trash2, 
  Download, 
  Sparkles, 
  Layers, 
  Wand2, 
  X,
  Compass
} from 'lucide-react';

interface HeaderProps {
  project: Project;
  onUpdateProjectName: (name: string) => void;
  // Document Commands
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onAddNewPage?: () => void;
  onDuplicateCurrentPage?: () => void;
  onResetCurrentPage?: () => void;
  onQuickExportPdf: () => void;
  onDirectPrint?: () => void;
  // Primary Owner: Document Settings
  onOpenPageSetup: () => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  onOpenKdpModal: () => void;
  onOpenBatchModal: () => void;
  onOpenAssetModal: () => void;
  onOpenAiModal: () => void;
  onOpenDownloadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProjectName,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onAddNewPage,
  onDuplicateCurrentPage,
  onResetCurrentPage,
  onQuickExportPdf,
  onDirectPrint,
  onOpenPageSetup,
  focusMode,
  onToggleFocusMode,
  onOpenKdpModal,
  onOpenBatchModal,
  onOpenAssetModal,
  onOpenAiModal,
  onOpenDownloadModal,
}) => {
  // Dropdown states
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [shareFlyoutOpen, setShareFlyoutOpen] = useState(false);

  const fileMenuRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const shareFlyoutRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setFileMenuOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
      if (shareFlyoutRef.current && !shareFlyoutRef.current.contains(e.target as Node)) {
        setShareFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-13 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 md:px-5 shrink-0 z-30 select-none">
      {/* ================= LEFT: DOCUMENT COMMANDS ================= */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Brand Badge */}
        <div 
          className="flex items-center gap-2 group mr-1 cursor-default"
          title="Studio Hybrid Workspace - Activity Book Publisher"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
            🧩
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="font-bold text-xs tracking-wide text-slate-100">
              STUDIO HYBRID
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Activity Book Workspace</span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

        {/* 1. FILE DROPDOWN (Clean Document Commands) */}
        <div className="relative" ref={fileMenuRef}>
          <button
            onClick={() => setFileMenuOpen(!fileMenuOpen)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              fileMenuOpen ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <span>File</span>
            <ChevronDown size={12} className={`transition-transform text-slate-400 ${fileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {fileMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                Aksi Halaman
              </div>
              <button
                onClick={() => {
                  setFileMenuOpen(false);
                  onAddNewPage?.();
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
              >
                <Plus size={14} className="text-emerald-400" />
                <span>+ Buat Halaman Baru</span>
              </button>
              <button
                onClick={() => {
                  setFileMenuOpen(false);
                  onDuplicateCurrentPage?.();
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
              >
                <Copy size={14} className="text-indigo-400" />
                <span>Duplikasi Halaman Ini</span>
              </button>
              <button
                onClick={() => {
                  setFileMenuOpen(false);
                  onResetCurrentPage?.();
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-rose-600 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
              >
                <Trash2 size={14} className="text-rose-400" />
                <span>Reset Konten Halaman</span>
              </button>
              
              <div className="my-1 border-t border-slate-800"></div>
              
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                Dokumen & Pra-Cetak
              </div>
              {/* FILE -> PAGE SETUP (Opens the exact same Page Setup panel) */}
              <button
                onClick={() => {
                  setFileMenuOpen(false);
                  onOpenPageSetup();
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
              >
                <span className="text-amber-400 text-sm">📐</span>
                <span className="font-medium">Page Setup (Dokumen)</span>
              </button>
              <button
                onClick={() => {
                  setFileMenuOpen(false);
                  onQuickExportPdf();
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
              >
                <Download size={14} className="text-cyan-400" />
                <span>Ekspor Dokumen PDF</span>
              </button>
              <button
                onClick={() => {
                  setFileMenuOpen(false);
                  if (onDirectPrint) onDirectPrint();
                  else window.print();
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
              >
                <Printer size={14} className="text-indigo-400" />
                <span>Cetak Lembar Aktif (Print)</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. UNDO & REDO */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'text-slate-600 opacity-40 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition ${
              canRedo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'text-slate-600 opacity-40 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={13} />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden md:block"></div>

        {/* 4. AUTO-FLEX PROJECT NAME & AUTO-SAVED BADGE */}
        <div className="flex items-center gap-1.5 max-w-[260px]">
          <input
            type="text"
            value={project.metadata.name}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            style={{
              width: `${Math.max(120, Math.min(220, project.metadata.name.length * 8.5 + 20))}px`,
            }}
            className="bg-transparent border border-transparent hover:border-slate-700 focus:border-indigo-500 focus:bg-slate-950 text-xs font-semibold px-2 py-1 rounded text-slate-200 focus:outline-none transition truncate"
            title="Klik untuk mengubah nama dokumen buku"
          />

          <div 
            className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-400 font-medium px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md shrink-0"
            title="Semua perubahan tersimpan otomatis di dokumen"
          >
            <Cloud size={11} className="text-emerald-400" />
            <span className="hidden lg:inline text-[9px]">Tersimpan</span>
          </div>
        </div>
      </div>

      {/* ================= CENTER: VIEW / FOCUS CONTROLS ================= */}
      <div className="flex items-center gap-2">
        {/* Focus Mode Toggle */}
        <button
          onClick={onToggleFocusMode}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border ${
            focusMode
              ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
              : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
          title="Mode Fokus (TAB atau Ctrl+\\) - Sembunyikan panel samping untuk review kanvas"
        >
          <Maximize2 size={13} className={focusMode ? 'text-white' : 'text-slate-400'} />
          <span className="hidden sm:inline">Mode Fokus</span>
          <span className="text-[9px] font-mono opacity-60 ml-0.5 hidden md:inline">Tab</span>
        </button>
      </div>

      {/* ================= RIGHT: WORKSPACE TOOLS & SHARE ACTION ================= */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* WORKSPACE TOOLS (Grouped as Clean Secondary Actions) */}
        <div className="relative" ref={toolsDropdownRef}>
          <button
            onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              toolsDropdownOpen 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            title="Buka utilitas pendukung workspace"
          >
            <Compass size={13} className="text-indigo-400" />
            <span className="hidden sm:inline">Utilitas</span>
            <ChevronDown size={11} className={`transition-transform text-slate-400 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {toolsDropdownOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 mb-1">
                Alat Pendukung (Workspace Tools)
              </div>

              <button
                onClick={() => {
                  setToolsDropdownOpen(false);
                  onOpenKdpModal();
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition cursor-pointer"
              >
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                  <Layers size={14} />
                </div>
                <div>
                  <div className="font-medium text-slate-200">KDP Pre-Press Toolkit</div>
                  <div className="text-[10px] text-slate-400">Kalkulator spine & batas margin</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setToolsDropdownOpen(false);
                  onOpenBatchModal();
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition cursor-pointer"
              >
                <div className="p-1 rounded bg-amber-500/10 text-amber-400">
                  <Wand2 size={14} />
                </div>
                <div>
                  <div className="font-medium text-slate-200">Batch Puzzle Generator</div>
                  <div className="text-[10px] text-slate-400">Buat 20-100 halaman massal otomatis</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setToolsDropdownOpen(false);
                  onOpenAssetModal();
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition cursor-pointer"
              >
                <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                  <Sparkles size={14} />
                </div>
                <div>
                  <div className="font-medium text-slate-200">Koleksi Aset & Maskot</div>
                  <div className="text-[10px] text-slate-400">Library clipart, frame, dan stiker</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setToolsDropdownOpen(false);
                  onOpenAiModal();
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition cursor-pointer"
              >
                <div className="p-1 rounded bg-purple-500/10 text-purple-400">
                  <span className="text-xs">✨</span>
                </div>
                <div>
                  <div className="font-medium text-slate-200">AI Assistant Studio</div>
                  <div className="text-[10px] text-slate-400">Prompt builder & ide konsep buku</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* PRIMARY ACTION: SHARE / PUBLISH (Bagikan Flyout) */}
        <div className="relative" ref={shareFlyoutRef}>
          <button
            onClick={() => setShareFlyoutOpen(!shareFlyoutOpen)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 size={13} className="text-white" />
            <span>Bagikan</span>
            <ChevronDown size={11} className={`transition-transform ${shareFlyoutOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* SHARE FLYOUT */}
          {shareFlyoutOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-3.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <Share2 size={14} className="text-indigo-400" /> Ekspor & Publikasi
                </span>
                <button
                  onClick={() => setShareFlyoutOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="space-y-2">
                {/* Opsi 1: DOWNLOAD CENTER */}
                <div 
                  onClick={() => {
                    setShareFlyoutOpen(false);
                    onOpenDownloadModal();
                  }}
                  className="p-2.5 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                      <span>📥</span> Pusat Unduhan (Download)
                    </span>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-mono font-medium px-1.5 py-0.5 rounded border border-indigo-500/20">
                      PDF • SVG • ZIP
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Unduh interior buku lengkap siap terbit dalam format PDF Vektor, SVG, atau ZIP Batch.
                  </p>
                </div>

                {/* Opsi 2: EKSPOR PDF CEPAT */}
                <div 
                  onClick={() => {
                    setShareFlyoutOpen(false);
                    onQuickExportPdf();
                  }}
                  className="p-2.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl cursor-pointer transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                      <Download size={13} className="text-cyan-400" /> Ekspor PDF Cepat
                    </span>
                    <span className="text-[9px] bg-cyan-500/10 text-cyan-400 font-mono font-medium px-1.5 py-0.5 rounded border border-cyan-500/20">
                      1-Klik
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Generate langsung file PDF interior lengkap dengan margin KDP terkalibrasi.
                  </p>
                </div>

                {/* Opsi 3: PRINT LANGSUNG */}
                <div 
                  onClick={() => {
                    setShareFlyoutOpen(false);
                    if (onDirectPrint) onDirectPrint();
                    else window.print();
                  }}
                  className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                      <Printer size={13} className="text-slate-300" /> Cetak Lembar Proof
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-300 font-mono font-medium px-1.5 py-0.5 rounded">
                      Fisik
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Kirim lembar aktif langsung ke printer fisik untuk proofing cepat.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
