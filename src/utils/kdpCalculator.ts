import { PageSize, PageDimensions, KdpValidationResult, ProjectMetadata } from '../types';

export const PAGE_SPECS: Record<PageSize, PageDimensions> = {
  'A4': {
    name: 'A4',
    widthMm: 210,
    heightMm: 297,
    widthIn: 8.27,
    heightIn: 11.69,
    aspectRatio: 210 / 297,
  },
  'Letter': {
    name: 'Letter',
    widthMm: 215.9,
    heightMm: 279.4,
    widthIn: 8.5,
    heightIn: 11.0,
    aspectRatio: 8.5 / 11.0,
  },
  '6x9': {
    name: '6x9',
    widthMm: 152.4,
    heightMm: 228.6,
    widthIn: 6.0,
    heightIn: 9.0,
    aspectRatio: 6.0 / 9.0,
  },
  '8.5x8.5': {
    name: '8.5x8.5',
    widthMm: 215.9,
    heightMm: 215.9,
    widthIn: 8.5,
    heightIn: 8.5,
    aspectRatio: 1.0,
  },
};

export function validateKdpCompliance(
  metadata: ProjectMetadata,
  pageCount: number,
  listPriceUsd: number = 7.99
): KdpValidationResult {
  const paperMultIn = metadata.paperColor === 'cream' ? 0.0025 : 0.002252;
  const spineThicknessIn = Math.max(0.06, pageCount * paperMultIn);
  const spineThicknessMm = spineThicknessIn * 25.4;

  // Required gutter inside margin according to Amazon KDP specifications
  let requiredGutterMm = 9.5; // 0.375 in for 24-150 pages
  if (pageCount > 150 && pageCount <= 300) {
    requiredGutterMm = 12.7; // 0.50 in
  } else if (pageCount > 300) {
    requiredGutterMm = 15.9; // 0.625 in
  }

  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (pageCount < 24) {
    warnings.push(`Amazon KDP requires at least 24 pages for paperback interior printing (currently: ${pageCount}).`);
  }

  if (metadata.margins.insideMm < requiredGutterMm) {
    warnings.push(
      `Inside gutter margin (${metadata.margins.insideMm}mm) is lower than recommended for ${pageCount} pages (minimum ${requiredGutterMm}mm). Spine binding might clip content.`
    );
  }

  if (metadata.margins.outsideMm < 6.4) {
    warnings.push('Outside margin is below KDP safe boundary (minimum 6.4mm / 0.25in).');
  }

  if (pageCount > 78) {
    recommendations.push(`Spine width is ${spineThicknessMm.toFixed(2)}mm (${spineThicknessIn.toFixed(3)}in), which allows legible text printing on the book spine!`);
  } else {
    recommendations.push(`Books with fewer than 79 pages cannot have text printed on the spine per Amazon KDP guidelines.`);
  }

  // Printing cost estimation
  let estimatedPrintCostUsd = 2.30;
  if (pageCount > 108) {
    estimatedPrintCostUsd = 1.00 + (pageCount * 0.012);
  }

  // Royalty calculation: 60% standard KDP distribution
  const estimatedRoyaltyUsd = Math.max(0, (listPriceUsd * 0.60) - estimatedPrintCostUsd);

  return {
    isValid: warnings.length === 0,
    pageSize: metadata.targetKdpFormat,
    pageCount,
    calculatedSpineThicknessMm: spineThicknessMm,
    calculatedSpineThicknessIn: spineThicknessIn,
    requiredGutterMarginMm: requiredGutterMm,
    marginStatus: metadata.margins.insideMm >= requiredGutterMm ? 'pass' : 'warning',
    bleedStatus: metadata.bleed ? 'pass' : 'pass',
    warnings,
    recommendations,
    estimatedRoyaltyUsd: Number(estimatedRoyaltyUsd.toFixed(2)),
    estimatedPrintCostUsd: Number(estimatedPrintCostUsd.toFixed(2)),
  };
}
