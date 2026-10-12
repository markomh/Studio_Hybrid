import { MazeCell, MazeConfig } from '../types';

// Simple pseudo-random number generator for reproducible seeds
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface GeneratedMaze {
  cells: MazeCell[][];
  solutionPath: [number, number][];
  startCoord: [number, number];
  finishCoord: [number, number];
}

export function generateMaze(config: MazeConfig): GeneratedMaze {
  const { rows, cols, seed } = config;
  const rand = seededRandom(seed || Math.floor(Math.random() * 100000));

  // Initialize cells
  const cells: MazeCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: MazeCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        x: c,
        y: r,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
      });
    }
    cells.push(row);
  }

  // Recursive Backtracker algorithm
  const stack: [number, number][] = [];
  const startR = 0;
  const startC = 0;
  cells[startR][startC].visited = true;
  stack.push([startR, startC]);

  const directions = [
    { dr: -1, dc: 0, wall: 'top', oppWall: 'bottom' },
    { dr: 0, dc: 1, wall: 'right', oppWall: 'left' },
    { dr: 1, dc: 0, wall: 'bottom', oppWall: 'top' },
    { dr: 0, dc: -1, wall: 'left', oppWall: 'right' },
  ] as const;

  while (stack.length > 0) {
    const [currentR, currentC] = stack[stack.length - 1];
    const neighbors: { r: number; c: number; dirIdx: number }[] = [];

    for (let i = 0; i < directions.length; i++) {
      const nr = currentR + directions[i].dr;
      const nc = currentC + directions[i].dc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !cells[nr][nc].visited) {
        neighbors.push({ r: nr, c: nc, dirIdx: i });
      }
    }

    if (neighbors.length > 0) {
      // Pick random unvisited neighbor
      const chosenIdx = Math.floor(rand() * neighbors.length);
      const chosen = neighbors[chosenIdx];
      const dir = directions[chosen.dirIdx];

      // Knock down walls between current and chosen
      (cells[currentR][currentC].walls as any)[dir.wall] = false;
      (cells[chosen.r][chosen.c].walls as any)[dir.oppWall] = false;

      cells[chosen.r][chosen.c].visited = true;
      stack.push([chosen.r, chosen.c]);
    } else {
      stack.pop();
    }
  }

  // Optional: add loops if easy/medium to make more forgiving
  if (config.difficulty === 'easy') {
    const loopsCount = Math.floor((rows * cols) * 0.05);
    for (let i = 0; i < loopsCount; i++) {
      const r = Math.floor(rand() * (rows - 2)) + 1;
      const c = Math.floor(rand() * (cols - 2)) + 1;
      if (rand() > 0.5) {
        cells[r][c].walls.right = false;
        cells[r][c + 1].walls.left = false;
      } else {
        cells[r][c].walls.bottom = false;
        cells[r + 1][c].walls.top = false;
      }
    }
  }

  // Entry and Exit points
  let startCoord: [number, number] = [0, 0];
  let finishCoord: [number, number] = [rows - 1, cols - 1];

  if (config.startCorner === 'bottomLeft') {
    startCoord = [rows - 1, 0];
  } else if (config.startCorner === 'random') {
    startCoord = [0, Math.floor(rand() * cols)];
  }

  if (config.finishCorner === 'topRight') {
    finishCoord = [0, cols - 1];
  } else if (config.finishCorner === 'random') {
    finishCoord = [rows - 1, Math.floor(rand() * cols)];
  }

  // Find exact solution path via BFS
  const solutionPath = solveMazeBFS(cells, startCoord, finishCoord);

  return {
    cells,
    solutionPath,
    startCoord,
    finishCoord,
  };
}

function solveMazeBFS(
  cells: MazeCell[][],
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const rows = cells.length;
  const cols = cells[0].length;
  const queue: [number, number][] = [start];
  const visited = new Set<string>();
  const parent = new Map<string, [number, number]>();

  const startKey = `${start[0]},${start[1]}`;
  visited.add(startKey);

  const directions = [
    { dr: -1, dc: 0, wall: 'top' },
    { dr: 0, dc: 1, wall: 'right' },
    { dr: 1, dc: 0, wall: 'bottom' },
    { dr: 0, dc: -1, wall: 'left' },
  ] as const;

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    if (cr === end[0] && cc === end[1]) {
      // Reconstruct path
      const path: [number, number][] = [];
      let curr: [number, number] | undefined = end;
      while (curr) {
        path.push(curr);
        const k = `${curr[0]},${curr[1]}`;
        curr = parent.get(k);
      }
      return path.reverse();
    }

    const currentCell = cells[cr][cc];

    for (const dir of directions) {
      // Check if wall is open
      const hasWall = (currentCell.walls as any)[dir.wall];
      if (!hasWall) {
        const nr = cr + dir.dr;
        const nc = cc + dir.dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const key = `${nr},${nc}`;
          if (!visited.has(key)) {
            visited.add(key);
            parent.set(key, [cr, cc]);
            queue.push([nr, nc]);
          }
        }
      }
    }
  }

  return [];
}
