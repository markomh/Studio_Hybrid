import { BookPage, BookSection, Project } from '../types';

export interface CompilationResult {
  updatedPages: BookPage[];
  newSolutionCount: number;
  message: string;
}

/**
 * Automated Solution Compiler (Phase 4 of BOOK Domain Architecture)
 * Scans all challenge pages in the book and automatically synthesizes
 * back-matter answer key solution pages with proper linkage and styling.
 */
export function compileSolutionsForBook(project: Project): CompilationResult {
  const existingNonSolutionPages = project.pages.filter((p) => !p.isSolutionPage);
  
  // Find all puzzle pages that have solutions available
  const puzzlePages = existingNonSolutionPages.filter((p) => {
    return (
      (p.puzzleType === 'maze' && p.mazeConfig) ||
      (p.puzzleType === 'wordsearch' && p.wordSearchConfig) ||
      (p.puzzleType === 'sudoku' && p.sudokuConfig) ||
      (p.puzzleType === 'worksheet' && p.worksheetConfig)
    );
  });

  if (puzzlePages.length === 0) {
    return {
      updatedPages: project.pages,
      newSolutionCount: 0,
      message: 'Tidak ada halaman teka-teki yang memerlukan kunci jawaban.',
    };
  }

  // Remove previous auto-compiled solution pages to regenerate fresh up-to-date solutions
  const basePages = project.pages.filter((p) => !p.isSolutionPage);

  const solutionPages: BookPage[] = [];
  const startNum = basePages.length + 1;

  puzzlePages.forEach((puzzlePage, i) => {
    const pageNum = startNum + i;
    const originalPageNumber = puzzlePage.pageNumber || (basePages.indexOf(puzzlePage) + 1);

    // Create a corresponding dedicated solution page with full solution visibility
    const solPage: BookPage = {
      id: `sol_${Date.now()}_${puzzlePage.id || i}`,
      pageNumber: pageNum,
      title: `Kunci Jawaban: ${puzzlePage.title}`,
      puzzleType: puzzlePage.puzzleType,
      difficulty: puzzlePage.difficulty,
      role: 'solutions',
      sectionId: 'sec_solutions',
      isSolutionPage: true,
      solutionForPages: [originalPageNumber],
      borderStyle: puzzlePage.borderStyle || 'rounded',
      borderColor: '#475569',
      
      // Copy puzzle configs
      mazeConfig: puzzlePage.mazeConfig ? { ...puzzlePage.mazeConfig } : undefined,
      wordSearchConfig: puzzlePage.wordSearchConfig ? { ...puzzlePage.wordSearchConfig } : undefined,
      sudokuConfig: puzzlePage.sudokuConfig ? { ...puzzlePage.sudokuConfig } : undefined,
      worksheetConfig: puzzlePage.worksheetConfig ? { ...puzzlePage.worksheetConfig } : undefined,

      // Pre-computed solution cache preserved
      solutionPath: puzzlePage.solutionPath,
      wordSearchGrid: puzzlePage.wordSearchGrid,
      sudokuBoard: puzzlePage.sudokuBoard,

      textElement: {
        id: `t_sol_${Date.now()}_${i}`,
        title: `KUNCI JAWABAN (HAL. ${originalPageNumber})`,
        subtitle: `Solusi Lengkap: ${puzzlePage.title}`,
        instructions: `Periksa jawaban tantangan ${puzzlePage.puzzleType.toUpperCase()} Anda dengan panduan solusi di bawah ini.`,
        footerStory: `Kunci Jawaban untuk Halaman ${originalPageNumber} • Studio Hybrid Publishing`,
        fontFamily: puzzlePage.textElement?.fontFamily || 'serif',
        titleSize: 20,
        align: 'center',
      },
    };

    solutionPages.push(solPage);
  });

  const updatedPages = [...basePages, ...solutionPages];

  return {
    updatedPages,
    newSolutionCount: solutionPages.length,
    message: `Berhasil mengompilasi ${solutionPages.length} halaman kunci jawaban secara otomatis ke bagian Solutions.`,
  };
}
