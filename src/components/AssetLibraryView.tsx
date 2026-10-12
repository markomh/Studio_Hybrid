import React, { useState } from 'react';
import { ASSET_CATEGORIES } from '../data/assets';
import { AssetClipart, BookPage } from '../types';
import { 
  Search, 
  Sparkles, 
  Check, 
  X,
  Layers, 
  Image as ImageIcon,
  Plus
} from 'lucide-react';

interface AssetLibraryViewProps {
  isOpen?: boolean;
  onClose: () => void;
  currentPage: BookPage;
  onApplyAssetToPage: (asset: AssetClipart, role: 'start' | 'finish' | 'sticker') => void;
  onApplyBorderToPage: (borderStyle: any) => void;
}

export const AssetLibraryView: React.FC<AssetLibraryViewProps> = ({
  isOpen = true,
  onClose,
  currentPage,
  onApplyAssetToPage,
  onApplyBorderToPage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const allAssets = ASSET_CATEGORIES.flatMap((c) => c.items);

  const filteredAssets = allAssets.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleApply = (asset: AssetClipart, role: 'start' | 'finish' | 'sticker') => {
    onApplyAssetToPage(asset, role);
    setFeedback(`Berhasil menerapkan ${asset.title} sebagai ikon ${role.toUpperCase()} di Halaman ${currentPage.pageNumber}!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Galeri Aset Kreatif & Karakter</h2>
              <p className="text-xs text-slate-400">
                Pilih ikon vektor, stiker, dan bingkai untuk disisipkan langsung ke Halaman {currentPage.pageNumber}
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
          {/* Success Notification */}
          {feedback && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
              <Check size={14} className="text-emerald-400" />
              {feedback}
            </div>
          )}

          {/* Search & Category Tabs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari maskot, roket, dinosaurus, piala, bintang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Categories Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Semua Aset
              </button>
              {ASSET_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 p-3.5 rounded-xl flex flex-col items-center justify-between group transition hover:scale-[1.02] shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-3xl shadow-inner border border-slate-800 mb-2 group-hover:scale-110 transition-transform">
                  {asset.emoji}
                </div>

                <div className="text-center w-full mb-2.5">
                  <h3 className="font-bold text-xs text-slate-200 truncate">{asset.title}</h3>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {asset.tags.map((t, i) => (
                      <span key={i} className="text-[8px] bg-slate-800/80 text-slate-400 px-1 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Application CTAs */}
                <div className="w-full grid grid-cols-2 gap-1 text-[10px]">
                  <button
                    onClick={() => handleApply(asset, 'start')}
                    className="bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 py-1 rounded font-semibold transition text-center cursor-pointer"
                    title="Jadikan Titik Start"
                  >
                    Set START
                  </button>
                  <button
                    onClick={() => handleApply(asset, 'finish')}
                    className="bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 py-1 rounded font-semibold transition text-center cursor-pointer"
                    title="Jadikan Titik Finish"
                  >
                    Set FINISH
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Aset yang dipilih langsung aktif pada <strong className="text-indigo-400">Halaman {currentPage.pageNumber}</strong>
          </span>
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Selesai / Kembali ke Kanvas
          </button>
        </div>
      </div>
    </div>
  );
};
