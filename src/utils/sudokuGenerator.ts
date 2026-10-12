import { SudokuConfig } from '../types';

export interface GeneratedSudoku {
  puzzle: (number | null)[][];
  solution: number[][];
}

// Generates a valid full 9x9 Sudoku board
function generateFullBoard(): number[][] {
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  function isValid(b: number[][], r: number, c: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (b[r][i] === num || b[i][c] === num) return false;
    }
    const boxR = Math.floor(r / 3) * 3;
    const boxC = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (b[boxR + i][boxC + j] === num) return false;
      }
    }
    return true;
  }

  function solve(b: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (b[r][c] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(b, r, c, num)) {
              b[r][c] = num;
              if (solve(b)) return true;
              b[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve(board);
  return board;
}

export function generateSudoku(config: SudokuConfig): GeneratedSudoku {
  const solution = generateFullBoard();
  const puzzle: (number | null)[][] = solution.map(row => [...row]);

  // Determine clues to keep
  let cluesToKeep = 34;
  if (config.difficulty === 'easy') cluesToKeep = 38;
  else if (config.difficulty === 'medium') cluesToKeep = 30;
  else if (config.difficulty === 'hard') cluesToKeep = 26;
  else if (config.difficulty === 'expert') cluesToKeep = 22;

  const cellsToRemove = 81 - cluesToKeep;
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }

  // Shuffle positions and set cells to null
  positions.sort(() => Math.random() - 0.5);
  for (let i = 0; i < cellsToRemove; i++) {
    const [r, c] = positions[i];
    puzzle[r][c] = null;
  }

  return {
    puzzle,
    solution,
  };
}
