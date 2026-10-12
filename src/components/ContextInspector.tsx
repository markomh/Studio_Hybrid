import React, { useState } from 'react';
import { BookPage, CanvasElement, ProjectMetadata } from '../types';
import { ElementRegistry } from '../registry/ElementRegistry';
import { PropertyFieldSchema } from '../registry/types';
import { DynamicPropertyField } from './properties/DynamicPropertyField';
import { PAGE_SPECS } from '../utils/kdpCalculator';
import { 
  ChevronDown, 
  ChevronRight, 
  Sliders, 
  FileText, 
  Sparkles, 
  Palette, 
  Layers, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ContextInspectorProps {
  page: BookPage;
  metadata?: ProjectMetadata;
  totalPages?: number;
  selectedElement?: 'maze' | 'wordsearch' | 'sudoku' | 'worksheet' | 'text' | 'assets' | 'page';
  activeElement?: CanvasElement | null;
  selectedIds?: string[];
  onUpdateCanvasElement?: (id: string, update: Partial<CanvasElement>) => void;
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
  onAlignElements?: (alignType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom', ids: string[]) => void;
  onDistributeElements?: (distType: 'horizontal' | 'vertical', ids: string[]) => void;
  onGroupMultipleElements?: (ids: string[]) => void;
  onDeleteMultipleElements?: (ids: string[]) => void;
  onDuplicateMultipleElements?: (ids: string[]) => void;
  onUpdateMazeConfig?: (update: Partial<any>) => void;
  onUpdateWordSearchConfig?: (update: Partial<any>) => void;
  onUpdateSudokuConfig?: (update: Partial<any>) => void;
  onUpdateWorksheetConfig?: (update: Partial<any>) => void;
  onUpdateTextElement?: (update: Partial<any>) => void;
  onUpdateBorderStyle?: (style: any) => void;
  onSelectContext?: (elem: 'maze' | 'wordsearch' | 'sudoku' | 'worksheet' | 'text' | 'assets' | 'page') => void;
  onOpenPageSetup?: () => void;
  onRegenerateMaze?: () => void;
  onRegenerateWordSearch?: () => void;
  onRegenerateSudoku?: () => void;
}

export const ContextInspector: React.FC<ContextInspectorProps> = ({
  page,
  metadata,
  totalPages,
  activeElement,
  selectedIds,
  onUpdateCanvasElement,
  onDeleteElement,
  onDuplicateElement,
  onAlignElements,
  onDistributeElements,
  onGroupMultipleElements,
  onDeleteMultipleElements,
  onDuplicateMultipleElements,
  onUpdateMazeConfig,
  onUpdateWordSearchConfig,
  onUpdateSudokuConfig,
  onUpdateWorksheetConfig,
  onUpdateTextElement,
  onUpdateBorderStyle,
  onOpenPageSetup,
  onRegenerateMaze,
  onRegenerateWordSearch,
  onRegenerateSudoku,
}) => {
  // Collapsible Accordion sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Konten': true,
    'Tipografi': true,
    'Gameplay': true,
    'Dimensi Grid': true,
    'Tampilan': true,
    'Tampilan Cetak': true,
    'Daftar Kata': true,
    'Kurikulum': true,
    'Penanda': true,
    'Transformasi': true,
    'Pengaturan': true,
    'page-border': true,
    'page-ai': true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeElement) return;

    setImageUploadError(null);

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setImageUploadError('Hanya file PNG dan JPG yang didukung.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Ukuran file melebihi batas 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl && onUpdateCanvasElement) {
        onUpdateCanvasElement(activeElement.id, { imageUrl: dataUrl, content: undefined });
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to extract property value
  const getFieldValue = (element: CanvasElement, key: string) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (parent === 'mazeConfig') return (element?.mazeConfig || page.mazeConfig as any)?.[child];
      if (parent === 'wordSearchConfig') return (page.wordSearchConfig as any)?.[child];
      if (parent === 'sudokuConfig') return (page.sudokuConfig as any)?.[child];
      if (parent === 'worksheetConfig') return (page.worksheetConfig as any)?.[child];
      return undefined;
    }
    return (element as any)[key];
  };

  // Helper to update property value
  const handleFieldChange = (key: string, val: any) => {
    if (!activeElement) return;

    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (parent === 'mazeConfig') {
        const defaultMaze = {
          rows: 15,
          cols: 15,
          algorithm: 'recursive-backtracker' as const,
          difficulty: 'medium' as const,
          wallThickness: 2,
          wallColor: '#1e293b',
          solutionColor: '#ef4444',
          startIcon: '🚀',
          finishIcon: '🪐',
          startCorner: 'topLeft' as const,
          finishCorner: 'bottomRight' as const,
          seed: 12345,
        };
        const nextMazeCfg = { ...(activeElement.mazeConfig || page.mazeConfig || defaultMaze), [child]: val };
        onUpdateCanvasElement?.(activeElement.id, { mazeConfig: nextMazeCfg });
      } else if (parent === 'wordSearchConfig') {
        onUpdateWordSearchConfig?.({ [child]: val });
      } else if (parent === 'sudokuConfig') {
        onUpdateSudokuConfig?.({ [child]: val });
      } else if (parent === 'worksheetConfig') {
        onUpdateWorksheetConfig?.({ [child]: val });
      }
    } else {
      onUpdateCanvasElement?.(activeElement.id, { [key]: val });
      // Backward sync for text
      if (key === 'content' && activeElement.id.includes('title')) {
        onUpdateTextElement?.({ title: val });
      } else if (key === 'content' && activeElement.id.includes('inst')) {
        onUpdateTextElement?.({ instructions: val });
      } else if (key === 'fontSize' && activeElement.id.includes('title')) {
        onUpdateTextElement?.({ titleSize: val });
      } else if (key === 'textAlign' && activeElement.id.includes('title')) {
        onUpdateTextElement?.({ align: val });
      }
    }
  };

  // AI Story & Instructions Generator
  const handleGenerateAiStory = async (tone = 'exciting and playful') => {
    try {
      setAiLoading(true);
      const res = await fetch('/api/ai/story-instruction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleType: page.puzzleType,
          title: page.textElement?.title || page.title,
          theme: page.title,
          targetAge: 'Kids 6-10',
          tone,
        }),
      });
      const data = await res.json();
      if (data.instruction) {
        onUpdateTextElement?.({
          instructions: data.instruction,
          footerStory: data.footerStory || page.textElement?.footerStory,
        });
      }
    } catch {
      // Fallback local text if server-side proxy route is offline
      onUpdateTextElement?.({
        instructions: `Bantu maskot menyelesaikan teka-teki ${page.title} dengan teliti dan menyenangkan!`,
        footerStory: 'Selamat! Kamu telah menyelesaikan tantangan ini dengan hebat!',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Determine active element definition from registry
  const definition = activeElement
    ? ElementRegistry.get(activeElement.type, activeElement.subType)
    : undefined;

  // Group schema fields by group name
  const groupedFields: Record<string, PropertyFieldSchema[]> = {};
  if (definition) {
    definition.propertySchema.forEach((field) => {
      const grp = field.group || 'Pengaturan';
      if (!groupedFields[grp]) groupedFields[grp] = [];
      groupedFields[grp].push(field);
    });
  }

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none z-10 shadow-lg">
      {/* 1. Header Inspector Panel */}
      <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Sliders size={15} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">
              {activeElement ? definition?.title || 'Properti Elemen' : 'Properti Halaman'}
            </span>
            <span className="text-[10px] text-slate-500">
              {activeElement ? `ID: ${activeElement.id.slice(0, 16)}` : `Halaman ${page.pageNumber}`}
            </span>
          </div>
        </div>

        {activeElement && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateCanvasElement?.(activeElement.id, { isLocked: !activeElement.isLocked })}
              className={`p-1.5 rounded transition cursor-pointer ${
                activeElement.isLocked ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={activeElement.isLocked ? 'Buka Kunci' : 'Kunci Posisi'}
            >
              {activeElement.isLocked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
            {onDuplicateElement && (
              <button
                onClick={() => onDuplicateElement(activeElement.id)}
                className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition cursor-pointer"
                title="Duplikasi Elemen"
              >
                <Copy size={13} />
              </button>
            )}
            {onDeleteElement && (
              <button
                onClick={() => onDeleteElement(activeElement.id)}
                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition cursor-pointer"
                title="Hapus Elemen"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Scrollable Body Controls */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* MULTI-SELECTION BATCH OPERATIONS (E4) */}
        {selectedIds && selectedIds.length > 1 && (
          <div className="p-3 border border-indigo-500/40 rounded-xl bg-indigo-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300">
                Multi-Seleksi ({selectedIds.length} Elemen)
              </span>
              {onGroupMultipleElements && (
                <button
                  onClick={() => onGroupMultipleElements(selectedIds)}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold transition cursor-pointer"
                >
                  Grup (Group)
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Perataan (Align)</div>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => onAlignElements?.('left', selectedIds)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] cursor-pointer">Kiri</button>
                <button onClick={() => onAlignElements?.('center', selectedIds)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] cursor-pointer">Tengah H</button>
                <button onClick={() => onAlignElements?.('right', selectedIds)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] cursor-pointer">Kanan</button>
                <button onClick={() => onAlignElements?.('top', selectedIds)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] cursor-pointer">Atas</button>
                <button onClick={() => onAlignElements?.('middle', selectedIds)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] cursor-pointer">Tengah V</button>
                <button onClick={() => onAlignElements?.('bottom', selectedIds)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] cursor-pointer">Bawah</button>
              </div>
            </div>

            {selectedIds.length >= 3 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Distribusi (Distribute)</div>
                <div className="grid grid-cols-2 gap-1">
                  <button onClick={() => onDistributeElements?.('horizontal', selectedIds)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] cursor-pointer">Distribusi H</button>
                  <button onClick={() => onDistributeElements?.('vertical', selectedIds)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] cursor-pointer">Distribusi V</button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 pt-1 border-t border-indigo-500/20">
              <button
                onClick={() => onDuplicateMultipleElements?.(selectedIds)}
                className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1"
              >
                <Copy size={12} /> Duplikasi
              </button>
              <button
                onClick={() => onDeleteMultipleElements?.(selectedIds)}
                className="flex-1 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1"
              >
                <Trash2 size={12} /> Hapus
              </button>
            </div>
          </div>
        )}

        {/* A. JIKA ADA ELEMEN AKTIF: RENDER DENGAN SCHEMA-DRIVEN FORM ENGINE */}
        {activeElement && definition && (
          <div className="space-y-3">
            {Object.entries(groupedFields).map(([groupName, fields]) => {
              const isOpen = openSections[groupName] ?? true;
              return (
                <div key={groupName} className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden shadow-xs">
                  <button
                    onClick={() => toggleSection(groupName)}
                    className="w-full px-3 py-2 bg-slate-950/80 flex items-center justify-between text-left cursor-pointer hover:bg-slate-800/40 transition"
                  >
                    <span className="text-[11px] font-semibold text-slate-200">
                      {groupName}
                    </span>
                    {isOpen ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-3 space-y-3 border-t border-slate-800">
                      {fields.map((field) => (
                        <DynamicPropertyField
                          key={field.key}
                          field={field}
                          value={getFieldValue(activeElement, field.key)}
                          element={activeElement}
                          onChange={handleFieldChange}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Image Upload Component for E3 */}
            {activeElement.type === 'image' && (
              <div className="p-3 border border-indigo-500/30 rounded-xl bg-slate-950/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Unggah Gambar (PNG/JPG)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Maks 5 MB</span>
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImageFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer cursor-pointer"
                />
                {imageUploadError && (
                  <div className="text-[11px] text-red-400 font-medium">{imageUploadError}</div>
                )}
                {activeElement.imageUrl && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-400 font-medium">✓ Gambar terunggah</span>
                    <button
                      onClick={() => onUpdateCanvasElement?.(activeElement.id, { imageUrl: undefined })}
                      className="text-[11px] text-red-400 hover:underline cursor-pointer"
                    >
                      Hapus Gambar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Generator Shortcut for Puzzles (F-04 Parity dengan FloatingToolbar) */}
            {activeElement.type === 'puzzle' && (
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-950/40 space-y-2">
                {activeElement.subType === 'labirin' && onRegenerateMaze && (
                  <button
                    onClick={onRegenerateMaze}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={13} />
                    <span>Acak Labirin</span>
                  </button>
                )}
                {activeElement.subType === 'word-search' && onRegenerateWordSearch && (
                  <button
                    onClick={onRegenerateWordSearch}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={13} />
                    <span>Acak Kisi</span>
                  </button>
                )}
                {activeElement.subType === 'sudoku' && onRegenerateSudoku && (
                  <button
                    onClick={onRegenerateSudoku}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={13} />
                    <span>Generate Baru</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* B. JIKA TIDAK ADA ELEMEN AKTIF: TAMPILKAN PROPERTI DOKUMEN & HALAMAN */}
        {!activeElement && (
          <div className="space-y-3">
            {/* 1. DOCUMENT & PAGE SETUP CARD (Primary Contextual Owner for Page Setup) */}
            <div className="border border-amber-500/30 rounded-xl bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-950/80 p-3 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <span className="text-amber-400">📐</span> Format & Page Setup
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md font-bold">
                  {metadata?.targetKdpFormat || 'Letter'}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Ukuran Potong (Trim):</span>
                  <span className="font-mono text-slate-200 font-medium">
                    {metadata?.targetKdpFormat && PAGE_SPECS[metadata.targetKdpFormat]
                      ? `${PAGE_SPECS[metadata.targetKdpFormat].widthMm} × ${PAGE_SPECS[metadata.targetKdpFormat].heightMm} mm`
                      : '215.9 × 279.4 mm'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Batas Potong (Bleed):</span>
                  <span className={`font-mono font-medium ${metadata?.bleed ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {metadata?.bleed ? 'Aktif (+3.2 mm)' : 'Tanpa Bleed'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Margin Dalam (Gutter):</span>
                  <span className="font-mono text-slate-300">
                    {metadata?.margins?.insideMm ?? 12.7} mm
                  </span>
                </div>
                {totalPages !== undefined && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Total Halaman:</span>
                    <span className="font-mono text-indigo-300 font-semibold">
                      {totalPages} Halaman
                    </span>
                  </div>
                )}
              </div>

              {onOpenPageSetup && (
                <button
                  onClick={onOpenPageSetup}
                  className="w-full py-1.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-500/60 text-amber-200 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group"
                  title="Buka Pengaturan Ukuran Kertas, Bleed, Margin, dan Penomoran Halaman"
                >
                  <Sliders size={12} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Ubah Page Setup Dokumen</span>
                </button>
              )}
            </div>

            {/* 2. Page Context Meta Card */}
            <div className="border border-slate-800 rounded-xl bg-slate-950/40 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Konteks Lembar</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-md font-bold">
                  {page.role || 'body'}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Nomor Lembar:</span>
                  <span className="font-mono font-bold text-slate-200">Halaman {page.pageNumber}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Posisi Spread:</span>
                  <span className="font-mono font-bold flex items-center gap-1 text-slate-200">
                    <span className={`w-1.5 h-1.5 rounded-full ${page.pageNumber % 2 !== 0 ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                    {page.pageNumber % 2 !== 0 ? 'Recto (Kanan)' : 'Verso (Kiri)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Sisi Jilidan (Gutter):</span>
                  <span className="font-mono text-slate-300">
                    {page.pageNumber % 2 !== 0 ? 'Tepi Kiri' : 'Tepi Kanan'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                💡 Klik atau pilih elemen apa saja pada kanvas untuk mengonfigurasi properti objek.
              </p>
            </div>

            {/* Bingkai Garis Tepi (Border) */}
            <div className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden shadow-xs">
              <button
                onClick={() => toggleSection('page-border')}
                className="w-full px-3 py-2 bg-slate-950/80 flex items-center justify-between text-left cursor-pointer hover:bg-slate-800/40 transition"
              >
                <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                  <Palette size={12} className="text-indigo-400" /> Bingkai Lembar Halaman
                </span>
                {openSections['page-border'] ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
              </button>

              {openSections['page-border'] && (
                <div className="p-3 space-y-2.5 border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-400">Gaya Garis Tepi</label>
                    <select
                      value={page.borderStyle || 'none'}
                      onChange={(e) => onUpdateBorderStyle?.(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="none">Tanpa Bingkai (Polos)</option>
                      <option value="simple">Garis Sederhana (Simple)</option>
                      <option value="rounded">Sudut Melengkung (Rounded)</option>
                      <option value="double">Garis Ganda (Double)</option>
                      <option value="dots">Garis Titik-titik (Dots)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Clipart / Maskot Aktif */}
            {page.customAssetEmoji && (
              <div className="border border-slate-800 rounded-xl bg-slate-950/40 p-3 space-y-1.5">
                <span className="text-[10px] font-medium text-slate-400 block">Maskot Halaman Aktif</span>
                <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-2xl">{page.customAssetEmoji}</span>
                  <div className="text-xs text-slate-300">
                    <div className="font-semibold">Ikon Terpasang</div>
                    <div className="text-[10px] text-slate-500">Muncul di kanvas sebagai elemen dekorasi</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
