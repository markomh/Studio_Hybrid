import React, { useState } from 'react';
import { Project, BookPage, PuzzleType, AssetClipart, CanvasElement, BookSettings, PageRole } from './types';
import { createDefaultProject } from './data/initialProject';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { ContextInspector } from './components/ContextInspector';
import { DashboardView } from './components/DashboardView';
import { BookBuilderView } from './components/BookBuilderView';
import { AssetLibraryView } from './components/AssetLibraryView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { DownloadCenterModal } from './components/DownloadCenterModal';
import { BatchGeneratorModal } from './components/BatchGeneratorModal';
import { KdpToolkitModal } from './components/KdpToolkitModal';
import { PageSetupModal } from './components/PageSetupModal';
import { WelcomeModal } from './components/WelcomeModal';
import { exportBookToPdf } from './utils/pdfExport';
import { generateMaze } from './utils/mazeGenerator';
import { generateWordSearch } from './utils/wordSearchGenerator';
import { generateSudoku } from './utils/sudokuGenerator';
import { calculateBookPagination, ensureProjectStructure } from './utils/paginationEngine';
import { compileSolutionsForBook } from './utils/solutionCompiler';
import { ensurePageElements } from './utils/elementMigration';
import { CommandManager } from './history/CommandManager';
import { CoverWorkspace } from './components/CoverWorkspace';
import { CoverProject } from './types';

export default function App() {
  const [project, setProject] = useState<Project>(() => ensureProjectStructure(createDefaultProject()));
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [activeView, setActiveView] = useState<
    'studio' | 'cover' | 'book-structure' | 'book-builder' | 'batch' | 'assets' | 'ai' | 'download' | 'dashboard'
  >('studio');

  // Command History Manager (Granular Micro-Step Undo/Redo)
  const commandManagerRef = React.useRef(new CommandManager(50));
  const [, setHistoryTick] = useState(0);

  React.useEffect(() => {
    return commandManagerRef.current.subscribe(() => {
      setHistoryTick((t) => t + 1);
    });
  }, []);

  // Full-Wrap KDP Cover State
  const [coverProject, setCoverProject] = useState<CoverProject>({
    title: 'BUKU AKTIVITAS SERU',
    subtitle: '100+ Labirin, Puzzle, dan Asah Otak Pintar',
    author: 'Studio Hybrid Publisher',
    spineText: 'BUKU AKTIVITAS SERU',
    backgroundColor: '#0f172a',
    accentColor: '#6366f1',
    barcodeSafeZone: true,
    frontElements: [],
    backElements: [],
  });

  const [selectedElement, setSelectedElement] = useState<
    'maze' | 'wordsearch' | 'sudoku' | 'worksheet' | 'text' | 'assets' | 'page'
  >('maze');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedId = selectedIds[selectedIds.length - 1] || null;
  const setSelectedId = (id: string | null) => setSelectedIds(id ? [id] : []);

  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [pageSetupOpen, setPageSetupOpen] = useState<boolean>(false);
  const [kdpModalOpen, setKdpModalOpen] = useState<boolean>(false);
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [assetModalOpen, setAssetModalOpen] = useState<boolean>(false);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState<boolean>(true);

  const handleSelectBlankProject = () => {
    const blankProject: Project = {
      metadata: {
        id: `proj-${Date.now()}`,
        name: 'Buku Aktivitas Baru',
        targetKdpFormat: 'Letter',
        paperColor: 'white',
        bleed: true,
        margins: { topMm: 12.7, bottomMm: 12.7, insideMm: 15.2, outsideMm: 12.7 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['Aktivitas', 'KDP', 'Baru'],
      },
      pages: [
        {
          id: 'p-blank-1',
          pageNumber: 1,
          title: 'Halaman 1',
          puzzleType: 'maze',
          difficulty: 'easy',
          borderStyle: 'rounded',
          borderColor: '#334155',
          textElement: {
            id: 't-blank-1',
            title: 'BUKU AKTIVITAS SAYA',
            subtitle: 'Mulai Kreasi Anda',
            instructions: 'Tambahkan elemen dari sidebar.',
            footerStory: '',
            fontFamily: 'sans',
            titleSize: 22,
            align: 'center',
          },
        },
      ],
    };
    setProject(ensureProjectStructure(blankProject));
    setActivePageIndex(0);
    setSelectedId(null);
    setActiveView('studio');
  };

  const handleSelectTemplateProject = () => {
    setProject(ensureProjectStructure(createDefaultProject()));
    setActivePageIndex(0);
    setSelectedId(null);
    setActiveView('studio');
  };

  // Enterprise Undo / Redo History Stack
  const [history, setHistory] = useState<BookPage[][]>([createDefaultProject().pages]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const currentPage = project.pages[activePageIndex] || project.pages[0];
  const currentElements = ensurePageElements(currentPage);

  const handleUpdateElements = (
    updater: (prev: CanvasElement[]) => CanvasElement[],
    actionDescription = 'Edit Elemen'
  ) => {
    const curPage = project.pages[activePageIndex];
    if (!curPage) return;
    const oldElements = ensurePageElements(curPage);
    const newElements = updater(oldElements);

    // Register into granular Command Manager
    commandManagerRef.current.execute({
      id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description: actionDescription,
      execute: () => {
        setProject((prev) => {
          const nextPages = [...prev.pages];
          if (!nextPages[activePageIndex]) return prev;
          nextPages[activePageIndex] = {
            ...nextPages[activePageIndex],
            elements: newElements,
          };
          return { ...prev, pages: nextPages };
        });
      },
      undo: () => {
        setProject((prev) => {
          const nextPages = [...prev.pages];
          if (!nextPages[activePageIndex]) return prev;
          nextPages[activePageIndex] = {
            ...nextPages[activePageIndex],
            elements: oldElements,
          };
          return { ...prev, pages: nextPages };
        });
      },
    });
  };

  const handleUpdateCanvasElement = (id: string, update: Partial<CanvasElement>) => {
    handleUpdateElements(
      (prev) => prev.map((el) => (el.id === id ? { ...el, ...update } : el)),
      'Ubah Properti Elemen'
    );
  };

  const handleDeleteElement = (id: string) => {
    handleUpdateElements(
      (prev) => prev.filter((el) => el.id !== id && el.parentId !== id),
      'Hapus Elemen'
    );
    setSelectedIds([]);
  };

  const handleDuplicateElement = (id: string) => {
    handleUpdateElements((prev) => {
      const target = prev.find((el) => el.id === id);
      if (!target) return prev;
      const cloned: CanvasElement = {
        ...target,
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: target.x + 20,
        y: target.y + 20,
      };
      setSelectedIds([cloned.id]);
      return [...prev, cloned];
    }, 'Duplikasi Elemen');
  };

  const handleDeleteMultipleElements = (ids: string[]) => {
    handleUpdateElements(
      (prev) => prev.filter((el) => !ids.includes(el.id) && !ids.includes(el.parentId || '')),
      'Hapus Elemen Terpilih'
    );
    setSelectedIds([]);
  };

  const handleDuplicateMultipleElements = (ids: string[]) => {
    handleUpdateElements((prev) => {
      const targets = prev.filter((el) => ids.includes(el.id));
      if (targets.length === 0) return prev;
      const cloned: CanvasElement[] = targets.map((target, idx) => ({
        ...target,
        id: `el-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        x: target.x + 20,
        y: target.y + 20,
      }));
      setSelectedIds(cloned.map((c) => c.id));
      return [...prev, ...cloned];
    }, 'Duplikasi Elemen Terpilih');
  };

  const handleGroupMultipleElements = (ids: string[]) => {
    if (ids.length < 2) return;
    handleUpdateElements((prev) => {
      const targets = prev.filter((el) => ids.includes(el.id));
      if (targets.length < 2) return prev;
      const minX = Math.min(...targets.map((t) => t.x));
      const minY = Math.min(...targets.map((t) => t.y));
      const maxX = Math.max(...targets.map((t) => t.x + t.width));
      const maxY = Math.max(...targets.map((t) => t.y + t.height));
      const groupId = `group-${Date.now()}`;
      const groupEl: CanvasElement = {
        id: groupId,
        type: 'group',
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        childrenIds: targets.map((t) => t.id),
      };
      setSelectedIds([groupId]);
      return [
        groupEl,
        ...prev.map((el) => (ids.includes(el.id) ? { ...el, parentId: groupId } : el)),
      ];
    }, 'Grup Elemen');
  };

  const handleAlignElements = (alignType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom', ids: string[]) => {
    if (ids.length < 2) return;
    handleUpdateElements((prev) => {
      const targets = prev.filter((el) => ids.includes(el.id));
      if (targets.length < 2) return prev;

      const minX = Math.min(...targets.map((t) => t.x));
      const maxX = Math.max(...targets.map((t) => t.x + t.width));
      const centerX = (minX + maxX) / 2;

      const minY = Math.min(...targets.map((t) => t.y));
      const maxY = Math.max(...targets.map((t) => t.y + t.height));
      const centerY = (minY + maxY) / 2;

      return prev.map((el) => {
        if (!ids.includes(el.id)) return el;
        let nx = el.x;
        let ny = el.y;

        if (alignType === 'left') nx = minX;
        else if (alignType === 'center') nx = centerX - el.width / 2;
        else if (alignType === 'right') nx = maxX - el.width;
        else if (alignType === 'top') ny = minY;
        else if (alignType === 'middle') ny = centerY - el.height / 2;
        else if (alignType === 'bottom') ny = maxY - el.height;

        return { ...el, x: nx, y: ny };
      });
    }, `Perataan (${alignType})`);
  };

  const handleDistributeElements = (distType: 'horizontal' | 'vertical', ids: string[]) => {
    if (ids.length < 3) return;
    handleUpdateElements((prev) => {
      const targets = prev.filter((el) => ids.includes(el.id));
      if (targets.length < 3) return prev;

      const sorted = [...targets].sort((a, b) => (distType === 'horizontal' ? a.x - b.x : a.y - b.y));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      if (distType === 'horizontal') {
        const totalWidth = sorted.reduce((sum, item) => sum + item.width, 0);
        const totalSpan = (last.x + last.width) - first.x;
        const gap = (totalSpan - totalWidth) / (sorted.length - 1);

        let currentX = first.x;
        const newPositions: Record<string, number> = {};
        sorted.forEach((item) => {
          newPositions[item.id] = currentX;
          currentX += item.width + gap;
        });

        return prev.map((el) => (newPositions[el.id] !== undefined ? { ...el, x: newPositions[el.id] } : el));
      } else {
        const totalHeight = sorted.reduce((sum, item) => sum + item.height, 0);
        const totalSpan = (last.y + last.height) - first.y;
        const gap = (totalSpan - totalHeight) / (sorted.length - 1);

        let currentY = first.y;
        const newPositions: Record<string, number> = {};
        sorted.forEach((item) => {
          newPositions[item.id] = currentY;
          currentY += item.height + gap;
        });

        return prev.map((el) => (newPositions[el.id] !== undefined ? { ...el, y: newPositions[el.id] } : el));
      }
    }, `Distribusi (${distType})`);
  };

  const handleOpenPageSetup = () => {
    if (focusMode) setFocusMode(false);
    setPageSetupOpen(true);
  };

  // Helper to push state into undo history
  const pushHistory = (newPages: BookPage[]) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      const next = [...sliced, newPages];
      if (next.length > 25) next.shift();
      return next;
    });
    setHistoryIndex((prev) => Math.min(24, prev + 1));
  };

  const handleUndo = () => {
    if (commandManagerRef.current.canUndo()) {
      commandManagerRef.current.undo();
      return;
    }
    // Fallback page-level undo if command stack is empty
    if (historyIndex > 0) {
      const targetState = history[historyIndex - 1];
      setHistoryIndex((prev) => prev - 1);
      setProject((prev) => ({
        ...prev,
        pages: targetState,
      }));
    }
  };

  const handleRedo = () => {
    if (commandManagerRef.current.canRedo()) {
      commandManagerRef.current.redo();
      return;
    }
    // Fallback page-level redo
    if (historyIndex < history.length - 1) {
      const targetState = history[historyIndex + 1];
      setHistoryIndex((prev) => prev + 1);
      setProject((prev) => ({
        ...prev,
        pages: targetState,
      }));
    }
  };

  // Keyboard shortcut listener (Ctrl+Z / Ctrl+Y / Tab / Ctrl+\ for Focus Mode)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (document.activeElement?.tagName || '').toUpperCase()
      );

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (!isInputFocused && (e.key === 'Tab' || ((e.ctrlKey || e.metaKey) && e.key === '\\'))) {
        // REFRACTOR #8: Focus Mode Toggle
        e.preventDefault();
        setFocusMode((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (focusMode) {
          setFocusMode(false);
        } else if (selectedId) {
          const currentEl = currentElements.find((el) => el.id === selectedId);
          if (currentEl?.parentId) {
            setSelectedId(currentEl.parentId);
            setSelectedElement('page');
          } else {
            setSelectedId(null);
            setSelectedElement('page');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, focusMode, selectedId, currentElements]);

  // Helper: update current page
  const updatePages = (updater: (page: BookPage, index: number) => BookPage) => {
    setProject((prev) => {
      const nextPages = prev.pages.map((p, idx) => {
        if (idx === activePageIndex) {
          return updater(p, idx);
        }
        return p;
      });
      pushHistory(nextPages);
      return {
        ...prev,
        pages: nextPages,
      };
    });
  };

  // 1. Maze Config Update
  const handleUpdateMazeConfig = (update: Partial<any>) => {
    updatePages((p) => {
      if (!p.mazeConfig) return p;
      const nextCfg = { ...p.mazeConfig, ...update };
      const generated = generateMaze(nextCfg);
      return {
        ...p,
        mazeConfig: nextCfg,
        solutionPath: generated.solutionPath,
      };
    });
  };

  // 2. Word Search Config Update
  const handleUpdateWordSearchConfig = (update: Partial<any>) => {
    updatePages((p) => {
      if (!p.wordSearchConfig) return p;
      const nextCfg = { ...p.wordSearchConfig, ...update };
      const generated = generateWordSearch(nextCfg);
      return {
        ...p,
        wordSearchConfig: nextCfg,
        wordSearchGrid: {
          grid: generated.grid,
          placedWords: generated.placedWords,
        },
      };
    });
  };

  // 3. Sudoku Config Update
  const handleUpdateSudokuConfig = (update: Partial<any>) => {
    updatePages((p) => {
      if (!p.sudokuConfig) return p;
      const nextCfg = { ...p.sudokuConfig, ...update };
      const generated = generateSudoku(nextCfg);
      return {
        ...p,
        sudokuConfig: nextCfg,
        sudokuBoard: generated,
      };
    });
  };

  // 4. Worksheet Config Update
  const handleUpdateWorksheetConfig = (update: Partial<any>) => {
    updatePages((p) => {
      if (!p.worksheetConfig) return p;
      return {
        ...p,
        worksheetConfig: { ...p.worksheetConfig, ...update },
      };
    });
  };

  // 5. Text Element Update
  const handleUpdateTextElement = (update: Partial<any>) => {
    updatePages((p) => ({
      ...p,
      textElement: { ...p.textElement, ...update },
      title: update.title !== undefined ? update.title : p.title,
    }));
    // Sync with elements state for single source of truth
    handleUpdateElements((prev) =>
      prev.map((el) => {
        if (update.title !== undefined && (el.id.includes('title') || el.id === 'el-title')) {
          return {
            ...el,
            content: update.title,
            fontSize: update.titleSize ?? el.fontSize,
            textAlign: update.align ?? el.textAlign,
          };
        }
        if (update.instructions !== undefined && (el.id.includes('inst') || el.id === 'el-inst-text')) {
          return { ...el, content: update.instructions };
        }
        if (update.titleSize !== undefined && (el.id.includes('title') || el.id === 'el-title')) {
          return { ...el, fontSize: update.titleSize };
        }
        if (update.align !== undefined && (el.id.includes('title') || el.id === 'el-title')) {
          return { ...el, textAlign: update.align };
        }
        return el;
      })
    );
  };

  // 6. Border Style Update
  const handleUpdateBorderStyle = (style: any) => {
    updatePages((p) => ({
      ...p,
      borderStyle: style,
    }));
  };

  // 7. Regenerate current puzzle
  const handleRegenerateMaze = () => {
    const newSeed = Math.floor(Math.random() * 999999);
    handleUpdateMazeConfig({ seed: newSeed });
  };

  const handleRegenerateWordSearch = () => {
    if (currentPage.wordSearchConfig) {
      handleUpdateWordSearchConfig({
        seed: Math.random(),
      });
    }
  };

  const handleRegenerateSudoku = () => {
    if (currentPage.sudokuConfig) {
      handleUpdateSudokuConfig({
        seed: Math.random(),
      });
    }
  };

  // Select page with auto-synchronization of inspector context
  const handleSelectPage = (idx: number) => {
    setActivePageIndex(idx);
    setSelectedId(null);
    const targetPage = project.pages[idx];
    if (targetPage) {
      if (targetPage.puzzleType === 'wordsearch') setSelectedElement('wordsearch');
      else if (targetPage.puzzleType === 'sudoku') setSelectedElement('sudoku');
      else if (targetPage.puzzleType === 'worksheet') setSelectedElement('worksheet');
      else setSelectedElement('maze');
    }
  };

  // Convert current active page's puzzle type
  const handleConvertCurrentPageType = (type: PuzzleType) => {
    setProject((prev) => {
      const nextPages = [...prev.pages];
      const curr = nextPages[activePageIndex];
      if (!curr) return prev;

      let updated: BookPage = { ...curr, puzzleType: type };

      if (type === 'wordsearch') {
        const wsCfg = curr.wordSearchConfig || {
          gridSize: 12,
          words: ['GALAXY', 'PLANET', 'ORBIT', 'ROCKET', 'COMET', 'NEBULA', 'ASTRONAUT', 'COSMOS'],
          theme: 'Space Exploration',
          difficulty: curr.difficulty || 'medium',
          allowDiagonal: true,
          allowReverse: true,
        };
        const genWs = generateWordSearch(wsCfg);
        updated = {
          ...updated,
          wordSearchConfig: wsCfg,
          wordSearchGrid: {
            grid: genWs.grid,
            placedWords: genWs.placedWords,
          },
          textElement: {
            ...curr.textElement,
            title: `Pencarian Kata #${curr.pageNumber}`,
            instructions: 'Cari kata-kata yang tersembunyi secara mendatar, menurun, atau menyilang!',
          },
        };
      } else if (type === 'sudoku') {
        const sCfg = curr.sudokuConfig || {
          difficulty: curr.difficulty || 'medium',
          givensCount: 30,
        };
        const genS = generateSudoku(sCfg);
        updated = {
          ...updated,
          sudokuConfig: sCfg,
          sudokuBoard: genS,
          textElement: {
            ...curr.textElement,
            title: `Sudoku Logika #${curr.pageNumber}`,
            instructions: 'Isi angka 1 sampai 9 di setiap baris, kolom, dan kotak 3x3 tanpa angka kembar!',
          },
        };
      } else if (type === 'worksheet') {
        const wsConfig = curr.worksheetConfig || {
          subject: 'math',
          topic: 'Math Challenge',
          grade: 'Grade 3-4',
          instructions: 'Selesaikan perhitungan berikut dengan teliti.',
          questions: [
            { id: '1', q: '35 + 47 = ?', a: '82' },
            { id: '2', q: '90 - 36 = ?', a: '54' },
            { id: '3', q: '7 × 8 = ?', a: '56' },
            { id: '4', q: '63 ÷ 9 = ?', a: '7' },
          ],
        };
        updated = {
          ...updated,
          worksheetConfig: wsConfig,
          textElement: {
            ...curr.textElement,
            title: `Lembar Latihan #${curr.pageNumber}`,
            instructions: 'Selesaikan soal latihan di bawah ini.',
          },
        };
      } else if (type === 'maze') {
        const mCfg = curr.mazeConfig || {
          rows: 18,
          cols: 18,
          algorithm: 'recursive-backtracker',
          difficulty: curr.difficulty || 'medium',
          wallThickness: 3,
          wallColor: '#1e293b',
          solutionColor: '#ef4444',
          startIcon: '🚀',
          finishIcon: '🪐',
          startCorner: 'topLeft',
          finishCorner: 'bottomRight',
          seed: Math.floor(Math.random() * 100000),
        };
        const genM = generateMaze(mCfg);
        updated = {
          ...updated,
          mazeConfig: mCfg,
          solutionPath: genM.solutionPath,
          textElement: {
            ...curr.textElement,
            title: `Misi Labirin #${curr.pageNumber}`,
            instructions: 'Bantu sang penjelajah mencari jalan menuju garis akhir!',
          },
        };
      }

      nextPages[activePageIndex] = updated;
      return { ...prev, pages: nextPages };
    });

    if (type === 'wordsearch') setSelectedElement('wordsearch');
    else if (type === 'sudoku') setSelectedElement('sudoku');
    else if (type === 'worksheet') setSelectedElement('worksheet');
    else setSelectedElement('maze');
  };

  // Add Page (Injects new empty state object without triggering default puzzle generation)
  const handleAddPage = (type: PuzzleType | 'custom' = 'custom', sectionId?: string, role?: PageRole) => {
    let newIndex = 0;
    setProject((prev) => {
      const nextNum = prev.pages.length + 1;
      newIndex = prev.pages.length;
      let newPage: BookPage;

      const pageRole: PageRole = role || (sectionId === 'sec_front' ? 'front_matter' : sectionId === 'sec_solutions' ? 'solutions' : 'body');
      const pageSecId: string = sectionId || (pageRole === 'front_matter' ? 'sec_front' : pageRole === 'solutions' ? 'sec_solutions' : 'sec_body');

      if (type === 'custom') {
        newPage = {
          id: `p_${Date.now()}`,
          pageNumber: nextNum,
          title: `Halaman Kosong #${nextNum}`,
          puzzleType: 'custom',
          difficulty: 'easy',
          role: pageRole,
          sectionId: pageSecId,
          borderStyle: 'rounded',
          borderColor: '#334155',
          textElement: {
            id: `t_${Date.now()}`,
            title: `HALAMAN KOSONG #${nextNum}`,
            subtitle: 'Mulai Desain Anda',
            instructions: 'Seret elemen dari sidebar untuk mulai.',
            footerStory: '',
            fontFamily: 'sans',
            titleSize: 22,
            align: 'center',
          },
        };
      } else if (type === 'wordsearch') {
        const wsCfg = {
          gridSize: 12,
          words: ['EXPLORE', 'JOURNEY', 'DISCOVER', 'MAP', 'COMPASS', 'ISLAND'],
          theme: 'Adventure',
          difficulty: 'medium' as const,
          allowDiagonal: true,
          allowReverse: true,
        };
        const genWs = generateWordSearch(wsCfg);
        newPage = {
          id: `p_${Date.now()}`,
          pageNumber: nextNum,
          title: `Pencarian Kata #${nextNum}`,
          puzzleType: 'wordsearch',
          difficulty: 'medium',
          wordSearchConfig: wsCfg,
          wordSearchGrid: {
            grid: genWs.grid,
            placedWords: genWs.placedWords,
          },
          textElement: {
            id: `t_${Date.now()}`,
            title: `Pencarian Kata #${nextNum}`,
            subtitle: 'Temukan Kata Tersembunyi',
            instructions: 'Temukan kata-kata di kotak huruf berikut!',
            footerStory: '"Penglihatanmu sangat tajam!"',
            fontFamily: 'sans',
            titleSize: 22,
            align: 'center',
          },
          borderStyle: 'rounded',
          borderColor: '#334155',
        };
      } else if (type === 'sudoku') {
        const sCfg = { difficulty: 'medium' as const, givensCount: 30 };
        const genSudoku = generateSudoku(sCfg);
        newPage = {
          id: `p_${Date.now()}`,
          pageNumber: nextNum,
          title: `Sudoku #${nextNum}`,
          puzzleType: 'sudoku',
          difficulty: 'medium',
          sudokuConfig: sCfg,
          sudokuBoard: genSudoku,
          textElement: {
            id: `t_${Date.now()}`,
            title: `Sudoku Logika #${nextNum}`,
            subtitle: 'Tingkat Sedang',
            instructions: 'Isi angka 1 sampai 9 di setiap kotak tanpa kembar!',
            footerStory: '"Konsentrasi tinggi membawamu pada kemenangan!"',
            fontFamily: 'sans',
            titleSize: 22,
            align: 'center',
          },
          borderStyle: 'simple',
          borderColor: '#334155',
        };
      } else if (type === 'worksheet') {
        const wsConfig = {
          subject: 'math' as const,
          topic: 'Speed & Time Challenge',
          grade: 'Grade 3',
          instructions: 'Hitung dan tuliskan jawabanmu di tempat yang tersedia.',
          questions: [
            { id: '1', q: '25 + 37 = ?', a: '62' },
            { id: '2', q: '90 - 45 = ?', a: '45' },
            { id: '3', q: '8 × 4 = ?', a: '32' },
            { id: '4', q: '54 ÷ 6 = ?', a: '9' },
          ],
        };
        newPage = {
          id: `p_${Date.now()}`,
          pageNumber: nextNum,
          title: `Lembar Latihan #${nextNum}`,
          puzzleType: 'worksheet',
          difficulty: 'medium',
          worksheetConfig: wsConfig,
          textElement: {
            id: `t_${Date.now()}`,
            title: `Lembar Latihan #${nextNum}`,
            subtitle: 'Skill Practice',
            instructions: 'Selesaikan soal berikut dengan benar.',
            footerStory: '"Usaha terbaikmu membuahkan hasil nyata!"',
            fontFamily: 'sans',
            titleSize: 22,
            align: 'center',
          },
          borderStyle: 'rounded',
          borderColor: '#334155',
        };
      } else {
        // Maze
        const mCfg = {
          rows: 18,
          cols: 18,
          algorithm: 'recursive-backtracker' as const,
          difficulty: 'medium' as const,
          wallThickness: 3,
          wallColor: '#1e293b',
          solutionColor: '#ef4444',
          startIcon: '🚀',
          finishIcon: '🪐',
          startCorner: 'topLeft' as const,
          finishCorner: 'bottomRight' as const,
          seed: Math.floor(Math.random() * 100000),
        };
        const gen = generateMaze(mCfg);
        newPage = {
          id: `p_${Date.now()}`,
          pageNumber: nextNum,
          title: `Labirin Tantangan #${nextNum}`,
          puzzleType: 'maze',
          difficulty: 'medium',
          mazeConfig: mCfg,
          solutionPath: gen.solutionPath,
          textElement: {
            id: `t_${Date.now()}`,
            title: `Labirin Tantangan #${nextNum}`,
            subtitle: 'Tingkat Sedang',
            instructions: 'Bantu sang penjelajah mencari jalan menuju garis akhir!',
            footerStory: '"Petualangan yang luar biasa!"',
            fontFamily: 'serif',
            titleSize: 22,
            align: 'center',
          },
          borderStyle: 'rounded',
          borderColor: '#334155',
        };
      }

      const rawNext = [...prev.pages, newPage];
      const recalculated = calculateBookPagination(rawNext, prev.sections, prev.bookSettings);
      pushHistory(recalculated.pages);
      return {
        ...prev,
        pages: recalculated.pages,
      };
    });

    setActivePageIndex(newIndex);
    setSelectedId(null);
    setSelectedElement('page');
  };

  // Duplicate Page
  const handleDuplicatePage = (idx: number) => {
    setProject((prev) => {
      const target = prev.pages[idx];
      const dup: BookPage = {
        ...target,
        id: `p_${Date.now()}`,
        pageNumber: idx + 2,
        title: `${target.title} (Salinan)`,
        elements: target.elements ? JSON.parse(JSON.stringify(target.elements)) : ensurePageElements(target),
      };
      const rawNext = [...prev.pages];
      rawNext.splice(idx + 1, 0, dup);
      const recalculated = calculateBookPagination(rawNext, prev.sections, prev.bookSettings);
      pushHistory(recalculated.pages);
      return { ...prev, pages: recalculated.pages };
    });
    setActivePageIndex(idx + 1);
    setSelectedId(null);
  };

  // Delete Page
  const handleDeletePage = (idx: number) => {
    if (project.pages.length <= 1) return;
    setProject((prev) => {
      const rawNext = prev.pages.filter((_, i) => i !== idx);
      const recalculated = calculateBookPagination(rawNext, prev.sections, prev.bookSettings);
      pushHistory(recalculated.pages);
      return { ...prev, pages: recalculated.pages };
    });
    setActivePageIndex((prev) => Math.max(0, prev - 1));
  };

  // Move Page
  const handleMovePage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= project.pages.length) return;
    setProject((prev) => {
      const rawNext = [...prev.pages];
      const [item] = rawNext.splice(fromIdx, 1);
      rawNext.splice(toIdx, 0, item);
      const recalculated = calculateBookPagination(rawNext, prev.sections, prev.bookSettings);
      pushHistory(recalculated.pages);
      return { ...prev, pages: recalculated.pages };
    });
    setActivePageIndex(toIdx);
  };

  // Compile Solutions Automatically (Phase 4 of BOOK Domain)
  const handleCompileSolutions = () => {
    setProject((prev) => {
      const compilation = compileSolutionsForBook(prev);
      const recalculated = calculateBookPagination(
        compilation.updatedPages,
        prev.sections,
        prev.bookSettings
      );
      pushHistory(recalculated.pages);
      return {
        ...prev,
        pages: recalculated.pages,
      };
    });
  };

  // Update Book Settings (Phase 2 Pagination Engine)
  const handleUpdateBookSettings = (settings: BookSettings) => {
    setProject((prev) => {
      const recalculated = calculateBookPagination(
        prev.pages,
        prev.sections,
        settings
      );
      return {
        ...prev,
        bookSettings: settings,
        metadata: {
          ...prev.metadata,
          pagination: settings.pagination,
        },
        pages: recalculated.pages,
      };
    });
  };

  // Quick PDF Export
  const handleQuickExportPdf = async () => {
    await exportBookToPdf(project.metadata, project.pages, {
      includeSolutions: true,
      grayscaleForPrinting: false,
    });
  };

  // Auto-Fix Margins to KDP Standards
  const handleAutoFixMargins = () => {
    let safeGutter = 9.5;
    if (project.pages.length > 150 && project.pages.length <= 300) safeGutter = 12.7;
    else if (project.pages.length > 300) safeGutter = 15.9;
    else safeGutter = 20; // safe generous gutter

    setProject((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        bleed: true,
        margins: {
          topMm: 15,
          bottomMm: 15,
          insideMm: safeGutter,
          outsideMm: 15,
        },
      },
    }));
  };

  // Quick Batch Presets (from Dashboard)
  const handleNewBatchPreset = (preset: 'maze50' | 'worksheet25' | 'sudoku50' | 'mixed50') => {
    const count = preset === 'worksheet25' ? 25 : 50;
    const pages: BookPage[] = [];

    for (let i = 1; i <= count; i++) {
      const diff = i <= count * 0.35 ? 'easy' : i <= count * 0.75 ? 'medium' : 'hard';

      if (preset === 'maze50') {
        const rows = diff === 'easy' ? 15 : diff === 'medium' ? 20 : 25;
        const mCfg = {
          rows,
          cols: rows,
          algorithm: 'recursive-backtracker' as const,
          difficulty: diff as any,
          wallThickness: 3,
          wallColor: '#1e293b',
          solutionColor: '#ef4444',
          startIcon: i % 2 === 0 ? '🚀' : '🏃',
          finishIcon: i % 2 === 0 ? '🪐' : '🏆',
          startCorner: 'topLeft' as const,
          finishCorner: 'bottomRight' as const,
          seed: 4000 + i * 31,
        };
        const gen = generateMaze(mCfg);
        pages.push({
          id: `preset_p_${i}`,
          pageNumber: i,
          title: `Labirin Kosmik #${i}`,
          puzzleType: 'maze',
          difficulty: diff as any,
          mazeConfig: mCfg,
          solutionPath: gen.solutionPath,
          textElement: {
            id: `preset_t_${i}`,
            title: `Labirin Kosmik #${i}`,
            subtitle: `Tingkat ${diff.toUpperCase()}`,
            instructions: 'Bantu astronot menemukan jalur aman melewati rintangan!',
            footerStory: `"Halaman ${i} dituntaskan dengan gemilang!"`,
            fontFamily: 'serif',
            titleSize: 22,
            align: 'center',
          },
          borderStyle: 'rounded',
          borderColor: '#334155',
        });
      } else if (preset === 'worksheet25') {
        pages.push({
          id: `preset_p_${i}`,
          pageNumber: i,
          title: `Lembar Hitung Sains #${i}`,
          puzzleType: 'worksheet',
          difficulty: diff as any,
          worksheetConfig: {
            subject: 'math',
            topic: `Misi Perhitungan #${i}`,
            grade: 'Grade 3-4',
            instructions: 'Kerjakan soal di bawah ini dengan tepat.',
            questions: [
              { id: '1', q: `${i * 4} + ${i * 6} = ?`, a: `${i * 10}` },
              { id: '2', q: `${120 - i * 2} - 25 = ?`, a: `${95 - i * 2}` },
              { id: '3', q: `${i} × 7 = ?`, a: `${i * 7}` },
              { id: '4', q: `Setengah dari ${i * 16} adalah?`, a: `${i * 8}` },
            ],
          },
          textElement: {
            id: `preset_t_${i}`,
            title: `Lembar Hitung Sains #${i}`,
            subtitle: 'STEM Math • Latihan Berpikir',
            instructions: 'Selesaikan latihan matematika navigasi ini.',
            footerStory: '"Logika pikiranmu semakin tajam!"',
            fontFamily: 'sans',
            titleSize: 20,
            align: 'center',
          },
          borderStyle: 'rounded',
          borderColor: '#334155',
        });
      } else if (preset === 'sudoku50') {
        const sCfg = {
          difficulty: diff as any,
          givensCount: diff === 'easy' ? 36 : diff === 'medium' ? 30 : 24,
        };
        const genS = generateSudoku(sCfg);
        pages.push({
          id: `preset_p_${i}`,
          pageNumber: i,
          title: `Pocket Sudoku #${i}`,
          puzzleType: 'sudoku',
          difficulty: diff as any,
          sudokuConfig: sCfg,
          sudokuBoard: genS,
          textElement: {
            id: `preset_t_${i}`,
            title: `Pocket Sudoku #${i}`,
            subtitle: `Level ${diff.toUpperCase()}`,
            instructions: 'Isi angka 1 sampai 9 di setiap baris, kolom, dan kotak 3x3!',
            footerStory: '"Fokus dan ketelitian membawamu menang!"',
            fontFamily: 'sans',
            titleSize: 22,
            align: 'center',
          },
          borderStyle: 'simple',
          borderColor: '#334155',
        });
      } else {
        // Mixed
        const mod = i % 3;
        const pType = mod === 1 ? 'maze' : mod === 2 ? 'wordsearch' : 'sudoku';
        pages.push({
          id: `preset_p_${i}`,
          pageNumber: i,
          title: `Aktivitas Seru #${i}`,
          puzzleType: pType as any,
          difficulty: diff as any,
          mazeConfig:
            pType === 'maze'
              ? {
                  rows: 18,
                  cols: 18,
                  algorithm: 'recursive-backtracker',
                  difficulty: diff as any,
                  wallThickness: 3,
                  wallColor: '#1e293b',
                  solutionColor: '#ef4444',
                  startIcon: '🚀',
                  finishIcon: '🪐',
                  startCorner: 'topLeft',
                  finishCorner: 'bottomRight',
                  seed: 7000 + i,
                }
              : undefined,
          textElement: {
            id: `preset_t_${i}`,
            title: `Aktivitas Seru #${i}`,
            subtitle: `${pType.toUpperCase()} Challenge`,
            instructions: 'Selesaikan tantangan ini untuk lanjut ke misi berikutnya!',
            footerStory: '"Kamu berhasil menyelesaikan tantangan ini!"',
            fontFamily: 'sans',
            titleSize: 22,
            align: 'center',
          },
          borderStyle: 'rounded',
          borderColor: '#334155',
        });
      }
    }

    setProject((prev) => ({
      ...prev,
      pages,
    }));
    setActivePageIndex(0);
    setActiveView('studio');
  };

  return (
    <div className="h-screen w-screen flex flex-col antialiased overflow-hidden select-none bg-slate-950 text-slate-100 font-sans">
      {/* 1. TOP BAR (REFRACTOR #2 & #5) */}
      <Header
        project={project}
        onUpdateProjectName={(name) =>
          setProject((prev) => ({ ...prev, metadata: { ...prev.metadata, name } }))
        }
        canUndo={commandManagerRef.current.canUndo() || historyIndex > 0}
        canRedo={commandManagerRef.current.canRedo() || historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAddNewPage={() => handleAddPage('custom')}
        onDuplicateCurrentPage={() => handleDuplicatePage(activePageIndex)}
        onResetCurrentPage={() => handleConvertCurrentPageType(currentPage.puzzleType)}
        onQuickExportPdf={handleQuickExportPdf}
        onDirectPrint={() => window.print()}
        onOpenPageSetup={handleOpenPageSetup}
        focusMode={focusMode}
        onToggleFocusMode={() => setFocusMode(!focusMode)}
        onOpenKdpModal={() => setKdpModalOpen(true)}
        onOpenBatchModal={() => setBatchModalOpen(true)}
        onOpenAssetModal={() => setAssetModalOpen(true)}
        onOpenAiModal={() => setAiModalOpen(true)}
        onOpenDownloadModal={() => setDownloadModalOpen(true)}
      />

      {/* 2. MAIN WORKSPACE BODY - ALWAYS PRESERVES CANVAS BEHIND TOOLS (REFRACTOR #1) */}
      {activeView === 'cover' ? (
        <CoverWorkspace
          metadata={project.metadata}
          totalPages={project.pages.length}
          cover={coverProject}
          onUpdateCover={(update) => setCoverProject((prev) => ({ ...prev, ...update }))}
          onSwitchToInterior={() => setActiveView('studio')}
        />
      ) : activeView === 'book-structure' ? (
        <div className="flex-1 flex overflow-hidden bg-slate-950 p-4 md:p-6">
          <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <BookBuilderView
              project={project}
              onSelectPageAndOpenStudio={(idx) => {
                setActivePageIndex(idx);
                setActiveView('studio');
              }}
              onAddPage={(role, sectionId) => handleAddPage('custom', sectionId, role)}
              onDuplicatePage={handleDuplicatePage}
              onDeletePage={handleDeletePage}
              onMovePage={handleMovePage}
              onCompileSolutions={handleCompileSolutions}
              onUpdateBookSettings={handleUpdateBookSettings}
              onOpenKdpModal={() => setKdpModalOpen(true)}
              onCloseToStudio={() => setActiveView('studio')}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar (Hidden in Focus Mode) */}
          {!focusMode && (
            <LeftSidebar
              pages={project.pages}
              activePageIndex={activePageIndex}
              onSelectPage={handleSelectPage}
              onAddPage={handleAddPage}
              onDuplicatePage={handleDuplicatePage}
              onDeletePage={handleDeletePage}
              onMovePage={handleMovePage}
              onOpenCover={() => setActiveView('cover')}
              onOpenBookStructure={() => setActiveView('book-structure')}
              onSelectContext={setSelectedElement}
              onConvertCurrentPageType={handleConvertCurrentPageType}
              onApplyClipartToPage={(emoji) => {
                const newImageEl: CanvasElement = {
                  id: `img-${Date.now()}`,
                  type: 'image',
                  content: emoji,
                  x: 165,
                  y: 180,
                  width: 100,
                  height: 100,
                  opacity: 1,
                  flipHorizontal: false,
                };
                handleUpdateElements((prev) => [...prev, newImageEl], 'Tambah Clipart');
                setSelectedId(newImageEl.id);
                setSelectedElement('assets');
              }}
              onApplyBorderStyle={handleUpdateBorderStyle}
              onAddElement={(elData) => {
                const newEl: CanvasElement = {
                  id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  type: elData.type || 'text',
                  subType: elData.subType,
                  x: 85,
                  y: elData.y ?? 120,
                  width: elData.width || 250,
                  height: elData.height || 60,
                  content: elData.content || '',
                  fontSize: elData.fontSize || 18,
                  color: elData.color || '#0f172a',
                  textAlign: elData.textAlign || 'center',
                  opacity: 1,
                  flipHorizontal: false,
                  ...elData,
                };
                handleUpdateElements((prev) => [...prev, newEl], `Tambah ${newEl.type}`);
                setSelectedId(newEl.id);
                if (newEl.type === 'text') setSelectedElement('text');
                else if (newEl.type === 'image') setSelectedElement('assets');
                else if (newEl.type === 'puzzle') {
                  if (newEl.subType === 'labirin') setSelectedElement('maze');
                  else if (newEl.subType === 'word-search') setSelectedElement('wordsearch');
                  else if (newEl.subType === 'sudoku') setSelectedElement('sudoku');
                  else setSelectedElement('worksheet');
                }
              }}
            />
          )}

          {/* Center Canvas (The WYSIWYG Workspace - Focal Point 60%) */}
          <CanvasWorkspace
            page={currentPage}
            metadata={project.metadata}
            activePageIndex={activePageIndex}
            totalPages={project.pages.length}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            selectedElement={selectedElement}
            onSelectContext={setSelectedElement}
            elements={currentElements}
            selectedId={selectedId}
            selectedIds={selectedIds}
            onSelectIds={setSelectedIds}
            onSelectId={(id) => {
              setSelectedIds(id ? [id] : []);
              if (!id) {
                setSelectedElement('page');
                return;
              }
              const foundEl = currentElements.find((el) => el.id === id);
              if (foundEl?.type === 'text') {
                setSelectedElement('text');
              } else if (foundEl?.type === 'image') {
                setSelectedElement('assets');
              } else if (foundEl?.type === 'group') {
                setSelectedElement('page');
              } else if (foundEl?.type === 'puzzle') {
                const pType = currentPage.puzzleType;
                setSelectedElement(
                  pType === 'maze'
                    ? 'maze'
                    : pType === 'wordsearch'
                    ? 'wordsearch'
                    : pType === 'sudoku'
                    ? 'sudoku'
                    : 'worksheet'
                );
              }
            }}
            onUpdateElements={handleUpdateElements}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onUpdatePageTitle={(title) => handleUpdateTextElement({ title })}
            onUpdatePageInstructions={(instructions) =>
              handleUpdateTextElement({ instructions })
            }
            onUpdatePageFooter={(footerStory) => handleUpdateTextElement({ footerStory })}
            onNavigatePage={handleSelectPage}
            onOpenPrepressSetup={() => setKdpModalOpen(true)}
            onOpenPageSetup={handleOpenPageSetup}
            onUpdateMazeConfig={handleUpdateMazeConfig}
            onUpdateWordSearchConfig={handleUpdateWordSearchConfig}
            onUpdateSudokuConfig={handleUpdateSudokuConfig}
            onUpdateWorksheetConfig={handleUpdateWorksheetConfig}
            onUpdateTextElement={handleUpdateTextElement}
            onRegenerateMaze={handleRegenerateMaze}
            onRegenerateWordSearch={handleRegenerateWordSearch}
            onRegenerateSudoku={handleRegenerateSudoku}
            onUpdateMetadata={(update) =>
              setProject((prev) => ({ ...prev, metadata: { ...prev.metadata, ...update } }))
            }
          />

          {/* Right Panel: Context Inspector (Document Setup when idle, Element Properties when selected) */}
          {!focusMode && (
            <ContextInspector
              page={currentPage}
              metadata={project.metadata}
              totalPages={project.pages.length}
              activeElement={currentElements.find((el) => el.id === selectedId) || null}
              selectedIds={selectedIds}
              selectedElement={selectedElement}
              onSelectContext={setSelectedElement}
              onUpdateCanvasElement={handleUpdateCanvasElement}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onAlignElements={handleAlignElements}
              onDistributeElements={handleDistributeElements}
              onGroupMultipleElements={handleGroupMultipleElements}
              onDeleteMultipleElements={handleDeleteMultipleElements}
              onDuplicateMultipleElements={handleDuplicateMultipleElements}
              onOpenPageSetup={handleOpenPageSetup}
              onUpdateMazeConfig={handleUpdateMazeConfig}
              onUpdateWordSearchConfig={handleUpdateWordSearchConfig}
              onUpdateSudokuConfig={handleUpdateSudokuConfig}
              onUpdateWorksheetConfig={handleUpdateWorksheetConfig}
              onUpdateTextElement={handleUpdateTextElement}
              onUpdateBorderStyle={handleUpdateBorderStyle}
              onRegenerateMaze={handleRegenerateMaze}
              onRegenerateWordSearch={handleRegenerateWordSearch}
              onRegenerateSudoku={handleRegenerateSudoku}
            />
          )}

          {/* Focus Mode Floating Badge & Exit Shortcut (REFRACTOR #8) */}
          {focusMode && (
            <div className="absolute top-4 right-4 z-40">
              <button
                onClick={() => setFocusMode(false)}
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 backdrop-blur transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span>Mode Fokus Aktif</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                  Tab / Esc
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= 3. WORKSPACE TOOLS AS OVERLAYS/DRAWERS (REFRACTOR #1) ================= */}
      {/* PRIMARY OWNER: Page Setup & Document Settings Modal (Single Source of Truth) */}
      <PageSetupModal
        isOpen={pageSetupOpen}
        onClose={() => setPageSetupOpen(false)}
        metadata={project.metadata}
        totalPages={project.pages.length}
        onUpdateMetadata={(update) =>
          setProject((prev) => ({ ...prev, metadata: { ...prev.metadata, ...update } }))
        }
      />

      {/* Tool A: KDP Pre-Press Toolkit Modal */}
      <KdpToolkitModal
        project={project}
        isOpen={kdpModalOpen}
        onClose={() => setKdpModalOpen(false)}
        onAutoFixMargins={handleAutoFixMargins}
        onUpdateMetadata={(update) =>
          setProject((prev) => ({ ...prev, metadata: { ...prev.metadata, ...update } }))
        }
      />

      {/* Tool B: Batch Puzzle Generator Modal */}
      <BatchGeneratorModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onBatchGenerated={(newPages) => {
          setProject((prev) => ({
            ...prev,
            pages: newPages,
          }));
          setActivePageIndex(0);
        }}
      />

      {/* Tool C: Asset Library Drawer / Modal Overlay */}
      <AssetLibraryView
        isOpen={assetModalOpen}
        currentPage={currentPage}
        onApplyAssetToPage={(asset, role) => {
          if (role === 'start') handleUpdateMazeConfig({ startIcon: asset.emoji });
          else if (role === 'finish') handleUpdateMazeConfig({ finishIcon: asset.emoji });
        }}
        onApplyBorderToPage={handleUpdateBorderStyle}
        onClose={() => setAssetModalOpen(false)}
      />

      {/* Tool D: AI Assistant Drawer / Modal Overlay */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApplyGeneratedTextToCurrentPage={(text) => handleUpdateTextElement(text)}
      />

      {/* Tool E: Download Center Modal */}
      <DownloadCenterModal
        project={project}
        currentPage={currentPage}
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />

      {/* Welcome / Startup Project Launcher Modal */}
      <WelcomeModal
        isOpen={welcomeModalOpen}
        onClose={() => setWelcomeModalOpen(false)}
        onSelectBlank={() => {
          handleSelectBlankProject();
          setWelcomeModalOpen(false);
        }}
        onSelectTemplate={() => {
          handleSelectTemplateProject();
          setWelcomeModalOpen(false);
        }}
        onSelectBookBuilder={() => {
          setWelcomeModalOpen(false);
          setActiveView('book-structure');
        }}
      />
    </div>
  );
}
