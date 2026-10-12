import { WordSearchConfig } from '../types';

export interface PlacedWord {
  word: string;
  start: [number, number];
  end: [number, number];
  color?: string;
  direction: [number, number];
}

export interface GeneratedWordSearch {
  grid: string[][];
  placedWords: PlacedWord[];
  unplacedWords: string[];
}

export function generateWordSearch(config: WordSearchConfig): GeneratedWordSearch {
  const size = config.gridSize || 12;
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  
  // Directions
  let directions: [number, number][] = [
    [0, 1],   // horizontal left-to-right
    [1, 0],   // vertical top-to-bottom
  ];

  if (config.allowDiagonal) {
    directions.push([1, 1]);   // diagonal down-right
    directions.push([-1, 1]);  // diagonal up-right
  }

  if (config.allowReverse) {
    directions.push([0, -1]);  // horizontal right-to-left
    directions.push([-1, 0]);  // vertical bottom-to-top
    if (config.allowDiagonal) {
      directions.push([-1, -1]); // diagonal up-left
      directions.push([1, -1]);  // diagonal down-left
    }
  }

  const placedWords: PlacedWord[] = [];
  const unplacedWords: string[] = [];
  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'];

  const cleanedWords = config.words.map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length > 1);

  // Sort by length descending for easier placement
  const sortedWords = [...cleanedWords].sort((a, b) => b.length - a.length);

  for (let i = 0; i < sortedWords.length; i++) {
    const word = sortedWords[i];
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 150) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const [dr, dc] = dir;

      // Calculate starting boundaries
      const minR = dr < 0 ? word.length - 1 : 0;
      const maxR = dr > 0 ? size - word.length : size - 1;
      const minC = dc < 0 ? word.length - 1 : 0;
      const maxC = dc > 0 ? size - word.length : size - 1;

      if (minR > maxR || minC > maxC) continue;

      const startR = Math.floor(Math.random() * (maxR - minR + 1)) + minR;
      const startC = Math.floor(Math.random() * (maxC - minC + 1)) + minC;

      // Check if word can fit
      let canPlace = true;
      for (let charIdx = 0; charIdx < word.length; charIdx++) {
        const r = startR + dr * charIdx;
        const c = startC + dc * charIdx;
        const currentCell = grid[r][c];
        if (currentCell !== '' && currentCell !== word[charIdx]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        // Place letters
        for (let charIdx = 0; charIdx < word.length; charIdx++) {
          const r = startR + dr * charIdx;
          const c = startC + dc * charIdx;
          grid[r][c] = word[charIdx];
        }

        const endR = startR + dr * (word.length - 1);
        const endC = startC + dc * (word.length - 1);

        placedWords.push({
          word,
          start: [startR, startC],
          end: [endR, endC],
          color: colors[i % colors.length],
          direction: dir,
        });
        placed = true;
      }
    }

    if (!placed) {
      unplacedWords.push(word);
    }
  }

  // Fill remaining empty cells with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return {
    grid,
    placedWords,
    unplacedWords,
  };
}
