import { Project, BookPage } from '../types';
import { generateMaze } from '../utils/mazeGenerator';
import { generateWordSearch } from '../utils/wordSearchGenerator';
import { generateSudoku } from '../utils/sudokuGenerator';

export function createDefaultProject(): Project {
  // Page 1: Mars Maze
  const mazeConfig1 = {
    rows: 15,
    cols: 15,
    algorithm: 'recursive-backtracker' as const,
    difficulty: 'easy' as const,
    wallThickness: 3.5,
    wallColor: '#1e293b',
    solutionColor: '#ef4444',
    startIcon: '🚀',
    finishIcon: '🪐',
    startCorner: 'topLeft' as const,
    finishCorner: 'bottomRight' as const,
    seed: 4281,
  };
  const genMaze1 = generateMaze(mazeConfig1);

  // Page 2: Lunar Crater Maze
  const mazeConfig2 = {
    rows: 18,
    cols: 18,
    algorithm: 'recursive-backtracker' as const,
    difficulty: 'medium' as const,
    wallThickness: 3,
    wallColor: '#1e293b',
    solutionColor: '#ef4444',
    startIcon: '🐱',
    finishIcon: '🐟',
    startCorner: 'topLeft' as const,
    finishCorner: 'bottomRight' as const,
    seed: 9812,
  };
  const genMaze2 = generateMaze(mazeConfig2);

  // Page 3: Asteroid Word Search
  const wsConfig = {
    gridSize: 12,
    words: ['GALAXY', 'PLANET', 'ORBIT', 'ROCKET', 'COMET', 'NEBULA', 'ASTRONAUT', 'COSMOS'],
    theme: 'Space Exploration',
    difficulty: 'medium' as const,
    allowDiagonal: true,
    allowReverse: true,
  };
  const genWs = generateWordSearch(wsConfig);

  // Page 4: Stellar Sudoku
  const sudokuConfig = {
    difficulty: 'easy' as const,
    givensCount: 36,
  };
  const genSudoku = generateSudoku(sudokuConfig);

  // Page 5: STEM Math Worksheet
  const worksheetConfig = {
    subject: 'math' as const,
    topic: 'Astronaut Speed Calculations',
    grade: 'Grade 3-4',
    instructions: 'Calculate the flight trajectories and fuel levels for the rocket landing.',
    questions: [
      { id: 'q1', q: 'A rocket travels 350 km in 5 minutes. How many km per minute is that?', a: '70 km/min' },
      { id: 'q2', q: 'If the fuel tank holds 500 liters and burns 45 liters per hour, how much fuel remains after 4 hours?', a: '320 liters' },
      { id: 'q3', q: 'Astronaut Leo spent 14 days on Mars and 18 days on the Space Station. How many days in total?', a: '32 days' },
      { id: 'q4', q: 'The rover collected 18 rock samples on Monday and 24 on Tuesday. How many samples altogether?', a: '42 samples' },
      { id: 'q5', q: 'Divide 72 space rations equally among 6 crew members. How many rations each?', a: '12 rations' },
      { id: 'q6', q: 'What is (15 × 4) + 25?', a: '85' },
    ],
  };

  const pages: BookPage[] = [
    {
      id: 'p1',
      pageNumber: 1,
      title: 'Misi Menuju Mars',
      puzzleType: 'maze',
      difficulty: 'easy',
      mazeConfig: mazeConfig1,
      solutionPath: genMaze1.solutionPath,
      textElement: {
        id: 't1',
        title: 'Misi Menuju Mars',
        subtitle: 'Level 1 • Mudah',
        instructions: 'Bantu Astronaut menemukan jalur yang aman menembus sabuk asteroid untuk mencapai planet Mars!',
        footerStory: '"Bagus sekali! Kamu telah menyelamatkan Kapten Leo dari sabuk asteroid."',
        fontFamily: 'serif',
        titleSize: 24,
        align: 'center',
      },
      borderStyle: 'rounded',
      borderColor: '#334155',
    },
    {
      id: 'p2',
      pageNumber: 2,
      title: 'Kawah Bulan Misterius',
      puzzleType: 'maze',
      difficulty: 'medium',
      mazeConfig: mazeConfig2,
      solutionPath: genMaze2.solutionPath,
      textElement: {
        id: 't2',
        title: 'Kawah Bulan Misterius',
        subtitle: 'Level 2 • Sedang',
        instructions: 'Kucing Astronaut mencari camilan ikan tuna kosmik yang tertinggal di kawah bulan!',
        footerStory: '"Nyam! Si Kucing kosmik kenyang dan siap untuk misi berikutnya."',
        fontFamily: 'serif',
        titleSize: 22,
        align: 'center',
      },
      borderStyle: 'simple',
      borderColor: '#334155',
    },
    {
      id: 'p3',
      pageNumber: 3,
      title: 'Pencarian Kosmik',
      puzzleType: 'wordsearch',
      difficulty: 'medium',
      wordSearchConfig: wsConfig,
      wordSearchGrid: {
        grid: genWs.grid,
        placedWords: genWs.placedWords,
      },
      textElement: {
        id: 't3',
        title: 'Pencarian Kata Kosmik',
        subtitle: 'Temukan 8 Istilah Antariksa',
        instructions: 'Cari kata-kata antariksa yang tersembunyi secara mendatar, menurun, atau menyilang!',
        footerStory: '"Kosakata antariksamu luar biasa tajam! Jelajah lebih jauh."',
        fontFamily: 'sans',
        titleSize: 22,
        align: 'center',
      },
      borderStyle: 'rounded',
      borderColor: '#334155',
    },
    {
      id: 'p4',
      pageNumber: 4,
      title: 'Sudoku Galaksi',
      puzzleType: 'sudoku',
      difficulty: 'easy',
      sudokuConfig: sudokuConfig,
      sudokuBoard: genSudoku,
      textElement: {
        id: 't4',
        title: 'Sudoku Galaksi 9x9',
        subtitle: 'Latih Logika Otak',
        instructions: 'Isi angka 1 sampai 9 di setiap baris, kolom, dan kotak 3x3 tanpa ada angka kembar!',
        footerStory: '"Logika pikiranmu sekuat gravitasi bintang neutron!"',
        fontFamily: 'sans',
        titleSize: 22,
        align: 'center',
      },
      borderStyle: 'simple',
      borderColor: '#334155',
    },
    {
      id: 'p5',
      pageNumber: 5,
      title: 'Lembar Hitung Trajektori',
      puzzleType: 'worksheet',
      difficulty: 'medium',
      worksheetConfig: worksheetConfig,
      textElement: {
        id: 't5',
        title: 'Lembar Hitung Trajektori',
        subtitle: 'STEM Math • Grade 3-4',
        instructions: 'Selesaikan perhitungan navigasi roket di bawah ini dan tuliskan jawabanmu di garis yang tersedia.',
        footerStory: '"Semua kalkulasi presisi! Roket mendarat dengan sempurna di landasan."',
        fontFamily: 'sans',
        titleSize: 20,
        align: 'center',
      },
      borderStyle: 'rounded',
      borderColor: '#334155',
    },
  ];

  // Auto-generate additional pages up to 50 for realistic full book preview
  for (let i = 6; i <= 50; i++) {
    const diff = i <= 20 ? 'easy' : i <= 40 ? 'medium' : 'hard';
    const rows = i <= 20 ? 15 : i <= 40 ? 20 : 25;
    const mCfg = {
      rows,
      cols: rows,
      algorithm: 'recursive-backtracker' as const,
      difficulty: diff as any,
      wallThickness: 3,
      wallColor: '#1e293b',
      solutionColor: '#ef4444',
      startIcon: i % 2 === 0 ? '🚀' : '🏃',
      finishIcon: i % 2 === 0 ? '🪐' : '🏆',
      startCorner: 'topLeft' as const,
      finishCorner: 'bottomRight' as const,
      seed: 1000 + i * 37,
    };

    pages.push({
      id: `p${i}`,
      pageNumber: i,
      title: `Labirin Tantangan #${i}`,
      puzzleType: 'maze',
      difficulty: diff as any,
      mazeConfig: mCfg,
      textElement: {
        id: `t${i}`,
        title: `Labirin Tantangan #${i}`,
        subtitle: `Tingkat Kesulitan: ${diff.toUpperCase()}`,
        instructions: 'Cari jalan dari awal menuju akhir tanpa menabrak dinding rintangan!',
        footerStory: `"Bagus sekali! Halaman ${i} berhasil dituntaskan dengan gemilang."`,
        fontFamily: 'serif',
        titleSize: 22,
        align: 'center',
      },
      borderStyle: 'rounded',
      borderColor: '#334155',
    });
  }

  return {
    metadata: {
      id: 'proj_mars_01',
      name: 'Buku_Labirin_Mars_01',
      targetKdpFormat: 'A4',
      paperColor: 'white',
      bleed: true,
      margins: {
        topMm: 15,
        bottomMm: 15,
        insideMm: 20, // gutter
        outsideMm: 15,
      },
      pagination: {
        enabled: true,
        startPage: 1,
        position: 'bottom-center',
        format: 'dash',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['KDP Ready', 'Kids Activity', 'Space Theme', '50 Pages'],
    },
    pages,
  };
}
