import JSZip from 'jszip';
import { BookPage, ProjectMetadata } from '../types';
import { generateMaze } from './mazeGenerator';

export async function exportProjectToZip(
  metadata: ProjectMetadata,
  pages: BookPage[]
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(metadata.name || 'activity_book_assets');

  // Create SVGs for each maze page
  pages.forEach((page) => {
    if (page.puzzleType === 'maze' && page.mazeConfig) {
      const generated = generateMaze(page.mazeConfig);
      const svgPuzzle = createMazeSvg(page, generated.cells, false);
      const svgSolution = createMazeSvg(page, generated.cells, true, generated.solutionPath);

      folder?.file(`page_${page.pageNumber}_${page.title.replace(/\s+/g, '_')}.svg`, svgPuzzle);
      folder?.file(`page_${page.pageNumber}_solution.svg`, svgSolution);
    }
  });

  // Add Project Manifest JSON
  const manifest = {
    title: metadata.name,
    kdpFormat: metadata.targetKdpFormat,
    totalPages: pages.length,
    margins: metadata.margins,
    exportedAt: new Date().toISOString(),
  };
  folder?.file('project_manifest.json', JSON.stringify(manifest, null, 2));

  // Generate and download zip
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(metadata.name || 'project').replace(/\s+/g, '_')}_assets_bundle.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createMazeSvg(
  page: BookPage,
  cells: any[][],
  withSolution: boolean,
  solutionPath?: [number, number][]
): string {
  const rows = cells.length;
  const cols = cells[0].length;
  const cellSize = 30;
  const width = cols * cellSize;
  const height = rows * cellSize;

  let wallsSvg = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const x = c * cellSize;
      const y = r * cellSize;
      if (cell.walls.top) wallsSvg += `<line x1="${x}" y1="${y}" x2="${x + cellSize}" y2="${y}" />`;
      if (cell.walls.right) wallsSvg += `<line x1="${x + cellSize}" y1="${y}" x2="${x + cellSize}" y2="${y + cellSize}" />`;
      if (cell.walls.bottom) wallsSvg += `<line x1="${x}" y1="${y + cellSize}" x2="${x + cellSize}" y2="${y + cellSize}" />`;
      if (cell.walls.left) wallsSvg += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + cellSize}" />`;
    }
  }

  let solutionSvg = '';
  if (withSolution && solutionPath && solutionPath.length > 1) {
    const points = solutionPath
      .map(p => `${p[1] * cellSize + cellSize / 2},${p[0] * cellSize + cellSize / 2}`)
      .join(' ');
    solutionSvg = `<polyline points="${points}" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#ffffff" />
  <g stroke="#0f172a" stroke-width="${page.mazeConfig?.wallThickness || 3}" stroke-linecap="round">
    ${wallsSvg}
  </g>
  ${solutionSvg}
</svg>`;
}
