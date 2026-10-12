import { jsPDF } from 'jspdf';
import { ProjectMetadata, CoverProject } from '../types';
import { PAGE_SPECS } from './kdpCalculator';

export async function exportCoverToPdf(
  metadata: ProjectMetadata,
  pageCount: number,
  cover: CoverProject
): Promise<void> {
  const spec = PAGE_SPECS[metadata.targetKdpFormat] || PAGE_SPECS['A4'];
  const trimW = spec.widthMm;
  const trimH = spec.heightMm;

  // Amazon KDP Cover Math
  const paperMultIn = metadata.paperColor === 'cream' ? 0.0025 : 0.002252;
  const spineThicknessIn = Math.max(0.06, pageCount * paperMultIn);
  const spineWidthMm = spineThicknessIn * 25.4;
  const bleedMm = 3.2; // 0.125 in bleed on all 4 outer edges

  // Total Cover Dimensions
  const totalCoverWidthMm = bleedMm + trimW + spineWidthMm + trimW + bleedMm;
  const totalCoverHeightMm = bleedMm + trimH + bleedMm;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [totalCoverWidthMm, totalCoverHeightMm],
  });

  // 1. Solid Background Color
  doc.setFillColor(cover.backgroundColor || '#0f172a');
  doc.rect(0, 0, totalCoverWidthMm, totalCoverHeightMm, 'F');

  // Coordinates
  const backCoverX = bleedMm;
  const spineX = bleedMm + trimW;
  const frontCoverX = spineX + spineWidthMm;

  // 2. Spine Fold Guidelines & Visual Subtle Lines
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.line(spineX, 0, spineX, totalCoverHeightMm);
  doc.line(spineX + spineWidthMm, 0, spineX + spineWidthMm, totalCoverHeightMm);

  // 3. FRONT COVER CONTENT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  const frontCenterX = frontCoverX + trimW / 2;
  doc.text((cover.title || metadata.name || 'ACTIVITY BOOK').toUpperCase(), frontCenterX, bleedMm + 40, { align: 'center' });

  if (cover.subtitle) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    doc.text(cover.subtitle, frontCenterX, bleedMm + 52, { align: 'center' });
  }

  // Cover Feature Highlights in Front
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(199, 210, 254);
  doc.text(`★ ${pageCount} HALAMAN AKTIVITAS SERU & EDUKATIF ★`, frontCenterX, bleedMm + trimH - 50, { align: 'center' });

  if (cover.author) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Karya: ${cover.author}`, frontCenterX, bleedMm + trimH - 25, { align: 'center' });
  }

  // 4. BACK COVER CONTENT
  const backCenterX = backCoverX + trimW / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('BUKU TEKA-TEKI & AKTIVITAS ANAK', backCenterX, bleedMm + 35, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  const blurb = doc.splitTextToSize(
    'Didesain khusus untuk melatih daya ingat, konsentrasi, logika visual, serta mengasah keterampilan pemecahan masalah dengan cara yang seru dan mengasyikkan.\n\nCocok untuk kegiatan di rumah, liburan sekolah, maupun teman perjalanan santai.',
    trimW - 35
  );
  doc.text(blurb, backCenterX, bleedMm + 50, { align: 'center' });

  // Barcode Safe Zone (50.8mm x 30.5mm at bottom right of back cover)
  const barcodeW = 50.8;
  const barcodeH = 30.5;
  const barcodeX = spineX - barcodeW - 10;
  const barcodeY = bleedMm + trimH - barcodeH - 8;

  doc.setFillColor(255, 255, 255);
  doc.rect(barcodeX, barcodeY, barcodeW, barcodeH, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('KDP BARCODE SAFE ZONE', barcodeX + barcodeW / 2, barcodeY + barcodeH / 2, { align: 'center' });

  // 5. SPINE TEXT (Hanya jika tebal spine >= 79 halaman)
  if (pageCount >= 79 && spineWidthMm >= 4.5) {
    doc.saveGraphicsState();
    // Spine centered rotation
    const spineCenterMmX = spineX + spineWidthMm / 2;
    const spineCenterMmY = bleedMm + trimH / 2;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(Math.min(9, spineWidthMm * 1.5));
    doc.setTextColor(255, 255, 255);
    // Draw rotated spine text vertically along the spine
    doc.text(cover.spineText || cover.title || metadata.name, spineCenterMmX, spineCenterMmY, {
      align: 'center',
      angle: 270,
    });
    doc.restoreGraphicsState();
  }

  // Trigger Download
  const safeFilename = (metadata.name || 'book').replace(/[^a-z0-9_-]/gi, '_');
  doc.save(`${safeFilename}_FullWrap_Cover_KDP.pdf`);
}
