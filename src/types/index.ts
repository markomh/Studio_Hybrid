export type PageSize = 'A4' | 'Letter' | '6x9' | '8.5x8.5';

export interface PageDimensions {
  name: PageSize;
  widthMm: number;
  heightMm: number;
  widthIn: number;
  heightIn: number;
  aspectRatio: number; // width / height
}

export type PuzzleType = 'maze' | 'wordsearch' | 'sudoku' | 'worksheet' | 'coloring' | 'custom';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export type MazeAlgorithm = 'recursive-backtracker' | 'kruskal' | 'prim';

export interface MazeCell {
  x: number;
  y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited?: boolean;
}

export interface MazeConfig {
  rows: number;
  cols: number;
  algorithm: MazeAlgorithm;
  difficulty: DifficultyLevel;
  wallThickness: number;
  wallColor: string;
  solutionColor: string;
  startIcon: string;
  finishIcon: string;
  startCorner: 'topLeft' | 'bottomLeft' | 'random';
  finishCorner: 'bottomRight' | 'topRight' | 'random';
  seed: number;
  showSolution?: boolean;
}

export interface WordSearchConfig {
  gridSize: number; // e.g. 12x12
  words: string[];
  theme: string;
  difficulty: DifficultyLevel;
  allowDiagonal: boolean;
  allowReverse: boolean;
}

export interface SudokuConfig {
  difficulty: DifficultyLevel;
  givensCount: number; // number of revealed numbers
}

export interface WorksheetQuestion {
  id: string;
  q: string;
  a: string;
  options?: string[];
}

export interface WorksheetConfig {
  subject: 'math' | 'science' | 'language' | 'logic';
  topic: string;
  grade: string;
  questions: WorksheetQuestion[];
  instructions: string;
}

export interface PageTextElement {
  id: string;
  title: string;
  subtitle: string;
  instructions: string;
  footerStory: string;
  fontFamily: 'serif' | 'sans' | 'comic' | 'mono';
  titleSize: number;
  align: 'center' | 'left' | 'right';
}

export interface PageMargin {
  topMm: number;
  bottomMm: number;
  insideMm: number; // gutter
  outsideMm: number;
}

export type PageRole = 'cover' | 'front_matter' | 'body' | 'solutions' | 'appendix';
export type NumberingStyle = 'arabic' | 'roman-lower' | 'roman-upper' | 'none';

export interface BookSection {
  id: string;
  name: string;
  role: PageRole;
  numberingStyle?: NumberingStyle;
  startPageNumber?: number;
  suppressFirstPageNumber?: boolean;
  description?: string;
}

export type CanvasElementType = 'text' | 'puzzle' | 'group' | 'image' | 'shape';
export type PuzzleSubType = 'labirin' | 'sudoku' | 'word-search' | 'worksheet';
export type ShapeType = 'rect' | 'ellipse' | 'line';
export type StrokeStyle = 'solid' | 'dashed';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  subType?: PuzzleSubType;
  shapeType?: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: StrokeStyle;
  cornerRadius?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: 'serif' | 'sans' | 'comic' | 'mono';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  parentId?: string; // Menyimpan ID jika di dalam grup
  childrenIds?: string[]; // Jika type === 'group'
  rotation?: number;
  isLocked?: boolean;
  imageUrl?: string;
  opacity?: number;
  flipHorizontal?: boolean;
  mazeConfig?: MazeConfig;
  wordSearchConfig?: WordSearchConfig;
  sudokuConfig?: SudokuConfig;
  worksheetConfig?: WorksheetConfig;
}

export type ResizeHandleDirection = 'tl' | 'tr' | 'bl' | 'br';

export interface BookPage {
  id: string;
  pageNumber: number;
  title: string;
  puzzleType: PuzzleType;
  difficulty: DifficultyLevel;
  role?: PageRole;
  sectionId?: string;
  displayPageNumber?: string;
  isSolutionPage?: boolean;
  solutionForPages?: number[];
  
  // Unified Canvas Elements per page
  elements?: CanvasElement[];

  // Configurations (Legacy / Backward-compatible)
  mazeConfig?: MazeConfig;
  wordSearchConfig?: WordSearchConfig;
  sudokuConfig?: SudokuConfig;
  worksheetConfig?: WorksheetConfig;
  textElement: PageTextElement;
  
  // Pre-computed solution cache
  solutionPath?: [number, number][]; // coordinates for maze solution
  wordSearchGrid?: {
    grid: string[][];
    placedWords: { word: string; start: [number, number]; end: [number, number]; color?: string }[];
  };
  sudokuBoard?: {
    puzzle: (number | null)[][];
    solution: number[][];
  };

  // Layout & Styling overrides
  borderStyle: 'none' | 'simple' | 'double' | 'rounded' | 'dots';
  borderColor: string;
  customAssetEmoji?: string;
  notes?: string;
}

export interface PaginationConfig {
  enabled: boolean;
  startPage: number;
  position: 'bottom-center' | 'bottom-outer' | 'top-center';
  format: 'number' | 'dash' | 'text';
  suppressCover?: boolean;
  restartNumberingOnBody?: boolean;
}

export interface BookSettings {
  pagination: PaginationConfig;
  spreadMode?: 'single' | 'two-page';
}

export interface ProjectMetadata {
  id: string;
  name: string;
  targetKdpFormat: PageSize;
  paperColor: 'white' | 'cream';
  bleed: boolean;
  margins: PageMargin;
  pagination?: PaginationConfig;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Project {
  metadata: ProjectMetadata;
  pages: BookPage[];
  sections?: BookSection[];
  bookSettings?: BookSettings;
}

export interface KdpValidationResult {
  isValid: boolean;
  pageSize: PageSize;
  pageCount: number;
  calculatedSpineThicknessMm: number;
  calculatedSpineThicknessIn: number;
  requiredGutterMarginMm: number;
  marginStatus: 'pass' | 'warning' | 'fail';
  bleedStatus: 'pass' | 'warning';
  warnings: string[];
  recommendations: string[];
  estimatedRoyaltyUsd: number;
  estimatedPrintCostUsd: number;
}

export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  items: AssetClipart[];
}

export interface AssetClipart {
  id: string;
  title: string;
  category: string;
  tags: string[];
  emoji?: string;
  svgData?: string;
  previewUrl?: string;
}

export interface CoverProject {
  title: string;
  subtitle?: string;
  author?: string;
  spineText?: string;
  backgroundColor: string;
  accentColor?: string;
  barcodeSafeZone: boolean;
  frontElements: CanvasElement[];
  backElements: CanvasElement[];
}

export type WorkspaceView = 'studio' | 'cover' | 'book-structure' | 'dashboard' | 'book-builder' | 'assets' | 'ai' | 'download' | 'batch';
