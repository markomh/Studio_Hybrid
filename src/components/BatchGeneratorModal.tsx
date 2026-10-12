import React, { useState } from 'react';
import { BookPage, PuzzleType, DifficultyLevel } from '../types';
import { generateMaze } from '../utils/mazeGenerator';
import { generateWordSearch } from '../utils/wordSearchGenerator';
import { generateSudoku } from '../utils/sudokuGenerator';
import { 
  X, 
  Wand2, 
  Sparkles, 
  Layers, 
  Check, 
  Loader2, 
  ArrowRight,
  Zap
} from 'lucide-react';

interface BatchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchGenerated: (newPages: BookPage[]) => void;
}

export const BatchGeneratorModal: React.FC<BatchGeneratorModalProps> = ({
  isOpen,
  onClose,
  onBatchGenerated,
}) => {
  const [count, setCount] = useState<number>(50);
  const [puzzleType, setPuzzleType] = useState<PuzzleType | 'mixed'>('maze');
  const [theme, setTheme] = useState<string>('Space & Mars Exploration');
  const [difficultyCurve, setDifficultyCurve] = useState<'progressive' | 'easy' | 'medium' | 'hard'>('progressive');
  const [includeAnswerKeys, setIncludeAnswerKeys] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExecuteBatch = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const generatedPages: BookPage[] = [];

      for (let i = 1; i <= count; i++) {
        // Determine difficulty
        let diff: DifficultyLevel = 'medium';
        if (difficultyCurve === 'progressive') {
          if (i <= count * 0.35) diff = 'easy';
          else if (i <= count * 0.75) diff = 'medium';
          else diff = 'hard';
        } else {
          diff = difficultyCurve;
        }

        // Determine puzzle type
        let pType: PuzzleType = 'maze';
        if (puzzleType === 'mixed') {
          const mod = i % 4;
          if (mod === 1) pType = 'maze';
          else if (mod === 2) pType = 'wordsearch';
          else if (mod === 3) pType = 'sudoku';
          else pType = 'worksheet';
        } else {
          pType = puzzleType;
        }

        if (pType === 'maze') {
          const rows = diff === 'easy' ? 15 : diff === 'medium' ? 20 : 25;
          const mCfg = {
            rows,
            cols: rows,
            algorithm: 'recursive-backtracker' as const,
            difficulty: diff,
            wallThickness: 3,
            wallColor: '#1e293b',
            solutionColor: '#ef4444',
            startIcon: i % 2 === 0 ? '🚀' : '🏃',
            finishIcon: i % 2 === 0 ? '🪐' : '🏆',
            startCorner: 'topLeft' as const,
            finishCorner: 'bottomRight' as const,
            seed: 2000 + i * 43,
          };
          const gen = generateMaze(mCfg);

          generatedPages.push({
            id: `batch_p_${i}`,
            pageNumber: i,
            title: `Misi Labirin #${i}`,
            puzzleType: 'maze',
            difficulty: diff,
            mazeConfig: mCfg,
            solutionPath: gen.solutionPath,
            textElement: {
              id: `batch_t_${i}`,
              title: `Misi Labirin #${i}`,
              subtitle: `Level ${diff.toUpperCase()} • ${theme}`,
              instructions: `Telusuri jalur aman menembus rintangan untuk mencapai tujuan finish!`,
              footerStory: `"Hebat! Halaman ${i} diselesaikan dengan strategi terbaik."`,
              fontFamily: 'serif',
              titleSize: 22,
              align: 'center',
            },
            borderStyle: 'rounded',
            borderColor: '#334155',
          });
        } else if (pType === 'wordsearch') {
          const words = ['GALAXY', 'ASTEROID', 'COMET', 'PLANET', 'ORBIT', 'ROCKET', 'SATELLITE', 'COSMOS'];
          const wsCfg = {
            gridSize: 12,
            words,
            theme: `${theme} #${i}`,
            difficulty: diff,
            allowDiagonal: true,
            allowReverse: diff !== 'easy',
          };
          const genWs = generateWordSearch(wsCfg);

          generatedPages.push({
            id: `batch_p_${i}`,
            pageNumber: i,
            title: `Pencarian Kata #${i}`,
            puzzleType: 'wordsearch',
            difficulty: diff,
            wordSearchConfig: wsCfg,
            wordSearchGrid: {
              grid: genWs.grid,
              placedWords: genWs.placedWords,
            },
            textElement: {
              id: `batch_t_${i}`,
              title: `Pencarian Kata #${i}`,
              subtitle: `Temukan 8 Kata Tersembunyi`,
              instructions: `Temukan seluruh kosakata yang terdaftar di samping kotak teka-teki!`,
              footerStory: `"Kecermatan matamu sangat luar biasa! Lanjutkan petualangan."`,
              fontFamily: 'sans',
              titleSize: 22,
              align: 'center',
            },
            borderStyle: 'rounded',
            borderColor: '#334155',
          });
        } else if (pType === 'sudoku') {
          const sCfg = {
            difficulty: diff,
            givensCount: diff === 'easy' ? 36 : diff === 'medium' ? 30 : 24,
          };
          const genSudoku = generateSudoku(sCfg);

          generatedPages.push({
            id: `batch_p_${i}`,
            pageNumber: i,
            title: `Sudoku Logika #${i}`,
            puzzleType: 'sudoku',
            difficulty: diff,
            sudokuConfig: sCfg,
            sudokuBoard: genSudoku,
            textElement: {
              id: `batch_t_${i}`,
              title: `Sudoku Logika #${i}`,
              subtitle: `Level ${diff.toUpperCase()}`,
              instructions: `Isi angka 1 sampai 9 di setiap baris, kolom, dan kotak 3x3!`,
              footerStory: `"Konsentrasi dan fokus pikiranmu semakin terasah tajam."`,
              fontFamily: 'sans',
              titleSize: 22,
              align: 'center',
            },
            borderStyle: 'simple',
            borderColor: '#334155',
          });
        } else {
          // Worksheet
          const wsConfig = {
            subject: 'math' as const,
            topic: `Math Challenge #${i}`,
            grade: 'Grade 3-4',
            instructions: 'Hitung dan tuliskan jawabanmu pada garis yang disediakan.',
            questions: [
              { id: '1', q: `${i * 3} + ${i * 4} = ?`, a: `${i * 7}` },
              { id: '2', q: `${100 - i * 2} - 15 = ?`, a: `${85 - i * 2}` },
              { id: '3', q: `${i} × 6 = ?`, a: `${i * 6}` },
              { id: '4', q: `Setengah dari ${i * 20} adalah?`, a: `${i * 10}` },
            ],
          };

          generatedPages.push({
            id: `batch_p_${i}`,
            pageNumber: i,
            title: `Lembar Hitung #${i}`,
            puzzleType: 'worksheet',
            difficulty: diff,
            worksheetConfig: wsConfig,
            textElement: {
              id: `batch_t_${i}`,
              title: `Lembar Hitung #${i}`,
              subtitle: `Skill Builder`,
              instructions: 'Selesaikan soal di bawah ini dengan teliti.',
              footerStory: '"Latihan konsisten akan membuatmu semakin ahli!"',
              fontFamily: 'sans',
              titleSize: 20,
              align: 'center',
            },
            borderStyle: 'rounded',
            borderColor: '#334155',
          });
        }
      }

      setIsProcessing(false);
      onBatchGenerated(generatedPages);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Wand2 size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Batch Workflow Automation</h2>
              <p className="text-xs text-slate-400">
                Generate hingga 100 halaman konten buku bergradasi dalam sekali klik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Count */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Jumlah Halaman Buku</label>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCount(num)}
                  className={`py-2 rounded-lg font-bold border transition ${
                    count === num
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {num} Hal
                </button>
              ))}
            </div>
          </div>

          {/* Puzzle Type */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Tipe Puzzle / Konten</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPuzzleType('maze')}
                className={`p-2.5 rounded-lg font-semibold border text-left flex items-center gap-2 transition ${
                  puzzleType === 'maze'
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-700 text-slate-300'
                }`}
              >
                <span>🧩</span> Labirin (Full Mazes)
              </button>
              <button
                type="button"
                onClick={() => setPuzzleType('wordsearch')}
                className={`p-2.5 rounded-lg font-semibold border text-left flex items-center gap-2 transition ${
                  puzzleType === 'wordsearch'
                    ? 'bg-pink-950/60 border-pink-500 text-pink-300'
                    : 'bg-slate-950 border-slate-700 text-slate-300'
                }`}
              >
                <span>🔍</span> Word Search Book
              </button>
              <button
                type="button"
                onClick={() => setPuzzleType('sudoku')}
                className={`p-2.5 rounded-lg font-semibold border text-left flex items-center gap-2 transition ${
                  puzzleType === 'sudoku'
                    ? 'bg-violet-950/60 border-violet-500 text-violet-300'
                    : 'bg-slate-950 border-slate-700 text-slate-300'
                }`}
              >
                <span>🔢</span> Sudoku 9x9 Book
              </button>
              <button
                type="button"
                onClick={() => setPuzzleType('mixed')}
                className={`p-2.5 rounded-lg font-semibold border text-left flex items-center gap-2 transition ${
                  puzzleType === 'mixed'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-700 text-slate-300'
                }`}
              >
                <span>🎨</span> Mixed Activity Book
              </button>
            </div>
          </div>

          {/* Difficulty Curve */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Kurva Tingkat Kesulitan</label>
            <select
              value={difficultyCurve}
              onChange={(e) => setDifficultyCurve(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="progressive">Gradasi Otomatis (35% Mudah ➔ 40% Sedang ➔ 25% Sulit)</option>
              <option value="easy">Semua Mudah (Untuk Anak Usia 4-7)</option>
              <option value="medium">Semua Sedang (Anak 8-12 & Remaja)</option>
              <option value="hard">Semua Sulit (Tantangan Ekstrem)</option>
            </select>
          </div>

          {/* Theme */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Tema Narasi & Judul</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="Contoh: Space Explorer, Dino Quest, Underwater Wonder"
            />
          </div>

          {/* Options */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={includeAnswerKeys}
                onChange={(e) => setIncludeAnswerKeys(e.target.checked)}
                className="accent-indigo-500 rounded"
              />
              <span>Generate Kunci Jawaban Otomatis di Akhir Buku (KDP Multi-Up)</span>
            </label>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1.5 transition"
          >
            Batal
          </button>
          <button
            onClick={handleExecuteBatch}
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Membuat {count} Halaman...</span>
              </>
            ) : (
              <>
                <Zap size={14} className="text-amber-400" />
                <span>Mulai Batch Generate ({count} Hal)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
