import React, { useState, useRef, useEffect } from 'react';
import { BookPage, ProjectMetadata, PageSize, CanvasElement } from '../types';
import { BoundingBox } from './BoundingBox';
import { FloatingToolbar } from './FloatingToolbar';
import { PAGE_SPECS } from '../utils/kdpCalculator';
import { generateMaze } from '../utils/mazeGenerator';
import { 
  Eye, 
  Maximize2, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  SlidersHorizontal,
  Dices,
  Check,
  ShieldCheck,
  Bold,
  Italic,
  Underline,
  FlipHorizontal,
  Minus,
  Plus,
  Palette,
  ArrowUpDown,
  Move
} from 'lucide-react';

interface CanvasWorkspaceProps {
  page: BookPage;
  metadata: ProjectMetadata;
  activePageIndex: number;
  totalPages: number;
  zoomLevel: number;
  setZoomLevel?: (fn: (prev: number) => number) => void;
  selectedElement: 'maze' | 'wordsearch' | 'sudoku' | 'worksheet' | 'text' | 'assets' | 'page';
  onSelectContext: (element: 'maze' | 'wordsearch' | 'sudoku' | 'worksheet' | 'text' | 'assets' | 'page') => void;
  onUpdatePageTitle: (title: string) => void;
  onUpdatePageInstructions: (text: string) => void;
  onUpdatePageFooter: (text: string) => void;
  onNavigatePage: (newIndex: number) => void;
  onOpenPrepressSetup?: () => void;
  onOpenPageSetup?: () => void;
  // Canvas Elements & Hierarchy State (Tahap 1 & 2)
  elements?: CanvasElement[];
  selectedId?: string | null;
  selectedIds?: string[];
  onSelectId?: (id: string | null) => void;
  onSelectIds?: (ids: string[]) => void;
  onUpdateElements?: (updater: (prev: CanvasElement[]) => CanvasElement[]) => void;
  // Contextual toolbar actions
  onUpdateMazeConfig?: (update: Partial<any>) => void;
  onUpdateWordSearchConfig?: (update: Partial<any>) => void;
  onUpdateSudokuConfig?: (update: Partial<any>) => void;
  onUpdateWorksheetConfig?: (update: Partial<any>) => void;
  onUpdateTextElement?: (update: Partial<any>) => void;
  onRegenerateMaze?: () => void;
  onRegenerateWordSearch?: () => void;
  onRegenerateSudoku?: () => void;
  onUpdateMetadata?: (update: Partial<ProjectMetadata>) => void;
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  page,
  metadata,
  activePageIndex,
  totalPages,
  zoomLevel,
  setZoomLevel,
  selectedElement,
  onSelectContext,
  onUpdatePageTitle,
  onUpdatePageInstructions,
  onUpdatePageFooter,
  onNavigatePage,
  onOpenPrepressSetup,
  onOpenPageSetup,
  elements,
  selectedId,
  selectedIds,
  onSelectId,
  onSelectIds,
  onUpdateElements,
  onUpdateMazeConfig,
  onUpdateWordSearchConfig,
  onUpdateSudokuConfig,
  onUpdateWorksheetConfig,
  onUpdateTextElement,
  onRegenerateMaze,
  onRegenerateWordSearch,
  onRegenerateSudoku,
  onUpdateMetadata,
  onDeleteElement,
  onDuplicateElement,
}) => {
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(true);
  const [grayscaleMode, setGrayscaleMode] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const spec = PAGE_SPECS[metadata?.targetKdpFormat] || PAGE_SPECS['Letter'];

  // Base dimension calculation: locked aspect ratio, zero distortion!
  const baseWidthPx = 430;
  const baseHeightPx = Math.round(baseWidthPx / spec.aspectRatio);
  const paperWidthPx = (baseWidthPx * zoomLevel) / 100;
  const paperHeightPx = paperWidthPx / spec.aspectRatio;

  // Fit to screen calculation without distortion
  const handleFitToScreen = () => {
    if (!containerRef.current || !setZoomLevel) return;
    const availableWidth = containerRef.current.clientWidth - 80;
    const availableHeight = containerRef.current.clientHeight - 80;
    
    // Calculate required width to fit in available height with aspect ratio
    const targetWidthFromHeight = availableHeight * spec.aspectRatio;
    const optimalWidth = Math.min(availableWidth, targetWidthFromHeight);
    
    const computedZoom = Math.round((optimalWidth / baseWidthPx) * 100);
    const clampedZoom = Math.max(45, Math.min(150, computedZoom));
    setZoomLevel(() => clampedZoom);
  };

  // Helper render for puzzle content in elements
  const renderPuzzlePreview = (subType?: string, element?: CanvasElement) => {
    const pType = subType === 'labirin' ? 'maze' : subType === 'word-search' ? 'wordsearch' : subType === 'sudoku' ? 'sudoku' : page.puzzleType;
    if (pType === 'maze') {
      const mazeCfg = element?.mazeConfig || page.mazeConfig;
      if (!mazeCfg) return null;
      const mazeDataInstance = generateMaze(mazeCfg);
      const mCols = mazeCfg.cols || 18;
      const mRows = mazeCfg.rows || 18;
      // Paritas F-01 & 7.2: Nilai efektif solusi labirin
      const elementShowSolution = Boolean(
        element?.mazeConfig?.showSolution ?? page.mazeConfig?.showSolution ?? false
      );
      return (
        <div className="w-full h-full relative flex items-center justify-center select-none">
          <svg
            viewBox={`0 0 ${mCols * 20} ${mRows * 20}`}
            className="w-full h-full max-w-full max-h-full aspect-square"
            style={{ stroke: mazeCfg.wallColor || '#0f172a' }}
          >
            {mazeDataInstance.cells.map((row, r) =>
              row.map((cell, c) => (
                <React.Fragment key={`${r}-${c}`}>
                  {cell.walls.top && (
                    <line x1={c * 20} y1={r * 20} x2={(c + 1) * 20} y2={r * 20} strokeWidth={mazeCfg.wallThickness || 2} strokeLinecap="round" />
                  )}
                  {cell.walls.left && (
                    <line x1={c * 20} y1={r * 20} x2={c * 20} y2={(r + 1) * 20} strokeWidth={mazeCfg.wallThickness || 2} strokeLinecap="round" />
                  )}
                  {cell.walls.right && (
                    <line x1={(c + 1) * 20} y1={r * 20} x2={(c + 1) * 20} y2={(r + 1) * 20} strokeWidth={mazeCfg.wallThickness || 2} strokeLinecap="round" />
                  )}
                  {cell.walls.bottom && (
                    <line x1={c * 20} y1={(r + 1) * 20} x2={(c + 1) * 20} y2={(r + 1) * 20} strokeWidth={mazeCfg.wallThickness || 2} strokeLinecap="round" />
                  )}
                </React.Fragment>
              ))
            )}
            {elementShowSolution && mazeDataInstance.solutionPath && (
              <polyline
                fill="none"
                stroke={mazeCfg.solutionColor || '#10b981'}
                strokeWidth={(mazeCfg.wallThickness || 2) * 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 2"
                points={mazeDataInstance.solutionPath.map(([r, c]) => `${c * 20 + 10},${r * 20 + 10}`).join(' ')}
              />
            )}
          </svg>
          <span className="absolute top-1 left-1 text-base z-20 drop-shadow">
            {mazeCfg.startIcon || '🧑‍🚀'}
          </span>
          <span className="absolute bottom-1 right-1 text-base z-20 drop-shadow">
            {mazeCfg.finishIcon || '🪐'}
          </span>
        </div>
      );
    }
    if (pType === 'wordsearch') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 select-none overflow-hidden">
          <div
            className="grid gap-0.5 bg-slate-50 p-1.5 rounded border border-slate-300 font-mono font-bold text-slate-800 text-[10px]"
            style={{
              gridTemplateColumns: `repeat(${page.wordSearchConfig?.gridSize || 12}, minmax(0, 1fr))`,
            }}
          >
            {(page.wordSearchGrid?.grid || Array(12).fill(Array(12).fill('A'))).map((row: string[], rIdx: number) =>
              row.map((letter: string, cIdx: number) => (
                <div key={`${rIdx}-${cIdx}`} className="w-4 h-4 flex items-center justify-center rounded text-[9px]">
                  {letter}
                </div>
              ))
            )}
          </div>
        </div>
      );
    }
    if (pType === 'sudoku') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 select-none">
          <div className="grid grid-cols-9 border-2 border-slate-900 bg-white shadow-xs">
            {(page.sudokuBoard?.puzzle || Array(9).fill(Array(9).fill(null))).map((row: (number | null)[], rIdx: number) =>
              row.map((val: number | null, cIdx: number) => {
                const borderBottom = (rIdx + 1) % 3 === 0 && rIdx !== 8 ? 'border-b-2 border-b-slate-900' : 'border-b border-b-slate-300';
                const borderRight = (cIdx + 1) % 3 === 0 && cIdx !== 8 ? 'border-r-2 border-r-slate-900' : 'border-r border-r-slate-300';
                return (
                  <div key={`${rIdx}-${cIdx}`} className={`w-5 h-5 flex items-center justify-center font-mono text-[10px] font-bold ${borderBottom} ${borderRight}`}>
                    {val !== null ? <span className="text-slate-900 font-extrabold">{val}</span> : <span className="text-transparent">-</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-2 bg-slate-50 rounded border border-dashed border-slate-300">
        <span className="text-xs font-semibold text-slate-600">Worksheet Matematika & Sains</span>
      </div>
    );
  };

  // =========================================================================
  // TAHAP 3: HIERARCHICAL & DEEP SELECTION LOGIC
  // =========================================================================
  const activeElement = elements?.find((el) => el.id === selectedId) || null;
  const targetMazeElement =
    (activeElement?.type === 'puzzle' && (activeElement.subType === 'labirin' || !activeElement.subType))
      ? activeElement
      : elements?.find((el) => el.type === 'puzzle' && (el.subType === 'labirin' || !el.subType));

  // Paritas F-01 & 7.2: Nilai efektif status solusi workspace
  const effectiveWorkspaceShowSolution = Boolean(
    targetMazeElement?.mazeConfig?.showSolution ?? page.mazeConfig?.showSolution ?? false
  );
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const handleSelectElement = (el: CanvasElement, e?: React.PointerEvent<HTMLDivElement>) => {
    const isShift = e?.shiftKey;
    if (isShift) {
      if (selectedIds?.includes(el.id)) {
        onSelectIds?.(selectedIds.filter((id) => id !== el.id));
      } else {
        onSelectIds?.([...(selectedIds || []), el.id]);
      }
      return;
    }

    if (el.parentId) {
      if (selectedId === el.id) {
        return;
      }

      if (selectedId === el.parentId) {
        onSelectIds?.([el.id]);
        onSelectId?.(el.id);
        if (el.type === 'text') {
          onSelectContext('text');
        } else if (el.type === 'puzzle') {
          if (el.subType === 'labirin') onSelectContext('maze');
          else if (el.subType === 'word-search') onSelectContext('wordsearch');
          else if (el.subType === 'sudoku') onSelectContext('sudoku');
          else onSelectContext('worksheet');
        }
      } else {
        onSelectIds?.([el.parentId]);
        onSelectId?.(el.parentId);
        onSelectContext('page');
      }
    } else {
      onSelectIds?.([el.id]);
      onSelectId?.(el.id);
      if (el.type === 'text') {
        onSelectContext('text');
      } else if (el.type === 'puzzle') {
        if (el.subType === 'labirin') onSelectContext('maze');
        else if (el.subType === 'word-search') onSelectContext('wordsearch');
        else if (el.subType === 'sudoku') onSelectContext('sudoku');
        else onSelectContext('worksheet');
      } else if (el.type === 'group') {
        onSelectContext('page');
      }
    }
  };

  const handleDoubleClickElement = (el: CanvasElement) => {
    // Akses instan langsung ke sub-elemen individu saat double click
    onSelectId?.(el.id);
    if (el.type === 'text') {
      onSelectContext('text');
      setEditingTextId(el.id);
    }
  };

  // Group Management Handlers:
  const handleGroupElement = (elementId: string) => {
    if (!onUpdateElements || !elements) return;
    const target = elements.find((el) => el.id === elementId);
    if (!target || target.parentId) return;

    const others = elements.filter((el) => el.id !== elementId && !el.parentId && el.type !== 'group');
    if (others.length === 0) return;

    const neighbor = others[0];

    const minX = Math.min(target.x, neighbor.x);
    const minY = Math.min(target.y, neighbor.y);
    const maxX = Math.max(target.x + target.width, neighbor.x + neighbor.width);
    const maxY = Math.max(target.y + target.height, neighbor.y + neighbor.height);

    const groupId = `group-${Date.now()}`;
    const groupElement: CanvasElement = {
      id: groupId,
      type: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      childrenIds: [target.id, neighbor.id],
    };

    onUpdateElements((prev) => [
      groupElement,
      ...prev.map((el) =>
        el.id === target.id || el.id === neighbor.id ? { ...el, parentId: groupId } : el
      ),
    ]);
    onSelectId?.(groupId);
  };

  const handleUngroup = (groupId: string) => {
    if (!onUpdateElements || !elements) return;
    onUpdateElements((prev) => {
      const group = prev.find((el) => el.id === groupId);
      if (!group) return prev;
      return prev
        .filter((el) => el.id !== groupId)
        .map((el) => (el.parentId === groupId ? { ...el, parentId: undefined } : el));
    });
    const group = elements.find((el) => el.id === groupId);
    const firstChildId =
      group?.childrenIds?.[0] || elements.find((el) => el.parentId === groupId)?.id;
    onSelectId?.(firstChildId || null);
    if (firstChildId) onSelectContext('text');
  };

  const handleDeleteGroup = (groupId: string) => {
    if (!onUpdateElements) return;
    onUpdateElements((prev) =>
      prev.filter((el) => el.id !== groupId && el.parentId !== groupId)
    );
    onSelectId?.(null);
    onSelectContext('page');
  };

  const handleDuplicateGroup = (groupId: string) => {
    if (!onUpdateElements || !elements) return;
    const group = elements.find((el) => el.id === groupId);
    if (!group) return;

    const newGroupId = `group-${Date.now()}`;
    const children = elements.filter(
      (el) => el.parentId === groupId || group.childrenIds?.includes(el.id)
    );

    const clonedChildren: CanvasElement[] = children.map((child, idx) => ({
      ...child,
      id: `el-${Date.now()}-${idx}`,
      parentId: newGroupId,
      x: child.x + 20,
      y: child.y + 20,
    }));

    const clonedGroup: CanvasElement = {
      ...group,
      id: newGroupId,
      x: group.x + 20,
      y: group.y + 20,
      childrenIds: clonedChildren.map((c) => c.id),
    };

    onUpdateElements((prev) => [...prev, clonedGroup, ...clonedChildren]);
    onSelectId?.(newGroupId);
  };

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    if (!onUpdateElements) return;
    onUpdateElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
    if (id === 'el-title' && updates.content !== undefined) {
      onUpdatePageTitle(updates.content);
    }
    if (id === 'el-inst-text' && updates.content !== undefined) {
      onUpdatePageInstructions?.(updates.content);
    }
  };

  // Paritas F-01 & 7.2: Handler kanonikal toggle solusi workspace
  const handleToggleWorkspaceSolution = () => {
    const nextVal = !effectiveWorkspaceShowSolution;
    if (targetMazeElement) {
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
      const nextCfg = {
        ...(targetMazeElement.mazeConfig || page.mazeConfig || defaultMaze),
        showSolution: nextVal,
      };
      handleUpdateElement(targetMazeElement.id, { mazeConfig: nextCfg });
    } else if (onUpdateMazeConfig) {
      onUpdateMazeConfig({ showSolution: nextVal });
    }
  };

  const handleDeleteElement = (id: string) => {
    onDeleteElement?.(id);
    onSelectId?.(null);
    onSelectContext('page');
  };

  const handleDuplicateElement = (id: string) => {
    onDuplicateElement?.(id);
  };

  const handleRegeneratePuzzle = () => {
    if (!activeElement) return;
    if (activeElement.subType === 'labirin') onRegenerateMaze?.();
    else if (activeElement.subType === 'word-search') onRegenerateWordSearch?.();
    else if (activeElement.subType === 'sudoku') onRegenerateSudoku?.();
    else onRegenerateMaze?.();
  };

  const handleReorderElement = (id: string, direction: 'front' | 'back' | 'forward' | 'backward') => {
    if (!onUpdateElements || !elements) return;
    onUpdateElements((prev) => {
      const idx = prev.findIndex((el) => el.id === id);
      if (idx === -1) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      if (direction === 'front') {
        copy.push(item);
      } else if (direction === 'back') {
        copy.unshift(item);
      } else if (direction === 'forward') {
        const targetIdx = Math.min(prev.length - 1, idx + 1);
        copy.splice(targetIdx, 0, item);
      } else if (direction === 'backward') {
        const targetIdx = Math.max(0, idx - 1);
        copy.splice(targetIdx, 0, item);
      }
      return copy;
    });
  };

  // =========================================================================
  // TAHAP 5: SIDEBAR HTML5 DRAG & DROP LOGIC
  // =========================================================================
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverCanvas) setIsDragOverCanvas(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCanvas(false);
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCanvas(false);

    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const data = JSON.parse(rawData);

      // Hitung koordinat kursor mouse relatif terhadap kertas canvas (#canvas-paper)
      const paperEl = document.getElementById('canvas-paper');
      if (!paperEl) return;
      const rect = paperEl.getBoundingClientRect();

      const scale = zoomLevel / 100;
      // Koordinat dalam dimensi murni piksel kanvas (sebelum zoom transform)
      const dropX = Math.round((e.clientX - rect.left) / scale);
      const dropY = Math.round((e.clientY - rect.top) / scale);

      const itemWidth = data.defaultWidth || (data.type === 'text' ? 240 : data.type === 'image' ? 120 : 220);
      const itemHeight = data.defaultHeight || (data.type === 'text' ? 40 : data.type === 'image' ? 120 : 220);

      // Posisikan elemen berpusat pada kursor mouse, terjaga di dalam area kanvas
      const posX = Math.max(10, Math.min(baseWidthPx - itemWidth - 10, dropX - Math.round(itemWidth / 2)));
      const posY = Math.max(10, Math.min(baseHeightPx - itemHeight - 10, dropY - Math.round(itemHeight / 2)));

      const newId = `el-${Date.now()}`;
      const newElement: CanvasElement = {
        id: newId,
        type: data.type,
        subType: data.subType,
        x: posX,
        y: posY,
        width: itemWidth,
        height: itemHeight,
        content: data.content || (data.type === 'text' ? 'Teks Baru' : data.type === 'image' ? '⭐' : undefined),
        fontSize: data.fontSize || (data.type === 'text' ? 18 : undefined),
        color: data.color || '#0f172a',
        textAlign: data.textAlign || 'center',
        imageUrl: data.imageUrl,
        opacity: 1,
        flipHorizontal: false,
      };

      if (onUpdateElements) {
        onUpdateElements((prev) => [...prev, newElement]);
      }

      // Otomatis aktifkan elemen baru yang dijatuhkan (selected)
      onSelectId?.(newId);
      if (data.type === 'text') {
        onSelectContext('text');
      } else if (data.type === 'image') {
        onSelectContext('assets');
      } else if (data.type === 'puzzle') {
        if (data.subType === 'labirin') onSelectContext('maze');
        else if (data.subType === 'word-search') onSelectContext('wordsearch');
        else if (data.subType === 'sudoku') onSelectContext('sudoku');
        else onSelectContext('worksheet');
      }
    } catch (err) {
      console.error('Error handling dropped element:', err);
    }
  };

  return (
    <main
      ref={containerRef}
      className="flex-1 bg-slate-950 flex flex-col items-center relative overflow-hidden select-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] h-full"
      onClick={() => onSelectContext('page')}
    >
      {/* 3. FLOATING TOOLBAR KONTEKSTUAL (Top-Center of Workspace, 100% Zoom-Scale Independent) */}
      <FloatingToolbar
        activeElement={activeElement}
        allElements={elements || []}
        zoomLevel={zoomLevel}
        baseWidthPx={baseWidthPx}
        baseHeightPx={baseHeightPx}
        page={page}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onDuplicateElement={handleDuplicateElement}
        onUngroup={handleUngroup}
        onGroup={handleGroupElement}
        onDeleteGroup={handleDeleteGroup}
        onDuplicateGroup={handleDuplicateGroup}
        onRegeneratePuzzle={handleRegeneratePuzzle}
        onUpdateMazeConfig={onUpdateMazeConfig}
        onReorderElement={handleReorderElement}
      />

      {/* 1. WYSIWYG CANVAS SCROLL CONTAINER (Enhanced Professional Scrolling & Artboard Preview) */}
      <div 
        className="flex-1 w-full relative overflow-auto p-12 md:p-24 flex flex-col items-center justify-start min-h-0"
        onDragOver={handleCanvasDragOver}
        onDrop={handleCanvasDrop}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectId?.(null);
            onSelectContext('page');
          }
        }}
      >
        <div
          style={{
            width: `${(baseWidthPx * zoomLevel) / 100}px`,
            height: `${(baseHeightPx * zoomLevel) / 100}px`,
            position: 'relative',
            margin: 'auto',
            flexShrink: 0,
          }}
        >
          {/* THE PAPER (Physical Aspect Ratio & Dimension Simulation without distortion) */}
          <div
            id="canvas-paper"
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
            style={{
              width: `${baseWidthPx}px`,
              height: `${baseHeightPx}px`,
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top left',
            }}
            className={`bg-white text-slate-800 rounded-sm shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative border border-slate-300 transition-transform duration-75 cursor-default ${
              grayscaleMode ? 'grayscale' : ''
            } ${isDragOverCanvas ? 'ring-4 ring-blue-500/70 ring-offset-2' : ''}`}
            onClick={(e) => {
              // Only deselect if clicking directly on the empty paper background
              if (e.target === e.currentTarget) {
                e.stopPropagation();
                onSelectId?.(null);
                onSelectContext('page');
              }
            }}
          >
            {/* Visual drop indicator overlay */}
            {isDragOverCanvas && (
              <div className="absolute inset-0 bg-blue-500/10 pointer-events-none z-50 flex items-center justify-center border-2 border-dashed border-blue-500 rounded-sm">
                <div className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg border border-blue-400/50 flex items-center gap-1.5">
                  <span className="text-blue-400">✨</span> Lepaskan untuk menaruh elemen di sini
                </div>
              </div>
            )}
            {/* BLEED GUIDELINE (0.125" offset in red dashed outline) */}
            {showMarginGuides && metadata.bleed && (
              <div className="absolute -inset-[6px] border border-red-500/50 border-dashed pointer-events-none rounded-sm z-0">
                <span className="absolute -top-4 left-0 text-[8px] text-red-400 font-mono bg-slate-950 px-1 py-0.5 rounded border border-red-500/30">
                  Bleed Area (3.2mm)
                </span>
              </div>
            )}

            {/* SAFE AREA MARGIN GUIDELINE (Gutter inside & outer margins dynamically aligned for Recto/Verso) */}
            {showMarginGuides && metadata?.margins && (() => {
              const isRecto = (page.pageNumber % 2 !== 0);
              const gutterMarginMm = metadata.margins.insideMm ?? 12.7;
              const outerMarginMm = metadata.margins.outsideMm ?? 12.7;
              const leftMarginMm = isRecto ? gutterMarginMm : outerMarginMm;
              const rightMarginMm = isRecto ? outerMarginMm : gutterMarginMm;

              return (
                <div
                  style={{
                    top: `${((metadata.margins.topMm ?? 12.7) / spec.heightMm) * 100}%`,
                    bottom: `${((metadata.margins.bottomMm ?? 12.7) / spec.heightMm) * 100}%`,
                    left: `${(leftMarginMm / spec.widthMm) * 100}%`,
                    right: `${(rightMarginMm / spec.widthMm) * 100}%`,
                  }}
                  className="absolute border border-blue-400/50 border-dashed pointer-events-none z-0"
                >
                  <span className="absolute top-0.5 right-1 text-[8px] text-blue-500 font-mono bg-white/90 px-1 rounded shadow-xs">
                    {isRecto ? `KDP Safe (Gutter Kiri ${gutterMarginMm}mm)` : `KDP Safe (Gutter Kanan ${gutterMarginMm}mm)`}
                  </span>
                </div>
              );
            })()}

            {/* PAGE BORDER FRAME DECORATION */}
            {page.borderStyle && page.borderStyle !== 'none' && (
              <div
                className={`absolute inset-3 pointer-events-none z-0 ${
                  page.borderStyle === 'double'
                    ? 'border-4 border-double'
                    : page.borderStyle === 'rounded'
                    ? 'border-2 rounded-2xl'
                    : page.borderStyle === 'dots'
                    ? 'border-2 border-dotted'
                    : 'border-2'
                }`}
                style={{ borderColor: page.borderColor || '#334155' }}
              />
            )}

            {/* INTERACTIVE CANVAS ELEMENTS VIA BOUNDING BOX */}
            {elements && elements.length > 0 &&
              elements.map((el) => {
                const isSelected = selectedIds?.includes(el.id) || selectedId === el.id;
                const isParentOfSelected =
                  el.type === 'group' &&
                  Boolean(
                    elements?.some(
                      (child) => (selectedIds?.includes(child.id) || child.id === selectedId) && child.parentId === el.id
                    )
                  );

                return (
                  <BoundingBox
                    key={el.id}
                    element={el}
                    isSelected={isSelected}
                    zoomLevel={zoomLevel}
                    allElements={elements}
                    onUpdateElements={onUpdateElements || (() => {})}
                    onSelect={(e) => handleSelectElement(el, e)}
                    onDoubleClick={() => handleDoubleClickElement(el)}
                  >
                    {/* A. TEXT ELEMENT */}
                    {el.type === 'text' && (
                      <div
                        className="w-full h-full flex flex-col justify-center px-1 select-none overflow-hidden"
                        style={{ textAlign: el.textAlign || 'center' }}
                      >
                        {editingTextId === el.id ? (
                          <textarea
                            autoFocus
                            value={el.content || ''}
                            onChange={(e) => {
                              const newContent = e.target.value;
                              onUpdateElements?.((prev) =>
                                prev.map((item) =>
                                  item.id === el.id ? { ...item, content: newContent } : item
                                )
                              );
                              if (el.id === 'el-title') onUpdatePageTitle?.(newContent);
                              if (el.id === 'el-inst-text') onUpdatePageInstructions?.(newContent);
                            }}
                            onBlur={() => setEditingTextId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                setEditingTextId(null);
                              }
                              if (e.key === 'Escape') {
                                setEditingTextId(null);
                              }
                              e.stopPropagation();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="w-full h-full resize-none bg-white text-slate-900 border-2 border-blue-500 rounded p-1 outline-none font-bold shadow-md cursor-text"
                            style={{
                              fontSize: `${el.fontSize || 16}px`,
                              textAlign: el.textAlign || 'center',
                              color: el.color || '#0f172a',
                              fontWeight: el.fontWeight || 'bold',
                              fontStyle: el.fontStyle || 'normal',
                              textDecoration: el.textDecoration || 'none',
                            }}
                          />
                        ) : (
                          <span
                            className={`tracking-wide leading-tight block break-words cursor-pointer ${
                              (el.fontFamily || page.textElement?.fontFamily) === 'serif'
                                ? 'font-serif'
                                : (el.fontFamily || page.textElement?.fontFamily) === 'comic'
                                ? 'font-comic'
                                : (el.fontFamily || page.textElement?.fontFamily) === 'mono'
                                ? 'font-mono'
                                : 'font-sans'
                            }`}
                            style={{
                              fontSize: `${el.fontSize || 16}px`,
                              color: el.color || '#0f172a',
                              fontWeight: el.fontWeight || 'bold',
                              fontStyle: el.fontStyle || 'normal',
                              textDecoration: el.textDecoration || 'none',
                              textAlign: el.textAlign || 'center',
                              lineHeight: el.lineHeight || 1.2,
                              letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
                              textTransform: el.textTransform || 'none',
                            }}
                            title="Klik untuk memilih, double-click untuk edit teks langsung"
                          >
                            {el.content || 'Teks Baru'}
                          </span>
                        )}
                      </div>
                    )}

                    {/* B. IMAGE / CLIPART ELEMENT */}
                    {el.type === 'image' && (
                      <div
                        className="w-full h-full relative flex items-center justify-center select-none overflow-hidden"
                        style={{
                          opacity: el.opacity ?? 1,
                          transform: el.flipHorizontal ? 'scaleX(-1)' : 'none',
                        }}
                      >
                        {el.imageUrl ? (
                          <img
                            src={el.imageUrl}
                            alt="Clipart"
                            className="w-full h-full object-contain pointer-events-none drop-shadow"
                          />
                        ) : (
                          <span
                            className="text-4xl pointer-events-none drop-shadow flex items-center justify-center leading-none"
                            style={{
                              fontSize: `${Math.min(el.width, el.height) * 0.7}px`,
                            }}
                          >
                            {el.content || '⭐'}
                          </span>
                        )}
                      </div>
                    )}

                    {/* C. SHAPE ELEMENT (Paritas Kanvas E2) */}
                    {el.type === 'shape' && (
                      <div
                        className="w-full h-full relative select-none"
                        style={{
                          opacity: el.opacity ?? 1,
                          transform: el.flipHorizontal ? 'scaleX(-1)' : 'none',
                        }}
                      >
                        <svg className="w-full h-full overflow-visible pointer-events-none">
                          {(!el.shapeType || el.shapeType === 'rect') && (
                            <rect
                              x={(el.strokeWidth ?? 2) / 2}
                              y={(el.strokeWidth ?? 2) / 2}
                              width={Math.max(1, el.width - (el.strokeWidth ?? 2))}
                              height={Math.max(1, el.height - (el.strokeWidth ?? 2))}
                              rx={el.cornerRadius ?? 8}
                              ry={el.cornerRadius ?? 8}
                              fill={el.fillColor || '#e0e7ff'}
                              stroke={el.strokeColor || '#4f46e5'}
                              strokeWidth={el.strokeWidth ?? 2}
                              strokeDasharray={el.strokeStyle === 'dashed' ? '6 4' : undefined}
                            />
                          )}
                          {el.shapeType === 'ellipse' && (
                            <ellipse
                              cx={el.width / 2}
                              cy={el.height / 2}
                              rx={Math.max(1, (el.width - (el.strokeWidth ?? 2)) / 2)}
                              ry={Math.max(1, (el.height - (el.strokeWidth ?? 2)) / 2)}
                              fill={el.fillColor || '#e0e7ff'}
                              stroke={el.strokeColor || '#4f46e5'}
                              strokeWidth={el.strokeWidth ?? 2}
                              strokeDasharray={el.strokeStyle === 'dashed' ? '6 4' : undefined}
                            />
                          )}
                          {el.shapeType === 'line' && (
                            <line
                              x1={0}
                              y1={el.height / 2}
                              x2={el.width}
                              y2={el.height / 2}
                              stroke={el.strokeColor || '#4f46e5'}
                              strokeWidth={el.strokeWidth ?? 2}
                              strokeDasharray={el.strokeStyle === 'dashed' ? '6 4' : undefined}
                            />
                          )}
                        </svg>
                      </div>
                    )}

                    {/* D. PUZZLE ELEMENT */}
                    {el.type === 'puzzle' && (
                      <div className="w-full h-full relative rounded-lg border border-slate-800 bg-white p-2 shadow-xs flex items-center justify-center">
                        {renderPuzzlePreview(el.subType, el)}
                      </div>
                    )}

                    {/* D. GROUP ELEMENT */}
                    {el.type === 'group' && (
                      <div
                        className={`w-full h-full pointer-events-none relative rounded border border-dashed p-1 flex items-start justify-between transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/15'
                            : isParentOfSelected
                            ? 'border-blue-400/80 bg-blue-50/10'
                            : 'border-blue-400/40 bg-blue-50/5'
                        }`}
                      >
                        <span
                          className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-500'
                              : isParentOfSelected
                              ? 'bg-blue-100 text-blue-700 border-blue-300'
                              : 'bg-white/95 text-blue-600 border-blue-200'
                          }`}
                        >
                          Grup ({el.childrenIds?.length || 0} item)
                          {isParentOfSelected && (
                            <span className="ml-1 text-[7px] opacity-80">(sub-elemen aktif)</span>
                          )}
                        </span>
                      </div>
                    )}
                  </BoundingBox>
                );
              })}

            {/* BOTTOM PAGINATION (Respects BOOK Domain Dynamic Pagination Engine) */}
            {metadata.pagination?.enabled !== false && page.displayPageNumber !== '' && (
              <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none z-10">
                <span className="text-[10px] text-slate-400 font-mono tracking-widest font-bold">
                  {page.displayPageNumber || (
                    metadata.pagination?.format === 'number'
                      ? (activePageIndex + (metadata.pagination?.startPage || 1))
                      : metadata.pagination?.format === 'text'
                      ? `Hal ${activePageIndex + (metadata.pagination?.startPage || 1)}`
                      : `- ${activePageIndex + (metadata.pagination?.startPage || 1)} -`
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Toolbar relocated to workspace root for 100% zoom-scale independence */}
        </div>
      </div>

      {/* 3. CANVA FOOTER STATUS BAR: STATIC BOTTOM SLIDER & PAGE NAVIGATOR (Tanpa Distorsi Canvas) */}
      <footer className="w-full h-11 bg-slate-900 border-t border-slate-800 px-4 flex items-center flex-nowrap justify-between text-xs shrink-0 z-20 shadow-lg">
        {/* Left: Page Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigatePage(Math.max(0, activePageIndex - 1))}
            disabled={activePageIndex === 0}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-md transition cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={13} />
          </button>

          <div className="text-slate-300 font-mono text-[11px] px-1.5 flex items-center gap-2">
            <span>
              Hal <strong className="text-indigo-400">{activePageIndex + 1}</strong> / {totalPages}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${page.pageNumber % 2 !== 0 ? 'bg-amber-400' : 'bg-cyan-400'}`} />
              {page.pageNumber % 2 !== 0 ? 'Recto (Kanan)' : 'Verso (Kiri)'}
            </span>
          </div>

          <button
            onClick={() => onNavigatePage(Math.min(totalPages - 1, activePageIndex + 1))}
            disabled={activePageIndex >= totalPages - 1}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-md transition cursor-pointer"
            title="Halaman Selanjutnya"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Middle: Canvas Helper Toggles (Garis Bantu KDP, Monokrom POD, Solusi) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {/* Garis Bantu KDP Toggle */}
          <button
            type="button"
            onClick={() => setShowMarginGuides(!showMarginGuides)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              showMarginGuides
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilkan atau sembunyikan garis batas aman KDP Bleed & Margin"
          >
            <Layers size={12} />
            <span className="hidden sm:inline">Garis Bantu</span>
            <span className="text-[10px] font-mono font-bold">{showMarginGuides ? 'ON' : 'OFF'}</span>
          </button>

          {/* Monokrom POD Simulation */}
          <button
            type="button"
            onClick={() => setGrayscaleMode(!grayscaleMode)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              grayscaleMode
                ? 'bg-slate-200 text-slate-900 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Simulasi cetak hitam-putih KDP Print on Demand"
          >
            <span>Monokrom</span>
            <span className="text-[10px] font-mono font-bold">{grayscaleMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Solusi / Kunci Jawaban Toggle (jika halaman puzzle atau elemen labirin ada di workspace) */}
          {(page.puzzleType || targetMazeElement) && (
            <button
              type="button"
              onClick={handleToggleWorkspaceSolution}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                effectiveWorkspaceShowSolution
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilkan / sembunyikan kunci jawaban puzzle"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Solusi</span>
              <span className="text-[10px] font-mono font-bold">{effectiveWorkspaceShowSolution ? 'ON' : 'OFF'}</span>
            </button>
          )}

        </div>

        {/* Right: Zoom Slider Control (Canva Style Range Slider) & Fit to Screen */}
        <div className="flex items-center gap-2.5">
          {/* Zoom Out Button */}
          {setZoomLevel && (
            <button
              onClick={() => setZoomLevel((z) => Math.max(40, z - 10))}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Perkecil (Zoom Out)"
            >
              <ZoomOut size={13} />
            </button>
          )}

          {/* Range Slider for Smooth Scaling */}
          {setZoomLevel && (
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min="40"
                max="180"
                step="5"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(() => Number(e.target.value))}
                className="w-24 md:w-32 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                title={`Level Zoom: ${zoomLevel}%`}
              />
            </div>
          )}

          {/* Zoom In Button */}
          {setZoomLevel && (
            <button
              onClick={() => setZoomLevel((z) => Math.min(180, z + 10))}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Perbesar (Zoom In)"
            >
              <ZoomIn size={13} />
            </button>
          )}

          {/* Zoom Percentage Reset Button */}
          {setZoomLevel && (
            <button
              onClick={() => setZoomLevel(() => 100)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] rounded transition cursor-pointer"
              title="Reset Zoom ke 100%"
            >
              {zoomLevel}%
            </button>
          )}

          {/* Fit to Screen Button */}
          <button
            onClick={handleFitToScreen}
            className="p-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-md transition cursor-pointer flex items-center gap-1"
            title="Pas ke Layar (Fit to Screen tanpa Distorsi)"
          >
            <Maximize2 size={12} />
            <span className="hidden lg:inline text-[10px]">Fit View</span>
          </button>
        </div>
      </footer>
    </main>
  );
};
