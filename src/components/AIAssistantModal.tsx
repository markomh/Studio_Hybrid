import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Copy, 
  Check, 
  Loader2, 
  BookOpen, 
  FileQuestion, 
  Image as ImageIcon,
  KeyRound,
  ArrowRight,
  X
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onApplyGeneratedTextToCurrentPage?: (text: { title?: string; instructions?: string; footerStory?: string }) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen = true,
  onClose,
  onApplyGeneratedTextToCurrentPage,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'concept' | 'story'>('prompt');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Prompt Builder State
  const [promptSubject, setPromptSubject] = useState<string>('Cute Astronaut Cat on Mars');
  const [promptStyle, setPromptStyle] = useState<string>('coloring-book');
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [negativePrompt, setNegativePrompt] = useState<string>('');

  // Book Concept State
  const [conceptNiche, setConceptNiche] = useState<string>('Kids Activity Book Ages 6-10');
  const [conceptTheme, setConceptTheme] = useState<string>('Deep Space & Cyber Planets');
  const [bookConceptData, setBookConceptData] = useState<any | null>(null);

  // Story & Lore State
  const [storyTheme, setStoryTheme] = useState<string>('Mars Asteroid Belt Expedition');
  const [storyResult, setStoryResult] = useState<any | null>(null);

  if (!isOpen) return null;

  // Copy helper
  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Generate Prompts
  const handleGeneratePrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/illustration-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: promptSubject,
          style: promptStyle,
          ageGroup: 'Children',
        }),
      });
      const data = await res.json();
      setGeneratedPrompts(data.prompts || []);
      setNegativePrompt(data.negativePrompt || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate Book Blueprint
  const handleGenerateBookConcept = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/book-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: conceptNiche,
          pagesCount: 50,
          theme: conceptTheme,
        }),
      });
      const data = await res.json();
      setBookConceptData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate Story
  const handleGenerateStory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/story-instruction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: storyTheme,
          puzzleType: 'Maze & Activity',
          targetAge: 'Kids 6-10',
          tone: 'Exciting, playful, and adventurous',
        }),
      });
      const data = await res.json();
      setStoryResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Publishing & Illustration Copilot</h2>
              <p className="text-xs text-slate-400">
                Bantu riset ide buku KDP, prompt ilustrasi vektor pewarnaan, dan narasi cerita otomatis
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
          {/* Tabs Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'prompt'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ImageIcon size={14} /> Prompt Ilustrator (Coloring/Lineart)
            </button>

            <button
              onClick={() => setActiveTab('concept')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'concept'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <BookOpen size={14} /> Ide Buku & Riset KDP
            </button>

            <button
              onClick={() => setActiveTab('story')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'story'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Wand2 size={14} /> Narasi & Instruksi Otomatis
            </button>
          </div>

          {/* TAB 1: PROMPT BUILDER */}
          {activeTab === 'prompt' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3.5">
                <h3 className="font-bold text-xs text-white uppercase tracking-wider">Parameter Prompt Generator</h3>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-300 font-medium">Subjek / Karakter</label>
                  <input
                    type="text"
                    value={promptSubject}
                    onChange={(e) => setPromptSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Contoh: Cute robot in space jungle"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-300 font-medium">Gaya Visual</label>
                  <select
                    value={promptStyle}
                    onChange={(e) => setPromptStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="coloring-book">Coloring Book (Bold Clean Outline, Black & White)</option>
                    <option value="vector-sticker">Vector Clipart / Sticker (Crisp Contours)</option>
                    <option value="kawaii-kids">Cute Kawaii Kids Style</option>
                    <option value="pixel-art">Retro Pixel Game Clipart</option>
                  </select>
                </div>

                <button
                  onClick={handleGeneratePrompts}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Generate 3 Prompt Vektor
                </button>
              </div>

              {/* Results Area */}
              <div className="md:col-span-2 space-y-3">
                <h3 className="font-bold text-xs text-white uppercase tracking-wider">Prompt Ilustrasi Siap Pakai</h3>

                {generatedPrompts.length === 0 ? (
                  <div className="bg-slate-950 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500 text-xs">
                    Klik tombol "Generate 3 Prompt Vektor" untuk membuat formula prompt AI bernilai komersial tanpa shading.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generatedPrompts.map((p, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-start justify-between gap-3 text-xs"
                      >
                        <p className="text-slate-300 font-mono leading-relaxed">{p}</p>
                        <button
                          onClick={() => handleCopy(p, idx)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg shrink-0 transition cursor-pointer"
                          title="Salin Prompt"
                        >
                          {copiedIdx === idx ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ))}

                    {negativePrompt && (
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs">
                        <span className="font-bold text-rose-400 block mb-1">Negative Prompt:</span>
                        <span className="text-slate-400 font-mono">{negativePrompt}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BOOK CONCEPT & KDP IDEAS */}
          {activeTab === 'concept' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3.5">
                <h3 className="font-bold text-xs text-white uppercase tracking-wider">Parameter Konsep Buku</h3>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-300 font-medium">Niche Amazon KDP</label>
                  <input
                    type="text"
                    value={conceptNiche}
                    onChange={(e) => setConceptNiche(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-300 font-medium">Tema Utama</label>
                  <input
                    type="text"
                    value={conceptTheme}
                    onChange={(e) => setConceptTheme(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <button
                  onClick={handleGenerateBookConcept}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Riset Blueprint & SEO KDP
                </button>
              </div>

              <div className="md:col-span-2 space-y-3">
                {bookConceptData ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                    <div>
                      <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                        Rekomendasi Judul Komersil
                      </span>
                      <h2 className="text-base font-black text-white mt-1">{bookConceptData.title}</h2>
                      <p className="text-slate-300 mt-0.5">{bookConceptData.subtitle}</p>
                    </div>

                    {/* 7 KDP Keywords */}
                    {bookConceptData.kdpKeywords && (
                      <div>
                        <span className="font-bold text-slate-200 block mb-1.5 flex items-center gap-1.5">
                          <KeyRound size={13} className="text-amber-400" />
                          7 Kata Kunci SEO Amazon KDP:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {bookConceptData.kdpKeywords.map((kw: string, i: number) => (
                            <span key={i} className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[11px]">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chapter breakdown */}
                    {bookConceptData.chapterBreakdown && (
                      <div>
                        <span className="font-bold text-slate-200 block mb-1.5">Struktur 50 Halaman:</span>
                        <div className="space-y-1.5">
                          {bookConceptData.chapterBreakdown.map((ch: any, i: number) => (
                            <div key={i} className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="font-bold text-slate-200">{ch.name}</span>
                              <div className="flex items-center gap-3 text-slate-400">
                                <span>{ch.pages} Halaman</span>
                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300">{ch.difficulty}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500 text-xs">
                    Klik tombol "Riset Blueprint & SEO KDP" untuk mendapatkan rekomendasi judul terlaris dan 7 keyword Amazon KDP.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STORY & INSTRUCTIONS */}
          {activeTab === 'story' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3.5">
                <h3 className="font-bold text-xs text-white uppercase tracking-wider">Generator Narasi Cerita</h3>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-300 font-medium">Tema Halaman</label>
                  <input
                    type="text"
                    value={storyTheme}
                    onChange={(e) => setStoryTheme(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <button
                  onClick={handleGenerateStory}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Buat Instruksi & Cerita
                </button>
              </div>

              <div className="md:col-span-2 space-y-3">
                {storyResult ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                    <div>
                      <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                        Instruksi Bermain:
                      </span>
                      <p className="text-slate-200 text-sm leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                        {storyResult.instruction}
                      </p>
                    </div>

                    <div>
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                        Narasi Penutup (Footer Story):
                      </span>
                      <p className="text-slate-300 italic font-serif leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                        "{storyResult.footerStory}"
                      </p>
                    </div>

                    {onApplyGeneratedTextToCurrentPage && (
                      <button
                        onClick={() => {
                          onApplyGeneratedTextToCurrentPage({
                            instructions: storyResult.instruction,
                            footerStory: `"${storyResult.footerStory}"`,
                          });
                          onClose();
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg"
                      >
                        Terapkan Langsung ke Halaman Kanvas <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500 text-xs">
                    Buat cerita latar belakang dan panduan bermain yang seru untuk pembaca cilik.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            AI didukung oleh Gemini 3.8 Flash Engine
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
