import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ================= API ROUTES ================= //

// 1. Story & Instruction Generator
app.post('/api/ai/story-instruction', async (req, res) => {
  try {
    const { theme, targetAge, puzzleType, title, tone } = req.body;
    
    if (!ai) {
      // High-quality smart contextual fallback
      return res.json({
        instruction: `Help the explorer navigate through the ${theme || 'cosmic labyrinth'} to reach the finish line safely! Watch out for dead ends and trace your path carefully.`,
        footerStory: `Great job! You navigated past the tricky turns of ${theme || 'the maze'} with flying colors!`,
        hints: ['Start from the green marker and look two steps ahead before drawing.', 'If you hit a dead end, backtrack to the last intersection.']
      });
    }

    const prompt = `You are an expert children's activity book & puzzle author.
Generate playful, engaging content for an activity book page.
Details:
- Puzzle Type: ${puzzleType || 'Maze'}
- Page Title: ${title || 'Mystery Challenge'}
- Theme: ${theme || 'Space Exploration'}
- Target Audience: ${targetAge || 'Kids 6-10'}
- Tone: ${tone || 'Exciting and playful'}

Provide the response strictly in JSON format with this structure:
{
  "instruction": "Short, clear instructions for how to solve this puzzle (1-2 sentences)",
  "footerStory": "A playful congratulatory or motivational narrative sentence for when they finish (1 sentence)",
  "hints": ["Hint 1", "Hint 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI story generation error:', error);
    res.json({
      instruction: 'Trace the path carefully from start to finish without crossing any boundary walls!',
      footerStory: 'Champion move! You conquered this challenge like a pro!',
      hints: ['Scan the exits first to find the most open path.']
    });
  }
});

// 2. Vocabulary & Word Search Generator
app.post('/api/ai/word-search-theme', async (req, res) => {
  try {
    const { theme, count = 10, difficulty = 'medium' } = req.body;

    if (!ai) {
      const fallbackWords = ['GALAXY', 'PLANET', 'ORBIT', 'COMET', 'ROCKET', 'ASTEROID', 'METEOR', 'TELESCOPE', 'NEBULA', 'COSMOS'];
      return res.json({
        themeTitle: theme ? `${theme.toUpperCase()} EXPEDITION` : 'COSMIC EXPEDITION',
        words: fallbackWords.slice(0, Number(count)),
        clues: fallbackWords.map(w => `Discover ${w} hidden in the grid!`)
      });
    }

    const prompt = `Generate a word search puzzle word list and clues.
Theme: "${theme || 'Animals'}"
Word Count: ${count}
Difficulty: ${difficulty}

Rules:
- All words must only contain uppercase alphabetic characters (A-Z), no spaces or hyphens.
- Length of each word: 3 to 10 letters.
- Include a fun, engaging title for the puzzle page.

Return JSON format:
{
  "themeTitle": "A catchy uppercase title",
  "words": ["WORD1", "WORD2", ...],
  "clues": ["Clue 1", "Clue 2", ...]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI word search generation error:', error);
    res.json({
      themeTitle: 'ADVENTURE SEARCH',
      words: ['BRAVE', 'EXPLORE', 'JOURNEY', 'QUEST', 'MAP', 'COMPASS', 'ISLAND', 'TREASURE'],
      clues: ['Search horizontally, vertically, and diagonally!']
    });
  }
});

// 3. Worksheet Math & Science Question Generator
app.post('/api/ai/worksheet', async (req, res) => {
  try {
    const { subject = 'math', grade = 'Grade 2-3', topic = 'Addition & Subtraction', count = 8 } = req.body;

    if (!ai) {
      const mockQuestions = [
        { q: '14 + 18 = ?', a: '32', options: ['28', '30', '32', '34'] },
        { q: '45 - 19 = ?', a: '26', options: ['24', '26', '28', '30'] },
        { q: '7 × 4 = ?', a: '28', options: ['24', '26', '28', '32'] },
        { q: '60 ÷ 5 = ?', a: '12', options: ['10', '11', '12', '15'] },
        { q: '33 + 27 = ?', a: '60', options: ['50', '58', '60', '62'] },
        { q: '50 - 23 = ?', a: '27', options: ['25', '27', '29', '31'] },
      ];
      return res.json({
        title: `${subject.toUpperCase()} PRACTICE WORKSHEET`,
        subtitle: `Skill Builder: ${topic} (${grade})`,
        questions: mockQuestions.slice(0, Number(count)),
      });
    }

    const prompt = `Create an educational worksheet suitable for print or printable PDF.
Subject: ${subject}
Grade Level: ${grade}
Topic: ${topic}
Number of items: ${count}

Return strictly JSON:
{
  "title": "Clear catchy title",
  "subtitle": "Subtitle with focus skill",
  "instructions": "Directions for the student",
  "questions": [
    {
      "q": "The question or problem",
      "a": "Correct answer",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI worksheet generation error:', error);
    res.json({
      title: 'QUICK LEARNING WORKSHEET',
      subtitle: 'Knowledge Check',
      instructions: 'Solve each question carefully and write your answers in the space provided.',
      questions: [
        { q: 'What is 15 + 27?', a: '42', options: ['40', '41', '42', '44'] },
        { q: 'What is 50 - 18?', a: '32', options: ['30', '32', '34', '36'] },
      ]
    });
  }
});

// 4. Activity Book Concept & Idea Builder
app.post('/api/ai/book-concept', async (req, res) => {
  try {
    const { niche = 'Kids Activity Book', pagesCount = 50, theme = 'Space & Science' } = req.body;

    if (!ai) {
      return res.json({
        title: 'Galactic Odyssey: Maze & Puzzle Adventure',
        subtitle: '50 Exciting Missions for Curious Minds',
        targetAudience: 'Kids ages 6-10, KDP Low Content & Activity Books',
        kdpKeywords: ['kids maze book', 'space activity book', 'stem puzzles for children', 'travel games for kids'],
        chapterBreakdown: [
          { name: 'Launch Pad (Warmup)', pages: 10, difficulty: 'Easy' },
          { name: 'Asteroid Belt (Explorer)', pages: 20, difficulty: 'Medium' },
          { name: 'Deep Nebula (Master)', pages: 15, difficulty: 'Hard' },
          { name: 'Mission Log (Answer Keys)', pages: 5, difficulty: 'Solutions' }
        ]
      });
    }

    const prompt = `You are a best-selling Amazon KDP publisher and activity book strategist.
Suggest a comprehensive book blueprint.
Niche: ${niche}
Target Page Count: ${pagesCount}
Theme: ${theme}

Provide response strictly in JSON:
{
  "title": "Commercial, catchy book title",
  "subtitle": "High-converting subtitle",
  "targetAudience": "Target age and buyer profile",
  "kdpKeywords": ["7 search keywords for Amazon KDP SEO"],
  "chapterBreakdown": [
    { "name": "Chapter 1 Title", "pages": 12, "difficulty": "Easy" }
  ],
  "designTips": ["Tip 1 for black & white printing", "Tip 2 for margins"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI book concept error:', error);
    res.json({
      title: 'Cosmic Quest: 50 Epic Mazes & Puzzles',
      subtitle: 'The Ultimate Brain Challenge for Young Explorers',
      targetAudience: 'Ages 6-10',
      kdpKeywords: ['activity book', 'puzzle book for kids', 'maze challenge', 'kdp publishing'],
      chapterBreakdown: [
        { name: 'Beginner Quests', pages: 15, difficulty: 'Easy' },
        { name: 'Advanced Missions', pages: 25, difficulty: 'Medium to Hard' },
        { name: 'Answer Keys', pages: 10, difficulty: 'Solutions' }
      ]
    });
  }
});

// 5. Prompt Builder for Digital Illustrators / Coloring Book Creators
app.post('/api/ai/illustration-prompts', async (req, res) => {
  const { subject = 'space character', style = 'coloring-book', ageGroup = 'children' } = req.body || {};
  try {
    if (!ai) {
      return res.json({
        prompts: [
          `Clean black and white line art of a cute astronaut cat discovering a glowing crystal on Mars, bold crisp outlines, vector style, coloring book page for children, no shading, no gradient, white background, high contrast --ar 3:4`,
          `Cute smiling baby alien waving hello with floating friendly robots in background, simple bold coloring page for ${ageGroup}, thick clean contour lines, black and white only, crisp line work --ar 3:4`,
          `Whimsical futuristic rocket ship launching from candy planet, clear distinct sections, perfect for activity book coloring page, vector lineart, pristine white negative space --ar 3:4`
        ]
      });
    }

    const prompt = `Generate 3 specialized Midjourney/vector illustration prompts for coloring pages and activity book clipart.
Subject: ${subject || 'Space animals'}
Style: ${style} (e.g. bold line art, coloring book, KDP printable, vector sticker)
Age Group: ${ageGroup}

Return strictly JSON:
{
  "prompts": [
    "Prompt 1 with precise keywords (bold outlines, black and white line art, no shading, high contrast, clean vector style)",
    "Prompt 2...",
    "Prompt 3..."
  ],
  "negativePrompt": "shading, gradients, color, messy lines, watermark, blurry, complex micro-details"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI prompt builder error:', error);
    res.json({
      prompts: [
        `Bold black and white line art, simple cute ${subject || 'cartoon character'}, thick clean outlines, coloring book page for kids, no shading, pure white background --ar 3:4`
      ],
      negativePrompt: 'color, realistic shading, gradients, photorealistic, noise'
    });
  }
});

// ================= VITE DEV OR STATIC SERVING ================= //
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Studio Hybrid Workspace running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
