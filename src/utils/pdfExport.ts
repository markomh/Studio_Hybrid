import { jsPDF } from 'jspdf';
import { BookPage, ProjectMetadata } from '../types';
import { PAGE_SPECS } from './kdpCalculator';
import { generateMaze } from './mazeGenerator';
import { ElementRegistry } from '../registry/ElementRegistry';
import { ensurePageElements } from './elementMigration';
import { registerCustomFonts, resolvePdfFont } from '../fonts/fontResolver';

export interface PdfExportOptions {
  includeSolutions?: boolean;
  grayscaleForPrinting?: boolean;
  includeBleedGuides?: boolean;
}

export async function exportBookToPdf(
  metadata: ProjectMetadata,
  pages: BookPage[],
  options: PdfExportOptions = {}
): Promise<void> {
  const spec = PAGE_SPECS[metadata.targetKdpFormat] || PAGE_SPECS['A4'];
  const isLandscape = false;
  
  // Create jsPDF instance with exact millimeter dimensions
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [spec.widthMm, spec.heightMm],
  });

  // Registrasikan font OFL (Comic Neue dsb.) ke VFS jsPDF untuk paritas font penuh (E1)
  registerCustomFonts(doc);

  const width = spec.widthMm;
  const height = spec.heightMm;
  const margin = metadata.margins;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (i > 0) {
      doc.addPage([spec.widthMm, spec.heightMm], isLandscape ? 'landscape' : 'portrait');
    }

    renderSinglePageOnPdf(doc, page, width, height, margin, options, i + 1);
  }

  // If includeSolutions, generate Answer Keys appendix at the end
  if (options.includeSolutions) {
    const mazePages = pages.filter(p => p.puzzleType === 'maze' && p.mazeConfig);
    if (mazePages.length > 0) {
      // 4 solutions per answer key page (2x2 grid)
      const perPage = 4;
      const totalSolutionPages = Math.ceil(mazePages.length / perPage);

      for (let sp = 0; sp < totalSolutionPages; sp++) {
        doc.addPage([spec.widthMm, spec.heightMm], isLandscape ? 'landscape' : 'portrait');
        const chunk = mazePages.slice(sp * perPage, (sp + 1) * perPage);

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text(`SOLUTIONS - ANSWER KEYS (PAGE ${sp + 1})`, width / 2, margin.topMm + 8, { align: 'center' });

        const gridW = (width - margin.insideMm - margin.outsideMm - 10) / 2;
        const gridH = (height - margin.topMm - margin.bottomMm - 24) / 2;

        chunk.forEach((p, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const startX = margin.insideMm + col * (gridW + 10);
          const startY = margin.topMm + 18 + row * (gridH + 10);

          // Solution label
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Page ${p.pageNumber}: ${p.title}`, startX, startY - 2);

          // Render miniature solution maze
          renderMiniMazeSolution(doc, p, startX, startY, gridW, gridH - 6);
        });

        // Solution page number
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`- Solution Key ${sp + 1} -`, width / 2, height - margin.bottomMm + 4, { align: 'center' });
      }
    }
  }

  // Trigger download
  const safeFilename = (metadata.name || 'activity-book').replace(/[^a-z0-9_-]/gi, '_');
  doc.save(`${safeFilename}_KDP_Print_Ready.pdf`);
}

function renderSinglePageOnPdf(
  doc: jsPDF,
  page: BookPage,
  width: number,
  height: number,
  margin: { topMm: number; bottomMm: number; insideMm: number; outsideMm: number },
  options: PdfExportOptions,
  pageIndex1Based: number
) {
  const isRecto = (pageIndex1Based % 2 !== 0);
  const leftMarginMm = isRecto ? (margin.insideMm ?? 12.7) : (margin.outsideMm ?? 12.7);
  const rightMarginMm = isRecto ? (margin.outsideMm ?? 12.7) : (margin.insideMm ?? 12.7);
  const contentWidth = width - leftMarginMm - rightMarginMm;
  const contentHeight = height - margin.topMm - margin.bottomMm;

  // 1. Page Border Frame (if configured)
  if (page.borderStyle === 'simple' || page.borderStyle === 'double') {
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(page.borderStyle === 'double' ? 1 : 0.6);
    doc.rect(leftMarginMm - 3, margin.topMm - 3, contentWidth + 6, contentHeight + 6);
  }

  // 2. POLYMORPHIC CANVAS ELEMENT RENDERING PIPELINE
  // Mengambil elemen kanonikal dari page (atau otomatis disintesis via ensurePageElements)
  const elements = ensurePageElements(page);
  
  // Asumsi artboard canvas standar: 375px x 520px
  const baseCanvasW = 375;
  const baseCanvasH = 520;

  let renderedAnyPolymorphic = false;

  for (const element of elements) {
    const definition = ElementRegistry.get(element.type, element.subType);
    if (definition?.renderPdf) {
      // Skalakan koordinat kanvas piksel ke milimeter isi buku dengan memperhitungkan recto/verso margin
      const xMm = leftMarginMm + (element.x / baseCanvasW) * contentWidth;
      const yMm = margin.topMm + (element.y / baseCanvasH) * contentHeight;
      const widthMm = (element.width / baseCanvasW) * contentWidth;
      const heightMm = (element.height / baseCanvasH) * contentHeight;

      definition.renderPdf(element, {
        doc,
        xMm,
        yMm,
        widthMm,
        heightMm,
        page,
        options,
      });
      renderedAnyPolymorphic = true;
    }
  }

  // Fallback jika tidak ada elemen polimorfik (misal format warisan tanpa elemen)
  if (!renderedAnyPolymorphic) {
    let cursorY = margin.topMm + 6;
    const pageFamily = page.textElement?.fontFamily || 'sans';
    const titleFont = resolvePdfFont(pageFamily, 'bold', 'normal');
    doc.setFont(titleFont.fontName, titleFont.fontStyle);
    doc.setFontSize(page.textElement?.titleSize ? Math.min(20, page.textElement.titleSize * 0.75) : 18);
    doc.setTextColor(15, 23, 42);

    const titleText = (page.textElement?.title || page.title || 'PUZZLE CHALLENGE').toUpperCase();
    doc.text(titleText, width / 2, cursorY, { align: 'center' });
    cursorY += 6;

    if (page.textElement?.instructions) {
      const instFont = resolvePdfFont(pageFamily, 'normal', 'normal');
      doc.setFont(instFont.fontName, instFont.fontStyle);
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const splitInstructions = doc.splitTextToSize(page.textElement.instructions, contentWidth - 10);
      doc.text(splitInstructions, width / 2, cursorY, { align: 'center' });
      cursorY += (splitInstructions.length * 4) + 4;
    }

    const puzzleAreaY = cursorY;
    const puzzleAreaHeight = (height - margin.bottomMm - 18) - puzzleAreaY;
    const puzzleSize = Math.min(contentWidth - 6, puzzleAreaHeight);
    const puzzleX = leftMarginMm + (contentWidth - puzzleSize) / 2;

    if (page.puzzleType === 'maze' && page.mazeConfig) {
      const mazeDef = ElementRegistry.get('puzzle', 'labirin');
      mazeDef?.renderPdf?.({ ...elementDefault('puzzle', 'labirin'), mazeConfig: page.mazeConfig } as any, {
        doc,
        xMm: puzzleX,
        yMm: puzzleAreaY,
        widthMm: puzzleSize,
        heightMm: puzzleSize,
        page,
        options,
      });
    }
  }

  // 3. Footer Pagination (Respects recto/verso gutter positioning)
  if (page.displayPageNumber !== '') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const pageNumText = page.displayPageNumber || `- ${page.pageNumber} -`;
    doc.text(pageNumText, width / 2, height - margin.bottomMm + 3, { align: 'center' });
  }
}

function elementDefault(type: string, subType: string) {
  return ElementRegistry.get(type, subType)?.createDefault() || { id: 'fallback', type };
}

function renderMiniMazeSolution(
  doc: jsPDF,
  page: BookPage,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const config = page.mazeConfig!;
  const generated = generateMaze(config);
  const { cells } = generated;
  const rows = cells.length;
  const cols = cells[0].length;
  const cellW = w / cols;
  const cellH = h / rows;

  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.3);
  doc.rect(x, y, w, h);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const cx = x + c * cellW;
      const cy = y + r * cellH;

      if (cell.walls.bottom && r < rows - 1) {
        doc.line(cx, cy + cellH, cx + cellW, cy + cellH);
      }
      if (cell.walls.right && c < cols - 1) {
        doc.line(cx + cellW, cy, cx + cellW, cy + cellH);
      }
    }
  }

  // Solution path vector
  if (generated.solutionPath && generated.solutionPath.length > 1) {
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.6);
    for (let i = 0; i < generated.solutionPath.length - 1; i++) {
      const [r1, c1] = generated.solutionPath[i];
      const [r2, c2] = generated.solutionPath[i + 1];
      const x1 = x + c1 * cellW + cellW / 2;
      const y1 = y + r1 * cellH + cellH / 2;
      const x2 = x + c2 * cellW + cellW / 2;
      const y2 = y + r2 * cellH + cellH / 2;
      doc.line(x1, y1, x2, y2);
    }
  }
}
