import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CanvasElement, BookPage } from '../types';
import { 
  Lock, 
  Unlock, 
  Copy, 
  Trash2, 
  MoreHorizontal, 
  Ungroup,
  Layers,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RefreshCw,
  FlipHorizontal
} from 'lucide-react';

export interface FloatingToolbarProps {
  activeElement: CanvasElement | null;
  allElements: CanvasElement[];
  zoomLevel: number;
  baseWidthPx: number;
  baseHeightPx: number;
  page?: BookPage;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onUngroup: (groupId: string) => void;
  onGroup?: (id: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onDuplicateGroup: (groupId: string) => void;
  onRegeneratePuzzle?: () => void;
  onUpdateMazeConfig?: (update: Partial<any>) => void;
  onReorderElement?: (id: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  activeElement,
  allElements,
  zoomLevel,
  baseWidthPx,
  page,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onUngroup,
  onGroup,
  onDeleteGroup,
  onDuplicateGroup,
  onRegeneratePuzzle,
  onUpdateMazeConfig,
  onReorderElement,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [toolbarStyle, setToolbarStyle] = React.useState<React.CSSProperties>({
    position: 'absolute',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 60,
  });

  React.useLayoutEffect(() => {
    if (!activeElement) return;
    let rafId: number;

    const updateToolbarPosition = () => {
      rafId = requestAnimationFrame(() => {
        const elDOM = document.querySelector(`[data-element-id="${activeElement.id}"]`);
        const workspaceDOM = document.querySelector('main');
        const toolbarDOM = toolbarRef.current;

        if (elDOM && workspaceDOM && toolbarDOM) {
          const elementRect = elDOM.getBoundingClientRect();
          const workspaceRect = workspaceDOM.getBoundingClientRect();
          const toolbarRect = toolbarDOM.getBoundingClientRect();

          const relativeLeft = elementRect.left - workspaceRect.left;
          const relativeTop = elementRect.top - workspaceRect.top;

          const targetX = relativeLeft + (elementRect.width / 2) - (toolbarRect.width / 2);
          const targetY = 16; // Sticky top docked like Canva.com (stable vertical position)

          setToolbarStyle({
            position: 'absolute',
            left: `${Math.max(16, targetX)}px`,
            top: `${targetY}px`,
            zIndex: 60,
          });
        }
      });
    };

    updateToolbarPosition();
    window.addEventListener('resize', updateToolbarPosition);

    const workspaceDOM = document.querySelector('main');
    let resizeObserver: ResizeObserver | null = null;
    if (workspaceDOM && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateToolbarPosition();
      });
      resizeObserver.observe(workspaceDOM);
    }

    const elDOM = document.querySelector(`[data-element-id="${activeElement.id}"]`);
    let elResizeObserver: ResizeObserver | null = null;
    if (elDOM && typeof ResizeObserver !== 'undefined') {
      elResizeObserver = new ResizeObserver(() => {
        updateToolbarPosition();
      });
      elResizeObserver.observe(elDOM);
    }

    // Fallbacks during sidebar transition animations
    const t1 = setTimeout(updateToolbarPosition, 50);
    const t2 = setTimeout(updateToolbarPosition, 150);
    const t3 = setTimeout(updateToolbarPosition, 300);

    return () => {
      window.removeEventListener('resize', updateToolbarPosition);
      if (resizeObserver) resizeObserver.disconnect();
      if (elResizeObserver) elResizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [activeElement?.id, zoomLevel]);

  if (!activeElement) return null;

  const isGroup = activeElement.type === 'group';
  const isText = activeElement.type === 'text';
  const isImage = activeElement.type === 'image';
  const isPuzzle = activeElement.type === 'puzzle';
  const isMaze = isPuzzle && (activeElement.subType === 'labirin' || !activeElement.subType);
  const isVisual = isImage || isPuzzle;

  // Universal actions
  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateElement(activeElement.id, { isLocked: !activeElement.isLocked });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGroup) {
      onDuplicateGroup(activeElement.id);
    } else {
      onDuplicateElement(activeElement.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGroup) {
      onDeleteGroup(activeElement.id);
    } else {
      onDeleteElement(activeElement.id);
    }
  };

  const handleUngroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUngroup(activeElement.id);
    setShowMoreMenu(false);
  };

  return (
    <motion.div
      ref={toolbarRef}
      key="floating-toolbar"
      initial={{ opacity: 0, scale: 0.94, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      style={toolbarStyle}
      className="flex items-center bg-white text-slate-800 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.22)] border border-slate-200 p-1 select-none pointer-events-auto max-w-[94vw] overflow-x-auto no-scrollbar gap-1 w-max"
      onClick={(e) => e.stopPropagation()}
    >
        {/* ========================================================================= */}
        {/* BAGIAN 1: KONTROL KONTEKSTUAL BERDASARKAN TIPE ELEMEN (PATCH 1 ISOLASI)    */}
        {/* ========================================================================= */}

        {/* 1A. SAAT TEKS AKTIF (Canva Sans, Stepper, Color, B, I, U, Align) */}
        {isText && (
          <div className="flex items-center gap-1 shrink-0">
            {/* Font Family Selector */}
            <div className="flex items-center bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2 h-7.5 border border-slate-200 text-xs font-medium text-slate-800 cursor-pointer">
              <select
                value={activeElement.fontFamily || page?.textElement?.fontFamily || 'sans'}
                onChange={(e) => {
                  const val = e.target.value as any;
                  onUpdateElement(activeElement.id, { fontFamily: val });
                }}
                className="bg-transparent border-none outline-none cursor-pointer pr-0.5 text-xs font-semibold"
              >
                <option value="sans">Canva Sans</option>
                <option value="serif">Serif Classic</option>
                <option value="comic">Comic Playful</option>
                <option value="mono">Monospace</option>
              </select>
            </div>

            {/* Font Size Stepper [- 25.5 +] */}
            <div className="flex items-center bg-slate-100 rounded-lg h-7.5 border border-slate-200 px-0.5">
              <button
                type="button"
                onClick={() => {
                  const cur = activeElement.fontSize || 18;
                  onUpdateElement(activeElement.id, { fontSize: Math.max(10, cur - 1) });
                }}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="Kecilkan Font"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-xs font-mono font-bold text-slate-800">
                {activeElement.fontSize || 18}
              </span>
              <button
                type="button"
                onClick={() => {
                  const cur = activeElement.fontSize || 18;
                  onUpdateElement(activeElement.id, { fontSize: Math.min(72, cur + 1) });
                }}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="Besarkan Font"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Text Color (A dengan indikator warna) */}
            <label 
              className="flex flex-col items-center justify-center w-7.5 h-7.5 rounded-lg hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200 relative"
              title="Warna Teks"
            >
              <span className="text-xs font-black leading-none">A</span>
              <span 
                className="w-3.5 h-1 rounded-full mt-0.5" 
                style={{ backgroundColor: activeElement.color || '#0f172a' }}
              />
              <input
                type="color"
                value={activeElement.color || '#0f172a'}
                onChange={(e) => onUpdateElement(activeElement.id, { color: e.target.value })}
                className="sr-only"
              />
            </label>

            {/* Bold (B) */}
            <button
              type="button"
              onClick={() => {
                const nextWeight = activeElement.fontWeight === 'bold' ? 'normal' : 'bold';
                onUpdateElement(activeElement.id, { fontWeight: nextWeight });
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition ${
                activeElement.fontWeight === 'bold'
                  ? 'bg-indigo-600 text-white font-black shadow-xs'
                  : 'hover:bg-slate-100 text-slate-800 font-bold'
              }`}
              title="Tebal (Bold)"
            >
              <Bold size={13} />
            </button>

            {/* Italic (I) */}
            <button
              type="button"
              onClick={() => {
                const nextStyle = activeElement.fontStyle === 'italic' ? 'normal' : 'italic';
                onUpdateElement(activeElement.id, { fontStyle: nextStyle });
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition ${
                activeElement.fontStyle === 'italic'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 text-slate-800 italic'
              }`}
              title="Miring (Italic)"
            >
              <Italic size={13} />
            </button>

            {/* Underline (U) */}
            <button
              type="button"
              onClick={() => {
                const nextDeco = activeElement.textDecoration === 'underline' ? 'none' : 'underline';
                onUpdateElement(activeElement.id, { textDecoration: nextDeco });
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition ${
                activeElement.textDecoration === 'underline'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
              title="Garis Bawah (Underline)"
            >
              <Underline size={13} />
            </button>

            {/* Alignment Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => onUpdateElement(activeElement.id, { textAlign: 'left' })}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer ${
                  activeElement.textAlign === 'left'
                    ? 'bg-white shadow-xs text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Rata Kiri"
              >
                <AlignLeft size={12} />
              </button>
              <button
                type="button"
                onClick={() => onUpdateElement(activeElement.id, { textAlign: 'center' })}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer ${
                  !activeElement.textAlign || activeElement.textAlign === 'center'
                    ? 'bg-white shadow-xs text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Rata Tengah"
              >
                <AlignCenter size={12} />
              </button>
              <button
                type="button"
                onClick={() => onUpdateElement(activeElement.id, { textAlign: 'right' })}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer ${
                  activeElement.textAlign === 'right'
                    ? 'bg-white shadow-xs text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Rata Kanan"
              >
                <AlignRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* 1B. SAAT GAMBAR ATAU PUZZLE AKTIF (F-02 & F-03 & K-1) */}
        {isVisual && (
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Tombol Regenerasi Engine (Khusus elemen puzzle) */}
            {isPuzzle && onRegeneratePuzzle && (
              <button
                type="button"
                onClick={onRegeneratePuzzle}
                className="px-2.5 h-7.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition flex items-center gap-1 cursor-pointer border border-slate-200"
                title="Acak / Buat ulang"
              >
                <RefreshCw size={12} className="text-indigo-600" />
                <span>Acak</span>
              </button>
            )}

            {/* Warna Dinding & Ketebalan Dinding (Hanya untuk puzzle labirin, isolasi F-02) */}
            {isMaze && (
              <>
                {/* Warna Dinding Swatch (●) */}
                <label 
                  className="flex items-center justify-center w-7.5 h-7.5 rounded-lg hover:bg-slate-100 cursor-pointer border border-slate-200 relative"
                  title="Warna Dinding Labirin"
                >
                  <span 
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-xs" 
                    style={{ backgroundColor: activeElement?.mazeConfig?.wallColor || page?.mazeConfig?.wallColor || '#0f172a' }}
                  />
                  <input
                    type="color"
                    value={activeElement?.mazeConfig?.wallColor || page?.mazeConfig?.wallColor || '#0f172a'}
                    onChange={(e) => {
                      const val = e.target.value;
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
                      if (activeElement) {
                        onUpdateElement(activeElement.id, {
                          mazeConfig: { ...(activeElement.mazeConfig || page?.mazeConfig || defaultMaze), wallColor: val }
                        });
                      } else {
                        onUpdateMazeConfig?.({ wallColor: val });
                      }
                    }}
                    className="sr-only"
                  />
                </label>

                {/* Ketebalan Dinding (☰) */}
                <div className="flex items-center bg-slate-100 rounded-lg h-7.5 border border-slate-200 px-1.5 gap-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500">Dinding:</span>
                  <select
                    value={activeElement?.mazeConfig?.wallThickness || page?.mazeConfig?.wallThickness || 2}
                    onChange={(e) => {
                      const val = Number(e.target.value);
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
                      if (activeElement) {
                        onUpdateElement(activeElement.id, {
                          mazeConfig: { ...(activeElement.mazeConfig || page?.mazeConfig || defaultMaze), wallThickness: val }
                        });
                      } else {
                        onUpdateMazeConfig?.({ wallThickness: val });
                      }
                    }}
                    className="bg-transparent border-none outline-none cursor-pointer font-bold text-xs"
                  >
                    <option value={1}>1px</option>
                    <option value={2}>2px</option>
                    <option value={3}>3px</option>
                    <option value={4}>4px</option>
                  </select>
                </div>
              </>
            )}

            {/* Flip Horizontal (Khusus Image, disembunyikan dari puzzle, isolasi F-03) */}
            {isImage && (
              <button
                type="button"
                onClick={() => {
                  onUpdateElement(activeElement.id, {
                    flipHorizontal: !activeElement.flipHorizontal,
                  });
                }}
                className="px-2 h-7.5 rounded-lg hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1 cursor-pointer border border-slate-200"
                title="Cermin Horizontal (Flip)"
              >
                <FlipHorizontal size={13} />
                <span>Flip</span>
              </button>
            )}

            {/* Opacity Transparansi (Khusus Image sesuai K-1: disembunyikan dari seluruh puzzle) */}
            {isImage && (
              <button
                type="button"
                onClick={() => {
                  const cur = activeElement.opacity ?? 1;
                  const next = cur <= 0.3 ? 1 : Math.round((cur - 0.25) * 100) / 100;
                  onUpdateElement(activeElement.id, { opacity: next });
                }}
                className="px-2 h-7.5 rounded-lg hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1 cursor-pointer border border-slate-200"
                title="Transparansi Objek"
              >
                <span className="font-mono text-[11px]">🏁 {Math.round((activeElement.opacity ?? 1) * 100)}%</span>
              </button>
            )}
          </div>
        )}

        {/* 1C. SAAT GRUP AKTIF (Tombol Group/Ungroup) */}
        {isGroup && (
          <div className="flex items-center gap-1.5 shrink-0 px-1">
            <button
              type="button"
              onClick={handleUngroup}
              className="px-2.5 h-7.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-semibold text-indigo-700 transition flex items-center gap-1.5 cursor-pointer border border-indigo-200 shadow-xs"
              title="Pisahkan Grup (Ungroup)"
            >
              <Ungroup size={13} className="text-indigo-600" />
              <span>Pisahkan ({activeElement.childrenIds?.length || 0})</span>
            </button>
          </div>
        )}

        {/* 1D. SAAT ELEMEN BUKAN GRUP (Tombol Grup) */}
        {!isGroup && onGroup && (
          <div className="flex items-center gap-1.5 shrink-0 px-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGroup(activeElement.id);
              }}
              className="px-2.5 h-7.5 bg-slate-100 hover:bg-indigo-50 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-700 transition flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-xs"
              title="Gabungkan ke Grup (Group)"
            >
              <Layers size={13} className="text-indigo-600" />
              <span>Grup</span>
            </button>
          </div>
        )}

        {/* PEMBATAS ANTARA KONTROL KONTEKSTUAL & KAPSUL UNIVERSAL */}
        <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

        {/* ========================================================================= */}
        {/* BAGIAN 2: KAPSUL UNIVERSAL TETAP (LOCK, DUPLICATE, DELETE, MORE) */}
        {/* Identik di atas setiap elemen */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* LOCK / UNLOCK */}
          <button
            type="button"
            onClick={handleToggleLock}
            className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              activeElement.isLocked
                ? 'bg-amber-100 text-amber-700'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title={activeElement.isLocked ? 'Buka kunci' : 'Kunci elemen'}
          >
            {activeElement.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>

          {/* DUPLICATE */}
          <button
            type="button"
            onClick={handleDuplicate}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Duplikat"
          >
            <Copy size={14} />
          </button>

          {/* DELETE */}
          <button
            type="button"
            onClick={handleDelete}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>

          {/* MORE (•••) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreMenu(!showMoreMenu);
            }}
            className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              showMoreMenu ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Opsi lainnya"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* POPUP SUBMENU MORE */}
        {showMoreMenu && (
          <div 
            className="absolute top-full right-0 mt-1.5 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-xs text-slate-700 z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {isGroup && (
              <button
                type="button"
                onClick={handleUngroup}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 text-slate-800 cursor-pointer font-medium"
              >
                <Ungroup size={13} className="text-amber-600" />
                <span>Pisahkan (Ungroup)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onReorderElement?.(activeElement.id, 'front');
                setShowMoreMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 text-slate-800 cursor-pointer"
            >
              <ArrowUp size={13} className="text-indigo-600" />
              <span>Bawa ke Paling Depan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onReorderElement?.(activeElement.id, 'forward');
                setShowMoreMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 text-slate-800 cursor-pointer"
            >
              <ArrowUp size={13} className="text-slate-400" />
              <span>Maju Selangkah</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onReorderElement?.(activeElement.id, 'backward');
                setShowMoreMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 text-slate-800 cursor-pointer"
            >
              <ArrowDown size={13} className="text-slate-400" />
              <span>Mundur Selangkah</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onReorderElement?.(activeElement.id, 'back');
                setShowMoreMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 text-slate-800 cursor-pointer"
            >
              <ArrowDown size={13} className="text-indigo-600" />
              <span>Kirim ke Paling Belakang</span>
            </button>
          </div>
        )}
      </motion.div>
  );
};
