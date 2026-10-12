import { ElementDefinition, PropertyFieldSchema, PdfRenderContext, ObjectCapabilities } from './types';
import { CanvasElement } from '../types';
import { generateMaze } from '../utils/mazeGenerator';
import { resolvePdfFont } from '../fonts/fontResolver';

class ElementRegistryClass {
  private definitions: Map<string, ElementDefinition> = new Map();

  register(definition: ElementDefinition) {
    const key = this.getKey(definition.type, definition.subType);
    this.definitions.set(key, definition);
  }

  get(type: string, subType?: string): ElementDefinition | undefined {
    const specificKey = this.getKey(type, subType);
    if (this.definitions.has(specificKey)) {
      return this.definitions.get(specificKey);
    }
    if (type === 'puzzle' && !subType) {
      return this.definitions.get('puzzle:labirin');
    }
    return this.definitions.get(this.getKey(type));
  }

  getAll(): ElementDefinition[] {
    return Array.from(this.definitions.values());
  }

  private getKey(type: string, subType?: string): string {
    return subType ? `${type}:${subType}` : type;
  }
}

export const ElementRegistry = new ElementRegistryClass();

// ============================================================================
// 1. TEXT ELEMENT DEFINITION (With polymorphic PDF renderer & validation)
// ============================================================================
ElementRegistry.register({
  type: 'text',
  title: 'Teks Tipografi',
  category: 'text',
  capabilities: {
    canLock: true,
    canDuplicate: true,
    canDelete: true,
    canReorder: true,
    canGroup: true,
    canRotate: true,
    canFlipHorizontal: false,
    canAdjustOpacity: false,
    hasTypography: true,
    hasProceduralEngine: false,
    hasStrokeConfig: false,
    hasFillConfig: false,
    supportsSolutionKey: false,
  },
  propertySchema: [
    {
      key: 'content',
      label: 'Isi Teks',
      type: 'textarea',
      group: 'Konten',
      description: 'Teks yang ditampilkan pada halaman',
      validate: (val) => {
        if (!val || String(val).trim().length === 0) {
          return 'Teks tidak boleh kosong.';
        }
        return undefined;
      },
    },
    {
      key: 'fontFamily',
      label: 'Keluarga Font',
      type: 'select',
      group: 'Tipografi',
      options: [
        { label: 'Canva Sans (Sans-Serif)', value: 'sans' },
        { label: 'Serif Classic (Times Roman)', value: 'serif' },
        { label: 'Comic Playful (Comic Neue)', value: 'comic' },
        { label: 'Monospace (Courier)', value: 'mono' },
      ],
    },
    {
      key: 'fontSize',
      label: 'Ukuran Font',
      type: 'slider',
      group: 'Tipografi',
      min: 8,
      max: 72,
      step: 1,
      unit: 'px',
    },
    {
      key: 'textAlign',
      label: 'Perataan Teks',
      type: 'select',
      group: 'Tipografi',
      options: [
        { label: 'Rata Kiri', value: 'left' },
        { label: 'Rata Tengah', value: 'center' },
        { label: 'Rata Kanan', value: 'right' },
      ],
    },
    {
      key: 'fontWeight',
      label: 'Ketebalan Font',
      type: 'select',
      group: 'Tipografi',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Bold', value: 'bold' },
      ],
    },
    {
      key: 'fontStyle',
      label: 'Gaya Font',
      type: 'select',
      group: 'Tipografi',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Italic', value: 'italic' },
      ],
    },
    {
      key: 'lineHeight',
      label: 'Tinggi Baris (Line Height)',
      type: 'slider',
      group: 'Tipografi',
      min: 1.0,
      max: 2.5,
      step: 0.1,
    },
    {
      key: 'letterSpacing',
      label: 'Jarak Huruf (Letter Spacing)',
      type: 'slider',
      group: 'Tipografi',
      min: 0,
      max: 10,
      step: 1,
      unit: 'px',
    },
    {
      key: 'textTransform',
      label: 'Transformasi Huruf (Kapital)',
      type: 'select',
      group: 'Tipografi',
      options: [
        { label: 'Normal', value: 'none' },
        { label: 'Huruf Kapital (UPPERCASE)', value: 'uppercase' },
        { label: 'Huruf Kecil (lowercase)', value: 'lowercase' },
        { label: 'Kapital Kata (Capitalize)', value: 'capitalize' },
      ],
    },
    {
      key: 'color',
      label: 'Warna Teks',
      type: 'color',
      group: 'Tampilan',
    },
    {
      key: 'rotation',
      label: 'Rotasi',
      type: 'slider',
      group: 'Transformasi',
      min: 0,
      max: 360,
      step: 5,
      unit: '°',
    },
    {
      key: 'isLocked',
      label: 'Kunci Posisi',
      type: 'toggle',
      group: 'Pengaturan',
    },
  ],
  createDefault: (opts) => ({
    id: `el-text-${Date.now()}`,
    type: 'text',
    x: opts?.x ?? 50,
    y: opts?.y ?? 50,
    width: opts?.width ?? 320,
    height: opts?.height ?? 48,
    content: 'Teks Judul Baru',
    fontSize: 20,
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 1.2,
    letterSpacing: 0,
    textTransform: 'none',
    rotation: 0,
    isLocked: false,
  }),
  renderPdf: (element, ctx: PdfRenderContext) => {
    const { doc, xMm, yMm, widthMm, page } = ctx;
    let rawText = element.content || 'Text';
    if (element.textTransform === 'uppercase') rawText = rawText.toUpperCase();
    else if (element.textTransform === 'lowercase') rawText = rawText.toLowerCase();
    else if (element.textTransform === 'capitalize') {
      rawText = rawText.replace(/\b\w/g, (l) => l.toUpperCase());
    }

    const fontSize = element.fontSize ? element.fontSize * 0.75 : 14;
    
    // Paritas Font (E1): Sesuaikan keluarga font dan gaya (weight & style)
    const activeFamily = element.fontFamily || page?.textElement?.fontFamily || 'sans';
    const { fontName, fontStyle } = resolvePdfFont(
      activeFamily,
      element.fontWeight || 'bold',
      element.fontStyle || 'normal'
    );
    doc.setFont(fontName, fontStyle);
    doc.setFontSize(fontSize);

    // Terapkan warna teks jika ada
    if (element.color && element.color.startsWith('#') && element.color.length === 7) {
      const hex = element.color.slice(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      doc.setTextColor(r, g, b);
    } else {
      doc.setTextColor(15, 23, 42);
    }

    const align = element.textAlign || 'center';
    let textX = xMm;
    if (align === 'center') textX = xMm + widthMm / 2;
    else if (align === 'right') textX = xMm + widthMm;

    doc.text(String(rawText), textX, yMm + (fontSize * 0.35), { align });
  },
});

// ============================================================================
// 2. IMAGE / CLIPART ELEMENT DEFINITION (E3: Unggah PNG/JPG, Rotasi, Paritas PDF 300 DPI)
// ============================================================================
ElementRegistry.register({
  type: 'image',
  title: 'Aset Gambar / Clipart',
  category: 'graphics',
  capabilities: {
    canLock: true,
    canDuplicate: true,
    canDelete: true,
    canReorder: true,
    canGroup: true,
    canRotate: true,
    canFlipHorizontal: true,
    canAdjustOpacity: true,
    hasTypography: false,
    hasProceduralEngine: false,
    hasStrokeConfig: false,
    hasFillConfig: false,
    supportsSolutionKey: false,
  },
  propertySchema: [
    {
      key: 'content',
      label: 'Simbol / Emoji Clipart',
      type: 'text',
      group: 'Aset',
    },
    {
      key: 'opacity',
      label: 'Transparansi',
      type: 'slider',
      group: 'Tampilan',
      min: 0.1,
      max: 1.0,
      step: 0.05,
    },
    {
      key: 'flipHorizontal',
      label: 'Cermin Horizontal',
      type: 'toggle',
      group: 'Transformasi',
    },
    {
      key: 'rotation',
      label: 'Rotasi',
      type: 'slider',
      group: 'Transformasi',
      min: 0,
      max: 360,
      step: 5,
      unit: '°',
    },
    {
      key: 'isLocked',
      label: 'Kunci Posisi',
      type: 'toggle',
      group: 'Pengaturan',
    },
  ],
  createDefault: (opts) => ({
    id: `el-img-${Date.now()}`,
    type: 'image',
    x: opts?.x ?? 80,
    y: opts?.y ?? 80,
    width: opts?.width ?? 100,
    height: opts?.height ?? 100,
    content: '⭐',
    opacity: 1,
    flipHorizontal: false,
    rotation: 0,
    isLocked: false,
  }),
  renderPdf: (element, ctx: PdfRenderContext) => {
    const { doc, xMm, yMm, widthMm, heightMm } = ctx;
    if (element.imageUrl) {
      try {
        const format = element.imageUrl.includes('image/jpeg') ? 'JPEG' : 'PNG';
        doc.addImage(element.imageUrl, format, xMm, yMm, widthMm, heightMm, undefined, 'FAST');

        // Peringatan DPI efektif (< 300 DPI pada ukuran cetak)
        const widthInches = widthMm / 25.4;
        const estimatedPixels = 900; // default estimated pixel width
        const effectiveDpi = estimatedPixels / widthInches;
        if (effectiveDpi < 300) {
          console.warn(`[KDP Print Warning] Resolusi efektif gambar (${effectiveDpi.toFixed(0)} DPI) di bawah 300 DPI.`);
        }
      } catch (err) {
        console.error('Gagal merender gambar ke PDF:', err);
      }
    } else if (element.content) {
      doc.setFontSize(Math.min(widthMm, heightMm) * 1.5);
      doc.text(element.content, xMm + widthMm / 2, yMm + heightMm / 2 + 2, { align: 'center' });
    }
  },
});

// ============================================================================
// 3. PUZZLE: LABIRIN (MAZE) DEFINITION (Polymorphic Vector PDF & Cross-field Validation)
// ============================================================================
ElementRegistry.register({
  type: 'puzzle',
  subType: 'labirin',
  title: 'Labirin Vektor (Maze)',
  category: 'puzzle',
  capabilities: {
    canLock: true,
    canDuplicate: true,
    canDelete: true,
    canReorder: true,
    canGroup: true,
    canRotate: false,
    canFlipHorizontal: false,
    canAdjustOpacity: false,
    hasTypography: false,
    hasProceduralEngine: true,
    engineActionLabel: 'Acak Labirin',
    hasStrokeConfig: true,
    hasFillConfig: false,
    supportsSolutionKey: true,
  },
  propertySchema: [
    {
      key: 'mazeConfig.algorithm',
      label: 'Algoritma Labirin',
      type: 'select',
      group: 'Generator',
      options: [
        { label: 'Recursive Backtracker (Standar KDP)', value: 'recursive-backtracker' },
        { label: 'Prim Minimal Spanning', value: 'prim' },
        { label: 'Hunt and Kill (Jalur Panjang)', value: 'hunt-and-kill' },
        { label: 'Binary Tree (Diagonal Bias)', value: 'binary-tree' },
      ],
    },
    {
      key: 'mazeConfig.rows',
      label: 'Jumlah Baris (Tinggi Grid)',
      type: 'slider',
      group: 'Dimensi Grid',
      min: 6,
      max: 40,
      step: 1,
      unit: 'baris',
      validate: (val, element) => {
        const rows = Number(val);
        const cols = element.mazeConfig?.cols || 15;
        if (rows * cols > 1600) {
          return 'Kompleksitas tinggi: total sel melebihi batas cetak optimal anak.';
        }
        return undefined;
      },
    },
    {
      key: 'mazeConfig.cols',
      label: 'Jumlah Kolom (Lebar Grid)',
      type: 'slider',
      group: 'Dimensi Grid',
      min: 6,
      max: 40,
      step: 1,
      unit: 'kolom',
    },
    {
      key: 'mazeConfig.wallThickness',
      label: 'Ketebalan Dinding Vektor',
      type: 'slider',
      group: 'Gaya Garis',
      min: 1,
      max: 8,
      step: 0.5,
      unit: 'pt',
    },
    {
      key: 'mazeConfig.showSolution',
      label: 'Tampilkan Kunci Jawaban',
      type: 'toggle',
      group: 'Output',
    },
  ],
  createDefault: (opts) => ({
    id: `el-maze-${Date.now()}`,
    type: 'puzzle',
    subType: 'labirin',
    x: opts?.x ?? 40,
    y: opts?.y ?? 100,
    width: opts?.width ?? 280,
    height: opts?.height ?? 280,
    mazeConfig: {
      rows: 15,
      cols: 15,
      algorithm: 'recursive-backtracker',
      difficulty: 'medium',
      wallThickness: 2,
      wallColor: '#1e293b',
      solutionColor: '#ef4444',
      startIcon: '🚀',
      finishIcon: '🏁',
      startCorner: 'topLeft',
      finishCorner: 'bottomRight',
      seed: 12345,
    },
    isLocked: false,
  }),
  renderPdf: (element, ctx: PdfRenderContext) => {
    const { doc, xMm, yMm, widthMm, heightMm, page } = ctx;
    const config = element.mazeConfig || page.mazeConfig || {
      rows: 15,
      cols: 15,
      algorithm: 'recursive-backtracker' as const,
      difficulty: 'medium' as const,
      wallThickness: 2,
      wallColor: '#1e293b',
      solutionColor: '#ef4444',
      startIcon: '🚀',
      finishIcon: '🏁',
      startCorner: 'topLeft' as const,
      finishCorner: 'bottomRight' as const,
      seed: 12345,
    };
    const generated = generateMaze(config);
    const { cells } = generated;
    const rows = cells.length;
    const cols = cells[0].length;
    const cellW = widthMm / cols;
    const cellH = heightMm / rows;

    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(Math.max(0.4, (config.wallThickness || 2) * 0.25));

    // Outer border
    doc.rect(xMm, yMm, widthMm, heightMm);

    // Wall lines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = cells[r][c];
        const cx = xMm + c * cellW;
        const cy = yMm + r * cellH;

        if (cell.walls.bottom && r < rows - 1) {
          doc.line(cx, cy + cellH, cx + cellW, cy + cellH);
        }
        if (cell.walls.right && c < cols - 1) {
          doc.line(cx + cellW, cy, cx + cellW, cy + cellH);
        }
      }
    }

    // Solution path vector when effective showSolution is true (F-01 parity)
    const effectiveShowSolution = Boolean(
      element.mazeConfig?.showSolution ?? page.mazeConfig?.showSolution ?? (page.role === 'solutions')
    );
    if (effectiveShowSolution && generated.solutionPath && generated.solutionPath.length > 1) {
      if (ctx.options?.grayscaleForPrinting) {
        doc.setDrawColor(60, 60, 60);
      } else {
        const colorHex = config.solutionColor || '#ef4444';
        const clean = colorHex.replace('#', '');
        let r = 220, g = 38, b = 38;
        if (clean.length === 6) {
          const num = parseInt(clean, 16);
          r = (num >> 16) & 255;
          g = (num >> 8) & 255;
          b = num & 255;
        }
        doc.setDrawColor(r, g, b);
      }
      doc.setLineWidth(Math.max(0.6, (config.wallThickness || 2) * 0.35));
      for (let i = 0; i < generated.solutionPath.length - 1; i++) {
        const [r1, c1] = generated.solutionPath[i];
        const [r2, c2] = generated.solutionPath[i + 1];
        const p1x = xMm + c1 * cellW + cellW / 2;
        const p1y = yMm + r1 * cellH + cellH / 2;
        const p2x = xMm + c2 * cellW + cellW / 2;
        const p2y = yMm + r2 * cellH + cellH / 2;
        doc.line(p1x, p1y, p2x, p2y);
      }
    }

    // Indicators
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('START ➔', xMm + 1, yMm - 1);
    doc.text('🏁 FINISH', xMm + widthMm - 16, yMm + heightMm + 3.5);
  },
});

// ============================================================================
// 4. PUZZLE: WORD SEARCH DEFINITION (With cross-field constraint validation)
// ============================================================================
ElementRegistry.register({
  type: 'puzzle',
  subType: 'word-search',
  title: 'Pencarian Kata (Word Search)',
  category: 'puzzle',
  capabilities: {
    canLock: true,
    canDuplicate: true,
    canDelete: true,
    canReorder: true,
    canGroup: true,
    canRotate: false,
    canFlipHorizontal: false,
    canAdjustOpacity: false,
    hasTypography: false,
    hasProceduralEngine: true,
    engineActionLabel: 'Acak Kisi',
    hasStrokeConfig: false,
    hasFillConfig: false,
    supportsSolutionKey: true,
  },
  propertySchema: [
    {
      key: 'wordSearchConfig.theme',
      label: 'Tema Kata',
      type: 'text',
      group: 'Konten',
      description: 'Tema buku puzzle (misal: Hewan Tropis, Tata Surya)',
    },
    {
      key: 'wordSearchConfig.gridSize',
      label: 'Ukuran Kisi (N x N)',
      type: 'slider',
      group: 'Kisi Huruf',
      min: 8,
      max: 20,
      step: 1,
      unit: 'huruf',
      validate: (val, element) => {
        const size = Number(val);
        const words = element.wordSearchConfig?.words || [];
        const longest = words.reduce((max: number, w: string) => Math.max(max, (w || '').length), 0);
        if (longest > size) {
          return `Grid ${size}x${size} terlalu kecil untuk kata terpanjang (${longest} huruf).`;
        }
        return undefined;
      },
    },
    {
      key: 'wordSearchConfig.allowDiagonal',
      label: 'Ijinkan Penempatan Diagonal',
      type: 'toggle',
      group: 'Tingkat Kesulitan',
    },
    {
      key: 'wordSearchConfig.allowReverse',
      label: 'Ijinkan Kata Terbalik',
      type: 'toggle',
      group: 'Tingkat Kesulitan',
    },
  ],
  createDefault: (opts) => ({
    id: `el-wordsearch-${Date.now()}`,
    type: 'puzzle',
    subType: 'word-search',
    x: opts?.x ?? 40,
    y: opts?.y ?? 90,
    width: opts?.width ?? 280,
    height: opts?.height ?? 300,
    wordSearchConfig: {
      gridSize: 12,
      theme: 'Alam & Hewan',
      difficulty: 'medium',
      words: ['GAJAH', 'HARIMAU', 'ORANGUTAN', 'KOMODO', 'BADAK'],
      allowDiagonal: false,
      allowReverse: false,
    },
    isLocked: false,
  }),
  renderPdf: (element, ctx: PdfRenderContext) => {
    const { doc, xMm, yMm, widthMm, page } = ctx;
    const gridObj = page.wordSearchGrid;
    const grid = gridObj?.grid;
    if (!grid || !grid.length) return;

    const gridSize = grid.length;
    const cellSide = Math.min(widthMm / gridSize, 8);
    const gridTotalW = cellSide * gridSize;
    const startX = xMm + (widthMm - gridTotalW) / 2;

    doc.setFont('courier', 'bold');
    doc.setFontSize(Math.max(7, cellSide * 2));
    doc.setTextColor(30, 41, 59);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const letter = grid[r][c] || 'A';
        const lx = startX + c * cellSide + cellSide / 2;
        const ly = yMm + r * cellSide + cellSide * 0.75;
        doc.text(letter, lx, ly, { align: 'center' });
      }
    }
  },
});

// ============================================================================
// 5. PUZZLE: SUDOKU DEFINITION
// ============================================================================
ElementRegistry.register({
  type: 'puzzle',
  subType: 'sudoku',
  title: 'Sudoku Grid 9x9',
  category: 'puzzle',
  capabilities: {
    canLock: true,
    canDuplicate: true,
    canDelete: true,
    canReorder: true,
    canGroup: true,
    canRotate: false,
    canFlipHorizontal: false,
    canAdjustOpacity: false,
    hasTypography: false,
    hasProceduralEngine: true,
    engineActionLabel: 'Generate Baru',
    hasStrokeConfig: false,
    hasFillConfig: false,
    supportsSolutionKey: true,
  },
  propertySchema: [
    {
      key: 'sudokuConfig.difficulty',
      label: 'Tingkat Kesulitan',
      type: 'select',
      group: 'Permainan',
      options: [
        { label: 'Mudah (Easy - 36 clues)', value: 'easy' },
        { label: 'Sedang (Medium - 30 clues)', value: 'medium' },
        { label: 'Sulit (Hard - 24 clues)', value: 'hard' },
      ],
    },
  ],
  createDefault: (opts) => ({
    id: `el-sudoku-${Date.now()}`,
    type: 'puzzle',
    subType: 'sudoku',
    x: opts?.x ?? 50,
    y: opts?.y ?? 100,
    width: opts?.width ?? 260,
    height: opts?.height ?? 260,
    sudokuConfig: {
      difficulty: 'easy',
      givensCount: 36,
    },
    isLocked: false,
  }),
  renderPdf: (element, ctx: PdfRenderContext) => {
    const { doc, xMm, yMm, widthMm, heightMm, page } = ctx;
    const board = page.sudokuBoard?.puzzle;
    if (!board) return;

    const size = Math.min(widthMm, heightMm);
    const cellSide = size / 9;

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.rect(xMm, yMm, size, size);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(cellSide * 2);
    doc.setTextColor(15, 23, 42);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cx = xMm + c * cellSide;
        const cy = yMm + r * cellSide;

        doc.setLineWidth((r + 1) % 3 === 0 && r !== 8 ? 0.6 : 0.2);
        if (r < 8) doc.line(cx, cy + cellSide, cx + cellSide, cy + cellSide);

        doc.setLineWidth((c + 1) % 3 === 0 && c !== 8 ? 0.6 : 0.2);
        if (c < 8) doc.line(cx + cellSide, cy, cx + cellSide, cy + cellSide);

        const val = board[r][c];
        if (val !== null && val !== undefined) {
          doc.text(String(val), cx + cellSide / 2, cy + cellSide * 0.72, { align: 'center' });
        }
      }
    }
  },
});

// ============================================================================
// 6. PUZZLE: WORKSHEET DEFINITION
// ============================================================================
ElementRegistry.register({
  type: 'puzzle',
  subType: 'worksheet',
  title: 'Worksheet Lembar Aktivitas',
  category: 'puzzle',
  capabilities: {
    canLock: true,
    canDuplicate: true,
    canDelete: true,
    canReorder: true,
    canGroup: true,
    canRotate: false,
    canFlipHorizontal: false,
    canAdjustOpacity: false,
    hasTypography: false,
    hasProceduralEngine: true,
    engineActionLabel: 'Acak Soal',
    hasStrokeConfig: false,
    hasFillConfig: false,
    supportsSolutionKey: true,
  },
  propertySchema: [
    {
      key: 'worksheetConfig.topic',
      label: 'Topik Soal',
      type: 'text',
      group: 'Konten',
    },
    {
      key: 'worksheetConfig.grade',
      label: 'Tingkat Kelas',
      type: 'text',
      group: 'Layout',
    },
  ],
  createDefault: (opts) => ({
    id: `el-worksheet-${Date.now()}`,
    type: 'puzzle',
    subType: 'worksheet',
    x: opts?.x ?? 40,
    y: opts?.y ?? 100,
    width: opts?.width ?? 280,
    height: opts?.height ?? 220,
    worksheetConfig: {
      subject: 'math',
      topic: 'Penjumlahan Cepat',
      grade: 'SD Kelas 1-2',
      instructions: 'Jawablah pertanyaan di bawah ini dengan benar.',
      questions: [],
    },
    isLocked: false,
  }),
  renderPdf: (element, ctx: PdfRenderContext) => {
    const { doc, xMm, yMm, widthMm, heightMm } = ctx;
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    const count = 6;
    const gap = heightMm / count;

    for (let i = 0; i < count; i++) {
      const ly = yMm + (i + 1) * gap;
      doc.line(xMm, ly, xMm + widthMm, ly);
    }
  },
});

// ============================================================================
// 7. SHAPE ELEMENT DEFINITION (Rect, Ellipse, Line dengan Vektor jsPDF Paritas E2)
// ============================================================================
ElementRegistry.register({
  type: 'shape',
  title: 'Bentuk Geometri (Shape)',
  category: 'graphics',
  capabilities: {
    canLock: true,
    canDuplicate: true,
    canDelete: true,
    canReorder: true,
    canGroup: true,
    canRotate: true,
    canFlipHorizontal: true,
    canAdjustOpacity: true,
    hasTypography: false,
    hasProceduralEngine: false,
    hasStrokeConfig: true,
    hasFillConfig: true,
    supportsSolutionKey: false,
  },
  propertySchema: [
    {
      key: 'shapeType',
      label: 'Jenis Bentuk',
      type: 'select',
      group: 'Geometri',
      options: [
        { label: 'Persegi / Kotak (Rectangle)', value: 'rect' },
        { label: 'Lingkaran / Elips (Ellipse)', value: 'ellipse' },
        { label: 'Garis Lurus (Line)', value: 'line' },
      ],
    },
    {
      key: 'fillColor',
      label: 'Warna Isian (Fill)',
      type: 'color',
      group: 'Tampilan',
    },
    {
      key: 'strokeColor',
      label: 'Warna Garis (Stroke)',
      type: 'color',
      group: 'Tampilan',
    },
    {
      key: 'strokeWidth',
      label: 'Tebal Garis',
      type: 'slider',
      group: 'Tampilan',
      min: 0,
      max: 20,
      step: 1,
      unit: 'px',
    },
    {
      key: 'strokeStyle',
      label: 'Gaya Garis',
      type: 'select',
      group: 'Tampilan',
      options: [
        { label: 'Solid (Garis Penuh)', value: 'solid' },
        { label: 'Dashed (Garis Putus)', value: 'dashed' },
      ],
    },
    {
      key: 'cornerRadius',
      label: 'Sudut Lengkung (Radius)',
      type: 'slider',
      group: 'Geometri',
      min: 0,
      max: 50,
      step: 2,
      unit: 'px',
    },
    {
      key: 'opacity',
      label: 'Transparansi',
      type: 'slider',
      group: 'Tampilan',
      min: 0.1,
      max: 1.0,
      step: 0.05,
    },
    {
      key: 'rotation',
      label: 'Rotasi',
      type: 'slider',
      group: 'Transformasi',
      min: 0,
      max: 360,
      step: 5,
      unit: '°',
    },
  ],
  createDefault: (opts) => ({
    id: `el-shape-${Date.now()}`,
    type: 'shape',
    shapeType: 'rect',
    x: opts?.x ?? 80,
    y: opts?.y ?? 80,
    width: opts?.width ?? 120,
    height: opts?.height ?? 80,
    fillColor: '#e0e7ff',
    strokeColor: '#4f46e5',
    strokeWidth: 2,
    strokeStyle: 'solid',
    cornerRadius: 8,
    opacity: 1,
    rotation: 0,
    isLocked: false,
  }),
  renderPdf: (element, ctx: PdfRenderContext) => {
    const { doc, xMm, yMm, widthMm, heightMm } = ctx;
    const shapeType = element.shapeType || 'rect';
    const sWidth = Math.max(0, (element.strokeWidth ?? 2) * 0.25); // pt to mm scale
    const hasStroke = (element.strokeWidth ?? 2) > 0 && !!element.strokeColor && element.strokeColor !== 'transparent';
    const hasFill = !!element.fillColor && element.fillColor !== 'transparent';

    // Parse stroke color
    if (hasStroke && element.strokeColor?.startsWith('#') && element.strokeColor.length === 7) {
      const hex = element.strokeColor.slice(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      doc.setDrawColor(r, g, b);
    } else {
      doc.setDrawColor(79, 70, 229);
    }

    // Parse fill color
    if (hasFill && element.fillColor?.startsWith('#') && element.fillColor.length === 7) {
      const hex = element.fillColor.slice(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      doc.setFillColor(r, g, b);
    } else {
      doc.setFillColor(224, 231, 255);
    }

    doc.setLineWidth(sWidth);

    // Style flag untuk jsPDF: 'S' (stroke), 'F' (fill), 'FD' / 'DF' (keduanya)
    let drawMode: 'S' | 'F' | 'FD' | null = null;
    if (hasFill && hasStroke) drawMode = 'FD';
    else if (hasFill) drawMode = 'F';
    else if (hasStroke) drawMode = 'S';

    // Set dashed pattern jika strokeStyle === 'dashed'
    if (element.strokeStyle === 'dashed') {
      doc.setLineDashPattern([2, 2], 0);
    } else {
      doc.setLineDashPattern([], 0);
    }

    if (shapeType === 'rect') {
      const radiusMm = Math.min(widthMm / 2, heightMm / 2, ((element.cornerRadius ?? 0) * 0.25));
      if (radiusMm > 0) {
        doc.roundedRect(xMm, yMm, widthMm, heightMm, radiusMm, radiusMm, drawMode || 'S');
      } else {
        doc.rect(xMm, yMm, widthMm, heightMm, drawMode || 'S');
      }
    } else if (shapeType === 'ellipse') {
      const rx = widthMm / 2;
      const ry = heightMm / 2;
      const cx = xMm + rx;
      const cy = yMm + ry;
      doc.ellipse(cx, cy, rx, ry, drawMode || 'S');
    } else if (shapeType === 'line') {
      doc.line(xMm, yMm + heightMm / 2, xMm + widthMm, yMm + heightMm / 2);
    }

    // Reset dash pattern ke solid setelah menggambar
    doc.setLineDashPattern([], 0);
  },
});
