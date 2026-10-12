import React, { useState } from 'react';
import { BookPage, PuzzleType, CanvasElement } from '../types';
import { 
  Plus, 
  Trash2, 
  Copy, 
  X, 
  Layers, 
  Shapes, 
  Palette, 
  GripVertical,
  Type
} from 'lucide-react';
import { ASSET_CATEGORIES } from '../data/assets';

interface LeftSidebarProps {
  pages: BookPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: (type: PuzzleType) => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePage: (fromIdx: number, toIdx: number) => void;
  onSelectContext: (context: 'maze' | 'wordsearch' | 'sudoku' | 'worksheet' | 'text' | 'assets' | 'page') => void;
  onConvertCurrentPageType: (type: PuzzleType) => void;
  onApplyClipartToPage?: (emoji: string) => void;
  onApplyBorderStyle?: (style: 'none' | 'simple' | 'double' | 'rounded' | 'dots') => void;
  onAddElement?: (element: Partial<CanvasElement>) => void;
  onOpenCover?: () => void;
  onOpenBookStructure?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onSelectContext,
  onConvertCurrentPageType,
  onApplyClipartToPage,
  onApplyBorderStyle,
  onAddElement,
  onOpenCover,
  onOpenBookStructure,
}) => {
  // Canonical Navigation rail tabs: 'elements' (Puzzles, Text, Clipart), 'borders' (Page Border), 'pages' (Book Thumbnails)
  const [activeTab, setActiveTab] = useState<'elements' | 'borders' | 'pages' | null>('elements');

  const currentPage = pages[activePageIndex] || pages[0];

  const handleRailTabClick = (tab: 'elements' | 'borders' | 'pages') => {
    if (activeTab === tab) {
      setActiveTab(null); // Collapse drawer
    } else {
      setActiveTab(tab); // Open drawer with this tab
    }
  };

  const handleInsertPuzzle = (subType: 'labirin' | 'sudoku' | 'word-search' | 'worksheet', label: string) => {
    if (onAddElement) {
      onAddElement({
        type: 'puzzle',
        subType,
        width: 250,
        height: 250,
        x: 90,
        y: 110,
      });
    } else {
      const pType = subType === 'labirin' ? 'maze' : subType === 'word-search' ? 'wordsearch' : subType;
      onConvertCurrentPageType(pType as PuzzleType);
      onSelectContext(subType === 'labirin' ? 'maze' : subType === 'word-search' ? 'wordsearch' : (subType as any));
    }
  };

  const handleInsertShape = (shapeType: 'rect' | 'ellipse' | 'line', label: string) => {
    if (onAddElement) {
      onAddElement({
        type: 'shape',
        shapeType,
        width: shapeType === 'line' ? 160 : 120,
        height: shapeType === 'line' ? 20 : 80,
        x: 100,
        y: 150,
        fillColor: shapeType === 'line' ? 'transparent' : '#e0e7ff',
        strokeColor: '#4f46e5',
        strokeWidth: 2,
        strokeStyle: 'solid',
        cornerRadius: shapeType === 'rect' ? 8 : 0,
        opacity: 1,
        rotation: 0,
      });
    }
  };

  const handleSidebarImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Hanya file PNG dan JPG yang didukung.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file melebihi batas 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl && onAddElement) {
        onAddElement({
          type: 'image',
          imageUrl: dataUrl,
          width: 120,
          height: 120,
          x: 110,
          y: 130,
          opacity: 1,
          rotation: 0,
          flipHorizontal: false,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInsertText = (titleText: string, fontSize = 20, isInstruction = false) => {
    if (onAddElement) {
      onAddElement({
        type: 'text',
        content: titleText,
        fontSize,
        color: isInstruction ? '#475569' : '#0f172a',
        textAlign: 'center',
        width: 260,
        height: isInstruction ? 40 : 50,
        x: 85,
        y: isInstruction ? 80 : 35,
      });
    } else {
      onSelectContext('text');
    }
  };

  return (
    <div className="flex h-full shrink-0 z-20 select-none relative">
      {/* 1. LEFT ICON RAIL (64px) */}
      <aside className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 justify-between shrink-0 z-20">
        <div className="flex flex-col items-center gap-2 w-full px-1.5">
          {/* Rail Tab 1: Elemen (Puzzles, Teks, Clipart) */}
          <button
            onClick={() => handleRailTabClick('elements')}
            className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer group relative ${
              activeTab === 'elements'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Elemen Kanvas (Puzzle, Teks, dan Clipart)"
          >
            <div className={`p-1.5 rounded-lg transition ${activeTab === 'elements' ? 'bg-indigo-600 text-white' : 'group-hover:scale-105'}`}>
              <Shapes size={16} />
            </div>
            <span className="text-[10px] tracking-tight">Elemen</span>
            {activeTab === 'elements' && (
              <span className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-1 h-3.5 bg-indigo-500 rounded-l-full"></span>
            )}
          </button>

          {/* Rail Tab 2: Bingkai (Borders Halaman) */}
          <button
            onClick={() => handleRailTabClick('borders')}
            className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer group relative ${
              activeTab === 'borders'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Bingkai Lembar Halaman (Borders)"
          >
            <div className={`p-1.5 rounded-lg transition ${activeTab === 'borders' ? 'bg-indigo-600 text-white' : 'group-hover:scale-105'}`}>
              <Palette size={16} />
            </div>
            <span className="text-[10px] tracking-tight">Bingkai</span>
            {activeTab === 'borders' && (
              <span className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-1 h-3.5 bg-indigo-500 rounded-l-full"></span>
            )}
          </button>

          {/* Rail Tab 3: Halaman (Book Pages Sequence) */}
          <button
            onClick={() => handleRailTabClick('pages')}
            className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer group relative ${
              activeTab === 'pages'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Sekuens Halaman Buku"
          >
            <div className={`p-1.5 rounded-lg transition relative ${activeTab === 'pages' ? 'bg-indigo-600 text-white' : 'group-hover:scale-105'}`}>
              <Layers size={16} />
              <span className="absolute -top-1 -right-1.5 bg-indigo-500 text-white text-[8px] font-mono font-bold px-1 rounded-full">
                {pages.length}
              </span>
            </div>
            <span className="text-[10px] tracking-tight">Halaman</span>
            {activeTab === 'pages' && (
              <span className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-1 h-3.5 bg-indigo-500 rounded-l-full"></span>
            )}
          </button>
        </div>

        {/* Rail Bottom Action: Add Page Shortcut */}
        <div className="w-full px-2 flex flex-col items-center gap-1">
          <button
            onClick={() => onAddPage('custom')}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shadow-sm"
            title="+ Tambah Halaman Baru"
          >
            <Plus size={16} />
          </button>
        </div>
      </aside>

      {/* 2. COLLAPSIBLE FLYOUT DRAWER (288px) */}
      {activeTab && (
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-lg z-10 transition-all duration-200">
          {/* Drawer Header */}
          <div className="px-3.5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-200">
                {activeTab === 'elements' && 'Pustaka Elemen Kanvas'}
                {activeTab === 'borders' && 'Bingkai Lembar Halaman'}
                {activeTab === 'pages' && `Sekuens Buku (${pages.length} Hlm)`}
              </span>
            </div>
            <button
              onClick={() => setActiveTab(null)}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition"
              title="Tutup Panel"
            >
              <X size={14} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* ================= SECTION 1: ELEMEN (PUZZLES, TEKS, CLIPART) ================= */}
            {activeTab === 'elements' && (
              <div className="space-y-4">
                {/* 1. PUZZLES */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      1. Teka-Teki (Puzzles)
                    </span>
                    <span className="text-[9px] text-indigo-400 font-medium">Klik / Drag ke Kanvas</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Maze */}
                    <div
                      draggable={true}
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({
                            type: 'puzzle',
                            subType: 'labirin',
                            label: 'Labirin (Maze)',
                            defaultWidth: 260,
                            defaultHeight: 260,
                          })
                        );
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => handleInsertPuzzle('labirin', 'Labirin')}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800/40 hover:border-indigo-500/80 transition cursor-grab active:cursor-grabbing flex flex-col justify-between group"
                      title="Klik untuk menambahkan atau drag ke posisi kanvas"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">🧩</span>
                        <GripVertical size={12} className="text-slate-500 group-hover:text-indigo-400 opacity-60 group-hover:opacity-100" />
                      </div>
                      <div className="mt-1.5">
                        <div className="text-xs font-medium text-slate-200">Labirin</div>
                        <div className="text-[9px] text-slate-400">Vektor Maze</div>
                      </div>
                    </div>

                    {/* Sudoku */}
                    <div
                      draggable={true}
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({
                            type: 'puzzle',
                            subType: 'sudoku',
                            label: 'Sudoku Grid 9x9',
                            defaultWidth: 240,
                            defaultHeight: 240,
                          })
                        );
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => handleInsertPuzzle('sudoku', 'Sudoku')}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800/40 hover:border-indigo-500/80 transition cursor-grab active:cursor-grabbing flex flex-col justify-between group"
                      title="Klik untuk menambahkan atau drag ke posisi kanvas"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">🔢</span>
                        <GripVertical size={12} className="text-slate-500 group-hover:text-indigo-400 opacity-60 group-hover:opacity-100" />
                      </div>
                      <div className="mt-1.5">
                        <div className="text-xs font-medium text-slate-200">Sudoku</div>
                        <div className="text-[9px] text-slate-400">Grid 9x9</div>
                      </div>
                    </div>

                    {/* Word Search */}
                    <div
                      draggable={true}
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({
                            type: 'puzzle',
                            subType: 'word-search',
                            label: 'Word Search',
                            defaultWidth: 240,
                            defaultHeight: 240,
                          })
                        );
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => handleInsertPuzzle('word-search', 'Word Search')}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800/40 hover:border-indigo-500/80 transition cursor-grab active:cursor-grabbing flex flex-col justify-between group"
                      title="Klik untuk menambahkan atau drag ke posisi kanvas"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">🔍</span>
                        <GripVertical size={12} className="text-slate-500 group-hover:text-indigo-400 opacity-60 group-hover:opacity-100" />
                      </div>
                      <div className="mt-1.5">
                        <div className="text-xs font-medium text-slate-200">Word Search</div>
                        <div className="text-[9px] text-slate-400">Pencarian Kata</div>
                      </div>
                    </div>

                    {/* Worksheet */}
                    <div
                      draggable={true}
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({
                            type: 'puzzle',
                            subType: 'worksheet',
                            label: 'Worksheet Edukasi',
                            defaultWidth: 260,
                            defaultHeight: 180,
                          })
                        );
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => handleInsertPuzzle('worksheet', 'Worksheet')}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800/40 hover:border-indigo-500/80 transition cursor-grab active:cursor-grabbing flex flex-col justify-between group"
                      title="Klik untuk menambahkan atau drag ke posisi kanvas"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">📝</span>
                        <GripVertical size={12} className="text-slate-500 group-hover:text-indigo-400 opacity-60 group-hover:opacity-100" />
                      </div>
                      <div className="mt-1.5">
                        <div className="text-xs font-medium text-slate-200">Worksheet</div>
                        <div className="text-[9px] text-slate-400">Soal Latihan</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. KONTEN & TEKS */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      2. Tipografi & Teks
                    </span>
                    <span className="text-[9px] text-indigo-400 font-medium">Klik / Drag Teks</span>
                  </div>

                  <div className="space-y-1.5">
                    <div
                      draggable={true}
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({
                            type: 'text',
                            content: 'JUDUL HALAMAN BARU',
                            fontSize: 22,
                            color: '#0f172a',
                            textAlign: 'center',
                            defaultWidth: 260,
                            defaultHeight: 44,
                          })
                        );
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => handleInsertText('JUDUL HALAMAN BARU', 22, false)}
                      className="w-full p-2 bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800 hover:border-indigo-500/70 rounded-lg text-left flex items-center justify-between transition cursor-grab active:cursor-grabbing group"
                      title="Klik untuk menambahkan atau drag ke kanvas"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-amber-400 text-sm">✍️</span>
                        <div>
                          <div className="text-xs font-medium text-slate-200">Judul Halaman</div>
                          <div className="text-[9px] text-slate-400">Teks heading utama</div>
                        </div>
                      </div>
                      <GripVertical size={14} className="text-slate-500 group-hover:text-indigo-400" />
                    </div>

                    <div
                      draggable={true}
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({
                            type: 'text',
                            content: 'Instruksi: Cari jalan keluar dan selesaikan tantangan dengan teliti!',
                            fontSize: 13,
                            color: '#475569',
                            textAlign: 'center',
                            defaultWidth: 260,
                            defaultHeight: 36,
                          })
                        );
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => handleInsertText('Instruksi: Cari jalan keluar dan selesaikan tantangan dengan teliti!', 13, true)}
                      className="w-full p-2 bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800 hover:border-indigo-500/70 rounded-lg text-left flex items-center justify-between transition cursor-grab active:cursor-grabbing group"
                      title="Klik untuk menambahkan atau drag ke kanvas"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-indigo-400 text-sm">💬</span>
                        <div>
                          <div className="text-xs font-medium text-slate-200">Instruksi & Catatan</div>
                          <div className="text-[9px] text-slate-400">Sub-heading atau keterangan</div>
                        </div>
                      </div>
                      <GripVertical size={14} className="text-slate-500 group-hover:text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* 3. GRAFIS & CLIPART */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      3. Clipart & Maskot
                    </span>
                    <span className="text-[9px] text-indigo-400 font-medium">Klik / Drag Stiker</span>
                  </div>

                  <div className="space-y-2.5">
                    {ASSET_CATEGORIES.slice(0, 3).map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="text-[9px] font-semibold text-slate-400 uppercase">
                          {cat.name}
                        </div>
                        <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                          {cat.items.slice(0, 5).map((item) => (
                            <button
                              key={item.id}
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.setData(
                                  'application/json',
                                  JSON.stringify({
                                    type: 'image',
                                    content: item.emoji || '⭐',
                                    defaultWidth: 100,
                                    defaultHeight: 100,
                                  })
                                );
                                e.dataTransfer.effectAllowed = 'copy';
                              }}
                              onClick={() => onApplyClipartToPage?.(item.emoji || '⭐')}
                              className="p-1 text-center text-lg rounded hover:bg-slate-800 hover:scale-110 transition cursor-grab active:cursor-grabbing"
                              title={`Klik atau drag ${item.title}`}
                            >
                              {item.emoji || '⭐'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. BENTUK GEOMETRI (SHAPE - E2) */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      4. Bentuk Geometri (Shape)
                    </span>
                    <span className="text-[9px] text-indigo-400 font-medium">Vektor E2</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => handleInsertShape('rect', 'Persegi')}
                      className="p-1.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-lg text-center text-[11px] font-medium text-slate-200 transition cursor-pointer"
                    >
                      ⬛ Kotak
                    </button>
                    <button
                      onClick={() => handleInsertShape('ellipse', 'Elips')}
                      className="p-1.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-lg text-center text-[11px] font-medium text-slate-200 transition cursor-pointer"
                    >
                      ⭕ Elips
                    </button>
                    <button
                      onClick={() => handleInsertShape('line', 'Garis')}
                      className="p-1.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-lg text-center text-[11px] font-medium text-slate-200 transition cursor-pointer"
                    >
                      📏 Garis
                    </button>
                  </div>
                </div>

                {/* 5. UNGGAH GAMBAR LOKAL (IMAGE UPLOAD - E3) */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      5. Unggah Gambar (E3)
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">PNG/JPG (Maks 5MB)</span>
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleSidebarImageUpload}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer cursor-pointer bg-slate-950 p-2 rounded-lg border border-slate-800"
                  />
                </div>
              </div>
            )}

            {/* ================= SECTION 2: BINGKAI LEMBAR HALAMAN ================= */}
            {activeTab === 'borders' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-200">
                    Gaya Garis Tepi (Border)
                  </span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Terapkan bingkai dekoratif untuk lembar halaman yang sedang aktif.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {([
                    { id: 'none', label: 'Tanpa Bingkai', desc: 'Lembar polos' },
                    { id: 'simple', label: 'Garis Tunggal', desc: 'Garis 1px rapi' },
                    { id: 'rounded', label: 'Sudut Melengkung', desc: 'Sudut membulat' },
                    { id: 'double', label: 'Garis Ganda', desc: 'Garis dobel klasik' },
                    { id: 'dots', label: 'Titik-Titik', desc: 'Garis putus artistik' },
                  ] as const).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => onApplyBorderStyle?.(b.id)}
                      className={`p-2.5 rounded-lg text-left transition cursor-pointer border ${
                        currentPage.borderStyle === b.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{b.label}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{b.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ================= SECTION 3: BOOK PAGES NAVIGATOR ================= */}
            {activeTab === 'pages' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    Total: <strong className="text-white">{pages.length}</strong> Hlm
                  </span>
                  <div className="flex items-center gap-1.5">
                    {onOpenBookStructure && (
                      <button
                        onClick={onOpenBookStructure}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-medium transition flex items-center gap-1 cursor-pointer border border-slate-700/60 shadow-2xs"
                        title="Buka Tampilan Struktur & Sekuens Buku Makro (Grid Spreads)"
                      >
                        <Layers size={11} className="text-indigo-400" />
                        <span>Struktur</span>
                      </button>
                    )}
                    <button
                      onClick={() => onAddPage('custom')}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-medium transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Tambah Halaman Baru"
                    >
                      <Plus size={11} /> + Hlm
                    </button>
                  </div>
                </div>

                {/* Page Thumbnails List */}
                <div className="space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                  {/* CANONICAL ENTRY POINT: KDP FULL-WRAP COVER SPREAD */}
                  {onOpenCover && (
                    <div
                      onClick={onOpenCover}
                      className="p-2.5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 hover:border-indigo-400/60 hover:from-indigo-900/60 hover:to-purple-900/50 transition cursor-pointer group shadow-sm flex items-center justify-between"
                      title="Desainer Sampul KDP Full-Wrap (Front Cover + Spine + Back Cover)"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs text-indigo-300 group-hover:scale-105 transition-transform shrink-0">
                          🎨
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-[11px] font-bold text-slate-100 flex items-center gap-1.5 truncate">
                            <span>Sampul KDP</span>
                            <span className="text-[8px] bg-indigo-500/20 text-indigo-300 font-mono px-1 py-0.2 rounded border border-indigo-500/30">
                              Full-Wrap
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">
                            Front • Spine Otomatis • Back
                          </div>
                        </div>
                      </div>
                      <div className="text-indigo-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition shrink-0 text-xs font-mono">
                        →
                      </div>
                    </div>
                  )}

                  {/* Divider Pemisah Cover dan Interior */}
                  <div className="flex items-center gap-2 pt-1 pb-0.5">
                    <div className="h-px bg-slate-800 flex-1" />
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                      Interior Halaman
                    </span>
                    <div className="h-px bg-slate-800 flex-1" />
                  </div>
                  {pages.map((p, idx) => {
                    const isActive = idx === activePageIndex;
                    return (
                      <div
                        key={p.id || idx}
                        onClick={() => onSelectPage(idx)}
                        className={`p-2 rounded-lg border transition flex items-center justify-between cursor-pointer group ${
                          isActive
                            ? 'bg-indigo-950/40 border-indigo-500 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {/* Mini page number badge */}
                          <div
                            className={`min-w-5 h-5 px-1 rounded flex items-center justify-center text-[10px] font-mono font-medium shrink-0 ${
                              isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                            title={p.displayPageNumber ? `Nomor Cetak: ${p.displayPageNumber}` : undefined}
                          >
                            {p.displayPageNumber ? p.displayPageNumber.replace(/-/g, '').trim() : idx + 1}
                          </div>

                          <div className="overflow-hidden">
                            <div className="text-[11px] font-medium truncate flex items-center gap-1">
                              <span>
                                {p.puzzleType === 'maze' && '🧩'}
                                {p.puzzleType === 'sudoku' && '🔢'}
                                {p.puzzleType === 'wordsearch' && '🔍'}
                                {p.puzzleType === 'worksheet' && '📝'}
                              </span>
                              <span className="truncate">{p.title || `Halaman ${idx + 1}`}</span>
                            </div>
                            <div className="text-[9px] text-slate-500 capitalize">
                              {p.puzzleType} • Level {p.difficulty}
                            </div>
                          </div>
                        </div>

                        {/* Page action buttons (hover) */}
                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicatePage(idx);
                            }}
                            className="p-1 hover:text-indigo-400 rounded hover:bg-slate-800"
                            title="Duplikasi"
                          >
                            <Copy size={11} />
                          </button>
                          {pages.length > 1 && (
                            <button
                              onClick={(e) => {
                              e.stopPropagation();
                              onDeletePage(idx);
                            }}
                            className="p-1 hover:text-rose-400 rounded hover:bg-slate-800"
                            title="Hapus"
                          >
                            <Trash2 size={11} />
                          </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
