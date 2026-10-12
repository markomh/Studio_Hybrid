import { BookPage, BookSection, BookSettings, NumberingStyle, PaginationConfig, Project } from '../types';

/**
 * Convert number to Roman Numerals (e.g., 1 -> i or I, 4 -> iv or IV)
 */
export function toRoman(num: number, upper = false): string {
  if (num <= 0) return '';
  const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syb = ['m', 'cm', 'd', 'cd', 'c', 'xc', 'l', 'xl', 'x', 'ix', 'v', 'iv', 'i'];
  let roman = '';
  for (let i = 0; i < val.length; i++) {
    while (num >= val[i]) {
      roman += syb[i];
      num -= val[i];
    }
  }
  return upper ? roman.toUpperCase() : roman.toLowerCase();
}

/**
 * Standard default sections for a Book Builder project
 */
export function getDefaultBookSections(): BookSection[] {
  return [
    {
      id: 'sec_front',
      name: 'Bagian Awal (Front Matter)',
      role: 'front_matter',
      numberingStyle: 'roman-lower',
      suppressFirstPageNumber: true,
      description: 'Cover, Hak Cipta, dan Pengantar Buku',
    },
    {
      id: 'sec_body',
      name: 'Isi Utama (Body Content)',
      role: 'body',
      numberingStyle: 'arabic',
      startPageNumber: 1,
      description: 'Halaman teka-teki, labirin, dan aktivitas utama',
    },
    {
      id: 'sec_solutions',
      name: 'Kunci Jawaban (Solutions)',
      role: 'solutions',
      numberingStyle: 'arabic',
      description: 'Kunci jawaban dan solusi teka-teki buku',
    },
  ];
}

/**
 * Standard default book settings
 */
export function getDefaultBookSettings(existingPagination?: PaginationConfig): BookSettings {
  return {
    pagination: {
      enabled: existingPagination?.enabled ?? true,
      startPage: existingPagination?.startPage ?? 1,
      position: existingPagination?.position ?? 'bottom-center',
      format: existingPagination?.format ?? 'dash',
      suppressCover: existingPagination?.suppressCover ?? true,
      restartNumberingOnBody: existingPagination?.restartNumberingOnBody ?? true,
    },
    spreadMode: 'single',
  };
}

export interface SpreadPair {
  spreadIndex: number;
  leftPage?: BookPage & { isVerso: true; spreadSide: 'left' };
  rightPage?: BookPage & { isRecto: true; spreadSide: 'right' };
}

export interface PaginationCalculationResult {
  pages: BookPage[];
  spreads: SpreadPair[];
  stats: {
    totalCoverPages: number;
    totalFrontMatterPages: number;
    totalBodyPages: number;
    totalSolutionPages: number;
    isEvenPageCount: boolean;
  };
}

/**
 * Dynamic Pagination Rule Engine (Phase 2 & Phase 5)
 * Calculates display page numbers, section associations, and book spreads.
 */
export function calculateBookPagination(
  pages: BookPage[],
  sections?: BookSection[],
  settings?: BookSettings
): PaginationCalculationResult {
  const activeSections = sections && sections.length > 0 ? sections : getDefaultBookSections();
  const bookSettings = settings || getDefaultBookSettings();
  const paginationConfig = bookSettings.pagination;

  // Track counters per numbering sequence
  let frontMatterCounter = 1;
  let bodyCounter = paginationConfig.startPage || 1;

  let totalCoverPages = 0;
  let totalFrontMatterPages = 0;
  let totalBodyPages = 0;
  let totalSolutionPages = 0;

  const processedPages: BookPage[] = pages.map((page, idx) => {
    // 1. Identify section and role
    let section = activeSections.find((s) => s.id === page.sectionId);
    let role = page.role;

    if (!role) {
      if (page.isSolutionPage) {
        role = 'solutions';
      } else if (idx === 0 && (page.title.toLowerCase().includes('cover') || page.puzzleType === 'custom')) {
        role = 'cover';
      } else {
        role = 'body';
      }
    }

    if (!section) {
      section = activeSections.find((s) => s.role === role) || activeSections[1]; // fallback to body
    }

    // Update stats
    if (role === 'cover') totalCoverPages++;
    else if (role === 'front_matter') totalFrontMatterPages++;
    else if (role === 'solutions') totalSolutionPages++;
    else totalBodyPages++;

    // 2. Compute display page number based on rules
    let display = '';

    if (!paginationConfig.enabled) {
      display = '';
    } else if (role === 'cover' && paginationConfig.suppressCover !== false) {
      // Suppress number on cover
      display = '';
    } else if (role === 'front_matter') {
      if (section?.suppressFirstPageNumber && frontMatterCounter === 1 && idx === 0) {
        display = '';
      } else {
        const roman = toRoman(frontMatterCounter, section?.numberingStyle === 'roman-upper');
        display = formatPageString(roman, paginationConfig.format);
      }
      frontMatterCounter++;
    } else {
      // Body or Solutions
      const num = bodyCounter;
      display = formatPageString(num.toString(), paginationConfig.format);
      bodyCounter++;
    }

    return {
      ...page,
      role,
      sectionId: section?.id,
      displayPageNumber: display,
    };
  });

  // 3. Compute Verso (Left) & Recto (Right) Spreads for KDP Pre-Press Layout
  // Page 1 is always Recto (Right-hand page when opening the book)
  // Page 2 is Verso (Left), Page 3 is Recto (Right), etc.
  const spreads: SpreadPair[] = [];
  
  // First spread: Right page only (Page 1)
  if (processedPages.length > 0) {
    spreads.push({
      spreadIndex: 0,
      rightPage: { ...processedPages[0], isRecto: true, spreadSide: 'right' },
    });
  }

  // Subsequent spreads: pairs of (Left, Right)
  for (let i = 1; i < processedPages.length; i += 2) {
    const left = processedPages[i]
      ? ({ ...processedPages[i], isVerso: true, spreadSide: 'left' } as const)
      : undefined;
    const right = processedPages[i + 1]
      ? ({ ...processedPages[i + 1], isRecto: true, spreadSide: 'right' } as const)
      : undefined;

    spreads.push({
      spreadIndex: Math.floor((i + 1) / 2),
      leftPage: left,
      rightPage: right,
    });
  }

  return {
    pages: processedPages,
    spreads,
    stats: {
      totalCoverPages,
      totalFrontMatterPages,
      totalBodyPages,
      totalSolutionPages,
      isEvenPageCount: processedPages.length % 2 === 0,
    },
  };
}

function formatPageString(val: string, format: 'number' | 'dash' | 'text'): string {
  if (!val) return '';
  switch (format) {
    case 'dash':
      return `- ${val} -`;
    case 'text':
      return `Hal ${val}`;
    case 'number':
    default:
      return val;
  }
}

import { ensurePageElements } from './elementMigration';

/**
 * Migration helper to ensure backward compatibility for legacy projects
 */
export function ensureProjectStructure(project: Project): Project {
  const sections = project.sections && project.sections.length > 0 ? project.sections : getDefaultBookSections();
  const bookSettings = project.bookSettings || getDefaultBookSettings(project.metadata.pagination);

  const { pages } = calculateBookPagination(project.pages, sections, bookSettings);
  const pagesWithElements = pages.map((p) => ({
    ...p,
    elements: ensurePageElements(p),
  }));

  return {
    ...project,
    sections,
    bookSettings,
    pages: pagesWithElements,
  };
}
