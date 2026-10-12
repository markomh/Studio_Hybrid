import { BookPage, CanvasElement, PuzzleSubType } from '../types';

/**
 * Ensures a page has an initialized array of CanvasElements.
 * If page.elements is missing or empty, synthesizes default elements
 * from legacy BookPage slots (title, instructions, puzzle, footer).
 */
export function ensurePageElements(page: BookPage): CanvasElement[] {
  if (page.elements && page.elements.length > 0) {
    return page.elements;
  }

  const elements: CanvasElement[] = [];

  // 1. Title Element
  elements.push({
    id: `el-title-${page.id}`,
    type: 'text',
    x: 40,
    y: 28,
    width: 340,
    height: 44,
    content: page.textElement?.title || page.title || 'JUDUL HALAMAN',
    fontSize: page.textElement?.titleSize || 22,
    color: '#0f172a',
    textAlign: page.textElement?.align || 'center',
    isLocked: false,
  });

  // 2. Instructions Element (if present)
  if (page.textElement?.instructions) {
    elements.push({
      id: `el-inst-${page.id}`,
      type: 'text',
      x: 40,
      y: 76,
      width: 340,
      height: 36,
      content: page.textElement.instructions,
      fontSize: 12,
      color: '#475569',
      textAlign: page.textElement?.align || 'center',
      isLocked: false,
    });
  }

  // 3. Central Puzzle / Activity Element
  if (page.puzzleType && page.puzzleType !== 'custom') {
    let subType: PuzzleSubType = 'labirin';
    if (page.puzzleType === 'wordsearch') subType = 'word-search';
    else if (page.puzzleType === 'sudoku') subType = 'sudoku';
    else if (page.puzzleType === 'worksheet') subType = 'worksheet';

    elements.push({
      id: `el-puzzle-${page.id}`,
      type: 'puzzle',
      subType,
      x: 45,
      y: 125,
      width: 330,
      height: 330,
      isLocked: false,
    });
  }

  // 4. Clipart / Emoji Decoration (if present)
  if (page.customAssetEmoji) {
    elements.push({
      id: `el-clipart-${page.id}`,
      type: 'image',
      x: 320,
      y: 35,
      width: 50,
      height: 50,
      content: page.customAssetEmoji,
      opacity: 1,
      isLocked: false,
    });
  }

  // 5. Footer Story / Notes (if present)
  if (page.textElement?.footerStory) {
    elements.push({
      id: `el-footer-${page.id}`,
      type: 'text',
      x: 40,
      y: 468,
      width: 340,
      height: 34,
      content: page.textElement.footerStory,
      fontSize: 11,
      color: '#64748b',
      textAlign: 'center',
      isLocked: false,
    });
  }

  return elements;
}
