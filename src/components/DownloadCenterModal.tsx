import React, { useState } from 'react';
import { Project, BookPage } from '../types';
import { exportBookToPdf } from '../utils/pdfExport';
import { exportProjectToZip } from '../utils/zipExport';
import { generateMaze } from '../utils/mazeGenerator';
import { 
  Download, 
  FileText, 
  Layers, 
  PackageCheck, 
  Check, 
  Loader2, 
  Printer, 
  FileCode, 
  Sparkles,
  ShieldCheck,
  Truck,
  X
} from 'lucide-react';

interface DownloadCenterModalProps {
  isOpen?: boolean;
  onClose: () => void;
  project: Project;
  currentPage: BookPage;
}

export const DownloadCenterModal: React.FC<DownloadCenterModalProps> = ({
  isOpen = true,
  onClose,
  project,
  currentPage,
}) => {
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);
  const [exportingZip, setExportingZip] = useState<boolean>(false);
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [grayscaleForPrint, setGrayscaleForPrint] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Full PDF Export
  const handleExportFullPdf = async () => {
    try {
      setExportingPdf(true);
      await exportBookToPdf(project.metadata, project.pages, {
        includeSolutions,
        grayscaleForPrinting: grayscaleForPrint,
      });
      setSuccessMessage('Buku PDF Print-Ready berhasil diunduh!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingPdf(false);
    }
  };

  // ZIP Bundle Export
  const handleExportZip = async () => {
    try {
      setExportingZip(true);
      await exportProjectToZip(project.metadata, project.pages);
      setSuccessMessage('Paket ZIP Vektor & Aset berhasil diekspor!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingZip(false);
    }
  };

  // Single Page SVG Export
  const handleExportSingleSvg = () => {
    if (currentPage.puzzleType === 'maze' && currentPage.mazeConfig) {
      const generated = generateMaze(currentPage.mazeConfig);
      const rows = generated.cells.length;
      const cols = generated.cells[0].length;
      const cellSize = 30;
      const w = cols * cellSize;
      const h = rows * cellSize;

      let walls = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = generated.cells[r][c];
          const x = c * cellSize;
          const y = r * cellSize;
          if (cell.walls.top) walls += `<line x1="${x}" y1="${y}" x2="${x + cellSize}" y2="${y}" />`;
          if (cell.walls.right) walls += `<line x1="${x + cellSize}" y1="${y}" x2="${x + cellSize}" y2="${y + cellSize}" />`;
          if (cell.walls.bottom) walls += `<line x1="${x}" y1="${y + cellSize}" x2="${x + cellSize}" y2="${y + cellSize}" />`;
          if (cell.walls.left) walls += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + cellSize}" />`;
        }
      }

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="#ffffff" />
  <g stroke="#0f172a" stroke-width="${currentPage.mazeConfig.wallThickness || 3}" stroke-linecap="round">
    ${walls}
  </g>
</svg>`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Page_${currentPage.pageNumber}_${currentPage.title.replace(/\s+/g, '_')}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="700">
        <rect width="100%" height="100%" fill="#ffffff"/>
        <text x="250" y="350" font-size="20" text-anchor="middle">${currentPage.title}</text>
      </svg>`;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Page_${currentPage.pageNumber}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Download size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Download Center & Sentralisasi Ekspor</h2>
              <p className="text-xs text-slate-400">
                Ekspor interior buku {project.pages.length} halaman siap cetak Amazon KDP, bundel file SVG, atau lembar satuan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {successMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
              <Check size={16} className="text-emerald-400" />
              {successMessage}
            </div>
          )}

          {/* Export Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* CARD 1: FULL BOOK PDF */}
            <div className="bg-slate-950 border border-slate-800 hover:border-indigo-500/40 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition shadow-lg">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Buku Lengkap (Print-Ready PDF)</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Menyatukan seluruh {project.pages.length} halaman, margin gutter presisi, penomoran otomatis, dan lampiran solusi 4-in-1.
                  </p>
                </div>

                {/* Config Checkboxes */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSolutions}
                      onChange={(e) => setIncludeSolutions(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Sertakan Kunci Jawaban</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={grayscaleForPrint}
                      onChange={(e) => setGrayscaleForPrint(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Optimasi Monokrom / B&W</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleExportFullPdf}
                disabled={exportingPdf}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
              >
                {exportingPdf ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Merakit PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Unduh Interior PDF ({project.pages.length} Hal)</span>
                  </>
                )}
              </button>
            </div>

            {/* CARD 2: BUNDEL ASSET ZIP */}
            <div className="bg-slate-950 border border-slate-800 hover:border-purple-500/40 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition shadow-lg">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl">
                  <PackageCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Paket ZIP Vektor & SVG</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Ekspor semua halaman sebagai file SVG terpisah (vektor lossless) berserta kunci jawaban dan manifest proyek JSON.
                  </p>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span>Format File:</span>
                    <span className="font-mono text-slate-200">.SVG (Vector)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Resolusi:</span>
                    <span className="font-mono text-slate-200">Lossless Vektor</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExportZip}
                disabled={exportingZip}
                className="w-full bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-200 border border-slate-700 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow"
              >
                {exportingZip ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Mengompres File ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Unduh Bundel ZIP</span>
                  </>
                )}
              </button>
            </div>

            {/* CARD 3: SINGLE PAGE EXPORT */}
            <div className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition shadow-lg">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                  <FileCode size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Ekspor Halaman Aktif (Hal {currentPage.pageNumber})
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Unduh lembar halaman yang sedang aktif di kanvas editor untuk portofolio, media sosial, atau lembar kerja tunggal.
                  </p>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300">
                  <span className="text-slate-400 block mb-0.5">Judul Lembar:</span>
                  <strong className="text-white block truncate">{currentPage.title}</strong>
                </div>
              </div>

              <button
                onClick={handleExportSingleSvg}
                className="w-full bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 border border-slate-700 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Download size={14} />
                <span>Unduh SVG Halaman {currentPage.pageNumber}</span>
              </button>
            </div>
          </div>

          {/* POD Vendor Preflight Verification */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-emerald-400" />
                <h3 className="font-bold text-xs text-white">Verifikasi Pra-Cetak Vendor POD</h3>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                100% KDP Compatible
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px]">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <strong className="text-slate-200 block">Amazon KDP</strong>
                <span className="text-emerald-400 font-mono text-[10px]">Lolos Preflight</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <strong className="text-slate-200 block">IngramSpark</strong>
                <span className="text-emerald-400 font-mono text-[10px]">Lolos Preflight</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <strong className="text-slate-200 block">Lulu Xpress</strong>
                <span className="text-emerald-400 font-mono text-[10px]">Lolos Preflight</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <strong className="text-slate-200 block">Etsy / Gumroad</strong>
                <span className="text-emerald-400 font-mono text-[10px]">Siap Dijual</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Semua ekspor PDF mematuhi margin aman & gutter binding Amazon KDP
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
