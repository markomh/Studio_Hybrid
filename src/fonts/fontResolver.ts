import { jsPDF } from 'jspdf';
import { COMIC_NEUE_REGULAR_BASE64, COMIC_NEUE_BOLD_BASE64 } from './comicNeueFont';

/**
 * Mendaftarkan font OFL Comic Neue ke instance jsPDF agar teks berfont 'comic'
 * memiliki paritas 100% antara tampilan kanvas dan hasil cetak PDF vektor (E1).
 */
export function registerCustomFonts(doc: jsPDF): void {
  try {
    if (!doc.existsFileInVFS('ComicNeue-Regular.ttf')) {
      doc.addFileToVFS('ComicNeue-Regular.ttf', COMIC_NEUE_REGULAR_BASE64);
      doc.addFont('ComicNeue-Regular.ttf', 'ComicNeue', 'normal');
    }
    if (!doc.existsFileInVFS('ComicNeue-Bold.ttf')) {
      doc.addFileToVFS('ComicNeue-Bold.ttf', COMIC_NEUE_BOLD_BASE64);
      doc.addFont('ComicNeue-Bold.ttf', 'ComicNeue', 'bold');
    }
  } catch (err) {
    console.warn('Gagal memuat font Comic Neue ke jsPDF:', err);
  }
}

export type SupportedFontFamily = 'sans' | 'serif' | 'comic' | 'mono';

export interface PdfFontMapping {
  fontName: string;
  fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic';
}

/**
 * Pemetaan keluarga font dan gaya (weight & style) kanvas ke font jsPDF berlisensi OFL / Core Fonts.
 */
export function resolvePdfFont(
  family: SupportedFontFamily | undefined,
  weight: 'normal' | 'bold' | undefined,
  style: 'normal' | 'italic' | undefined
): PdfFontMapping {
  const isBold = weight === 'bold';
  const isItalic = style === 'italic';

  switch (family) {
    case 'serif': {
      // Core Times Roman (Standard Type 1 / OFL-compatible metric)
      let fontStyle: PdfFontMapping['fontStyle'] = 'normal';
      if (isBold && isItalic) fontStyle = 'bolditalic';
      else if (isBold) fontStyle = 'bold';
      else if (isItalic) fontStyle = 'italic';
      return { fontName: 'times', fontStyle };
    }
    case 'comic': {
      // OFL Comic Neue Embedded VFS
      return {
        fontName: 'ComicNeue',
        fontStyle: isBold ? 'bold' : 'normal',
      };
    }
    case 'mono': {
      // Core Courier Monospace
      let fontStyle: PdfFontMapping['fontStyle'] = 'normal';
      if (isBold && isItalic) fontStyle = 'bolditalic';
      else if (isBold) fontStyle = 'bold';
      else if (isItalic) fontStyle = 'italic';
      return { fontName: 'courier', fontStyle };
    }
    case 'sans':
    default: {
      // Core Helvetica (Standard Sans)
      let fontStyle: PdfFontMapping['fontStyle'] = 'normal';
      if (isBold && isItalic) fontStyle = 'bolditalic';
      else if (isBold) fontStyle = 'bold';
      else if (isItalic) fontStyle = 'italic';
      return { fontName: 'helvetica', fontStyle };
    }
  }
}
