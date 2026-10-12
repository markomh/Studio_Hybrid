import React, { useState } from 'react';
import { BookPage, Project, PageRole, BookSettings, BookSection } from '../types';
import { validateKdpCompliance, PAGE_SPECS } from '../utils/kdpCalculator';
import { calculateBookPagination } from '../utils/paginationEngine';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  ShieldCheck, 
  BookOpen, 
  Bookmark, 
  Sparkles,
  Settings2,
  AlertTriangle,
  Columns,
  Grid,
  Check,
  X,
  ExternalLink,
  Info
} from 'lucide-react';

interface BookBuilderViewProps {
  project: Project;
  onSelectPageAndOpenStudio: (index: number) => void;
  onAddPage: (role?: PageRole, sectionId?: string) => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePage: (fromIdx: number, toIdx: number) => void;
  onCompileSolutions?: () => void;
  onUpdateBookSettings?: (settings: BookSettings) => void;
  onUpdatePageRole?: (pageIndex: number, role: PageRole) => void;
  onOpenKdpModal: () => void;
  onCloseToStudio: () => void;
}

export const BookBuilderView: React.FC<BookBuilderViewProps> = ({
  project,
  onSelectPageAndOpenStudio,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
  onCompileSolutions,
  onUpdateBookSettings,
  onUpdatePageRole,
  onOpenKdpModal,
  onCloseToStudio,
}) => {
  const [viewMode, setViewMode] = useState<'sections' | 'spreads'>('sections');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [solutionMessage, setSolutionMessage] = useState<string | null>(null);

  // 1. Run Dynamic Pagination Engine (Phase 2 & Phase 5)
  const paginationResult = calculateBookPagination(
    project.pages,
    project.sections,
    project.bookSettings
  );

  const { pages: calculatedPages, spreads, stats } = paginationResult;
  const sections = project.sections && project.sections.length > 0 
    ? project.sections 
    : [
        { id: 'sec_front', name: 'Bagian Awal (Front Matter)', role: 'front_matter' as const, numberingStyle: 'roman-lower' as const },
        { id: 'sec_body', name: 'Isi Utama (Body Chapters)', role: 'body' as const, numberingStyle: 'arabic' as const },
        { id: 'sec_solutions', name: 'Kunci Jawaban & Solusi', role: 'solutions' as const, numberingStyle: 'arabic' as const },
      ];

  const validation = validateKdpCompliance(project.metadata, project.pages.length);
  const spec = PAGE_SPECS[project.metadata.targetKdpFormat];

  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSections(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleCompile = () => {
    if (onCompileSolutions) {
      onCompileSolutions();
      setSolutionMessage('Kunci jawaban berhasil dikompilasi ke bagian Solusi.');
      setTimeout(() => setSolutionMessage(null), 4000);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col">
      {/* ================= TOP HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1.5">
            <Layers size={14} />
            <span>Book Builder Architecture</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Modul F (Hierarkis & Spreads)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Struktur Buku & Tata Letak Penerbitan</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-0.5">
            Kelola bagian hierarkis (Front Matter, Isi, Solusi), aturan penomoran dinamis, dan verifikasi cetak KDP.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          {onCompileSolutions && (
            <button
              onClick={handleCompile}
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Kompilasi otomatis kunci jawaban dari puzzle interior"
            >
              <Sparkles size={14} className="text-purple-400" />
              Kompilasi Kunci Jawaban
            </button>
          )}

          <button
            onClick={() => setSettingsOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Atur penomoran halaman buku"
          >
            <Settings2 size={14} className="text-indigo-400" />
            Aturan Pagination
          </button>

          <button
            onClick={onOpenKdpModal}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck size={14} className="text-emerald-400" />
            KDP Validator
          </button>

          <button
            onClick={onCloseToStudio}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow cursor-pointer"
          >
            Buka di Editor Kanvas
          </button>
        </div>
      </div>

      {/* ================= KOGNITIF: EXCEPTION BEFORE SUMMARY ================= */}
      {/* 1. Odd Page Count Warning (KDP Hard Requirement) */}
      {!stats.isEvenPageCount && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3.5 text-amber-200 animate-in fade-in">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-300 block text-sm">
              Perhatian Spesifikasi KDP: Jumlah Halaman Ganjil ({project.pages.length} Halaman)
            </span>
            <p className="mt-1 text-amber-200/80 leading-relaxed">
              Buku cetak fisik KDP mengharuskan jumlah halaman genap karena setiap lembar kertas memiliki 2 sisi (Verso & Recto). 
              Jika diunggah dalam jumlah ganjil, sistem Amazon KDP akan menyisipkan halaman kosong tambahan di akhir buku.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onAddPage('body')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={12} /> Tambah 1 Halaman Kosong (Genapkan)
              </button>
              {onCompileSolutions && (
                <button
                  onClick={handleCompile}
                  className="bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Kompilasi Kunci Jawaban
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Success feedback message */}
      {solutionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 text-xs flex items-center gap-2">
          <Check size={16} className="text-emerald-400" />
          <span>{solutionMessage}</span>
        </div>
      )}

      {/* ================= SUMMARY & SPECIFICATIONS BAR ================= */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Halaman</span>
            <span className="text-xl font-black text-white font-mono">
              {project.pages.length} Hal {stats.isEvenPageCount ? '(Genap)' : '(Ganjil)'}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Format Kertas (Trim)</span>
            <span className="text-xl font-black text-indigo-400 font-mono">{spec.name}</span>
          </div>
          <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Tebal Spine Punggung</span>
            <span className="text-xl font-black text-purple-400 font-mono">
              {validation.calculatedSpineThicknessMm.toFixed(2)} mm
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Distribusi Bagian</span>
            <span className="text-xs text-slate-300 font-mono mt-0.5 block">
              {stats.totalFrontMatterPages + stats.totalCoverPages} Depan · {stats.totalBodyPages} Isi · {stats.totalSolutionPages} Solusi
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('sections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'sections' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid size={13} />
            <span>Tata Letak Bagian</span>
          </button>
          <button
            onClick={() => setViewMode('spreads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'spreads' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns size={13} />
            <span>Spread 2-Halaman (Verso/Recto)</span>
          </button>
        </div>
      </div>

      {/* ================= VIEW A: SECTION GROUPED GRID ================= */}
      {viewMode === 'sections' && (
        <div className="space-y-6">
          {sections.map((section) => {
            const sectionPages = calculatedPages.filter((p) => {
              if (p.sectionId === section.id) return true;
              if (!p.sectionId && section.role === p.role) return true;
              if (!p.sectionId && !p.role && section.role === 'body') return true;
              return false;
            });
            const isCollapsed = !!collapsedSections[section.id];

            return (
              <div 
                key={section.id} 
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-4"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSectionCollapse(section.id)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                      title={isCollapsed ? 'Buka bagian' : 'Tutup bagian'}
                    >
                      {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white">{section.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({sectionPages.length} Halaman)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {section.description || (
                          section.role === 'front_matter' 
                            ? 'Penomoran romawi kecil (i, ii, iii...)' 
                            : section.role === 'solutions' 
                            ? 'Halaman kunci jawaban teka-teki' 
                            : 'Isi bab utama dengan penomoran standar'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddPage(section.role, section.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Plus size={12} /> Tambah ke Bagian Ini
                    </button>
                  </div>
                </div>

                {/* Section Pages Grid */}
                {!isCollapsed && (
                  <div>
                    {sectionPages.length === 0 ? (
                      <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                        Belum ada halaman di bagian ini. Klik "Tambah ke Bagian Ini" untuk menambahkan halaman.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
                        {sectionPages.map((p) => {
                          const actualIndex = project.pages.findIndex((orig) => orig.id === p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => onSelectPageAndOpenStudio(actualIndex)}
                              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/80 p-3 rounded-xl cursor-pointer flex flex-col items-center relative group transition hover:scale-[1.02] shadow"
                            >
                              {/* Display Page Number Badge */}
                              <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                                <span className="bg-slate-800 group-hover:bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow font-mono transition-colors">
                                  #{actualIndex + 1}
                                </span>
                                {p.displayPageNumber && (
                                  <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                                    {p.displayPageNumber}
                                  </span>
                                )}
                              </div>

                              {/* Solution or Role Indicator */}
                              {p.isSolutionPage && (
                                <span className="absolute top-2 right-2 bg-purple-500/20 text-purple-300 text-[9px] font-bold px-1 py-0.5 rounded border border-purple-500/30">
                                  Solusi
                                </span>
                              )}

                              {/* Hover Actions Overlay */}
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/90 rounded-md p-0.5 border border-slate-800 flex items-center gap-1 z-20"
                              >
                                {actualIndex > 0 && (
                                  <button
                                    onClick={() => onMovePage(actualIndex, actualIndex - 1)}
                                    className="text-slate-400 hover:text-white p-1"
                                    title="Geser Mundur"
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                )}
                                {actualIndex < project.pages.length - 1 && (
                                  <button
                                    onClick={() => onMovePage(actualIndex, actualIndex + 1)}
                                    className="text-slate-400 hover:text-white p-1"
                                    title="Geser Maju"
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                )}
                                <button
                                  onClick={() => onDuplicatePage(actualIndex)}
                                  className="text-slate-400 hover:text-indigo-400 p-1"
                                  title="Duplikasi"
                                >
                                  <Copy size={12} />
                                </button>
                                {project.pages.length > 1 && (
                                  <button
                                    onClick={() => onDeletePage(actualIndex)}
                                    className="text-slate-400 hover:text-red-400 p-1"
                                    title="Hapus"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>

                              {/* Thumbnail graphic */}
                              <div className="w-full aspect-[1/1.414] bg-white rounded-sm mt-5 mb-2 flex flex-col p-1.5 shadow-sm overflow-hidden relative">
                                <div className="h-1 bg-slate-300 rounded w-2/3 mx-auto mb-1"></div>
                                <div className="flex-1 border border-slate-200 bg-slate-50 rounded flex items-center justify-center text-sm font-bold text-slate-700">
                                  {p.puzzleType === 'maze' && '🧩'}
                                  {p.puzzleType === 'wordsearch' && '🔍'}
                                  {p.puzzleType === 'sudoku' && '🔢'}
                                  {p.puzzleType === 'worksheet' && '📝'}
                                  {p.puzzleType === 'custom' && '📄'}
                                </div>
                                <div className="h-0.5 bg-slate-200 rounded w-1/3 mx-auto mt-1"></div>
                              </div>

                              {/* Title & Metadata */}
                              <div className="w-full text-center">
                                <p className="text-[11px] font-bold text-slate-200 truncate">{p.title}</p>
                                <span className="text-[9px] text-slate-400 capitalize block">
                                  {p.puzzleType} {p.difficulty ? `• ${p.difficulty}` : ''}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= VIEW B: 2-PAGE SPREADS VIEW (VERSO / RECTO) ================= */}
      {viewMode === 'spreads' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-indigo-400" />
              <span>
                <strong>Simulasi Spread Cetak KDP:</strong> Menampilkan halaman berpasangan sebagaimana buku saat dibuka.
                Halaman Kiri adalah <strong>Verso</strong> (Halaman Genap) dan Halaman Kanan adalah <strong>Recto</strong> (Halaman Ganjil). 
                Garis tengah merepresentasikan <strong>Punggung Buku (Spine Fold)</strong>.
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {spreads.map((spread) => (
              <div 
                key={spread.spreadIndex}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
                  <span>
                    {spread.spreadIndex === 0 
                      ? 'SPREAD 0: Halaman Pertama (Cover / Recto Kanan)' 
                      : `SPREAD ${spread.spreadIndex}: Pasangan Halaman (Verso & Recto)`}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Gutter Margin di Tengah Punggung
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
                  {/* Left Side (Verso) */}
                  {spread.leftPage ? (
                    <div 
                      onClick={() => onSelectPageAndOpenStudio(project.pages.findIndex(p => p.id === spread.leftPage?.id))}
                      className="bg-slate-950 border border-slate-800 hover:border-indigo-500 p-4 rounded-xl cursor-pointer flex flex-col items-center transition relative group"
                    >
                      <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mb-2">
                        <span className="font-bold text-white">VERSO (KIRI)</span>
                        <span className="font-mono">{spread.leftPage.displayPageNumber || `#${project.pages.findIndex(p => p.id === spread.leftPage?.id) + 1}`}</span>
                      </div>
                      
                      <div className="w-full aspect-[1/1.414] bg-white rounded-sm shadow p-2 flex flex-col justify-between border-r-2 border-r-slate-300">
                        <div className="text-[8px] font-bold text-slate-800 truncate text-center">
                          {spread.leftPage.title}
                        </div>
                        <div className="flex-1 flex items-center justify-center text-2xl">
                          {spread.leftPage.puzzleType === 'maze' && '🧩'}
                          {spread.leftPage.puzzleType === 'wordsearch' && '🔍'}
                          {spread.leftPage.puzzleType === 'sudoku' && '🔢'}
                          {spread.leftPage.puzzleType === 'worksheet' && '📝'}
                          {spread.leftPage.puzzleType === 'custom' && '📄'}
                        </div>
                        <div className="text-[8px] text-slate-500 text-left font-mono">
                          {spread.leftPage.displayPageNumber}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-slate-600 text-xs text-center">
                      <span>Cover Depan Luar</span>
                      <span className="text-[10px] text-slate-700 mt-1">(Tidak ada halaman di sisi kiri)</span>
                    </div>
                  )}

                  {/* Right Side (Recto) */}
                  {spread.rightPage ? (
                    <div 
                      onClick={() => onSelectPageAndOpenStudio(project.pages.findIndex(p => p.id === spread.rightPage?.id))}
                      className="bg-slate-950 border border-slate-800 hover:border-indigo-500 p-4 rounded-xl cursor-pointer flex flex-col items-center transition relative group"
                    >
                      <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mb-2">
                        <span className="font-bold text-white">RECTO (KANAN)</span>
                        <span className="font-mono">{spread.rightPage.displayPageNumber || `#${project.pages.findIndex(p => p.id === spread.rightPage?.id) + 1}`}</span>
                      </div>
                      
                      <div className="w-full aspect-[1/1.414] bg-white rounded-sm shadow p-2 flex flex-col justify-between border-l-2 border-l-slate-300">
                        <div className="text-[8px] font-bold text-slate-800 truncate text-center">
                          {spread.rightPage.title}
                        </div>
                        <div className="flex-1 flex items-center justify-center text-2xl">
                          {spread.rightPage.puzzleType === 'maze' && '🧩'}
                          {spread.rightPage.puzzleType === 'wordsearch' && '🔍'}
                          {spread.rightPage.puzzleType === 'sudoku' && '🔢'}
                          {spread.rightPage.puzzleType === 'worksheet' && '📝'}
                          {spread.rightPage.puzzleType === 'custom' && '📄'}
                        </div>
                        <div className="text-[8px] text-slate-500 text-right font-mono">
                          {spread.rightPage.displayPageNumber}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-amber-500/80 text-xs text-center">
                      <AlertTriangle size={16} className="mb-1" />
                      <span>Sisi Kanan Kosong (Ganjil)</span>
                      <span className="text-[10px] text-slate-500 mt-1">Tambahkan 1 halaman untuk menutup spread</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= PAGINATION SETTINGS MODAL (PHASE 2 & OWNERSHIP DECOUPLING) ================= */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 size={18} className="text-indigo-400" />
                <h3 className="font-bold text-white text-base">Aturan Pagination Buku</h3>
              </div>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Enable Pagination */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Aktifkan Penomoran Halaman</span>
                  <span className="text-slate-400 text-[11px]">Tampilkan nomor di kanvas dan ekspor PDF</span>
                </div>
                <input
                  type="checkbox"
                  checked={project.bookSettings?.pagination?.enabled !== false}
                  onChange={(e) => {
                    if (onUpdateBookSettings) {
                      onUpdateBookSettings({
                        pagination: {
                          ...(project.bookSettings?.pagination || {
                            startPage: 1,
                            position: 'bottom-center',
                            format: 'dash',
                          }),
                          enabled: e.target.checked,
                        },
                      });
                    }
                  }}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Numbering Format */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Gaya / Format Nomor</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'number', label: '1, 2, 3' },
                    { id: 'dash', label: '- 1 -' },
                    { id: 'text', label: 'Hal 1' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        if (onUpdateBookSettings) {
                          onUpdateBookSettings({
                            pagination: {
                              ...(project.bookSettings?.pagination || {
                                enabled: true,
                                startPage: 1,
                                position: 'bottom-center',
                              }),
                              format: fmt.id as any,
                            },
                          });
                        }
                      }}
                      className={`p-2 rounded-lg border text-center transition font-mono ${
                        (project.bookSettings?.pagination?.format || 'dash') === fmt.id
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Posisi Nomor Halaman</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bottom-center', label: 'Bawah Tengah' },
                    { id: 'bottom-outer', label: 'Bawah Luar' },
                    { id: 'top-center', label: 'Atas Tengah' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => {
                        if (onUpdateBookSettings) {
                          onUpdateBookSettings({
                            pagination: {
                              ...(project.bookSettings?.pagination || {
                                enabled: true,
                                startPage: 1,
                                format: 'dash',
                              }),
                              position: pos.id as any,
                            },
                          });
                        }
                      }}
                      className={`p-2 rounded-lg border text-center transition ${
                        (project.bookSettings?.pagination?.position || 'bottom-center') === pos.id
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suppress Cover */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Sembunyikan Nomor di Cover</span>
                  <span className="text-slate-400 text-[11px]">Halaman cover tidak akan dicetak dengan nomor</span>
                </div>
                <input
                  type="checkbox"
                  checked={project.bookSettings?.pagination?.suppressCover !== false}
                  onChange={(e) => {
                    if (onUpdateBookSettings) {
                      onUpdateBookSettings({
                        pagination: {
                          ...(project.bookSettings?.pagination || {
                            enabled: true,
                            startPage: 1,
                            position: 'bottom-center',
                            format: 'dash',
                          }),
                          suppressCover: e.target.checked,
                        },
                      });
                    }
                  }}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
              >
                Simpan & Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
