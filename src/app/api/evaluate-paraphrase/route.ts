import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ParaphraseRequest {
  game_id?: string;
  original_sentence: string;
  user_paraphrase: string;
  target_word?: string;
  user_ielts_target?: number;
}

export async function POST(request: Request) {
  try {
    const body: ParaphraseRequest = await request.json();
    const { original_sentence, user_paraphrase, target_word, user_ielts_target = 7.5 } = body;

    if (!user_paraphrase || user_paraphrase.trim().length < 5) {
      return NextResponse.json(
        { error: "Iltimos, to'liq gap kiriting." },
        { status: 400 }
      );
    }

    // 1. Try FastAPI Python backend first if running
    try {
      const fastApiRes = await fetch('http://127.0.0.1:8000/api/games/evaluate-paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (fastApiRes.ok) {
        const fastApiData = await fastApiRes.json();
        return NextResponse.json(fastApiData);
      }
    } catch {
      // Python backend not running or unreachable, fallback to local/Gemini
    }

    // 2. Direct Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
Siz qat'iy va professional IELTS imtihonchisisiz. Quyidagi topshiriqni baholang va FAQAT quyidagi JSON formatida javob qaytaring (hech qanday markdown \`\`\`json belgilarsiz, faqat xom JSON):

Asl oddiy gap: "${original_sentence}"
Foydalanuvchi yozgan akademik parafraz: "${user_paraphrase}"
Foydalanishi kerak bo'lgan asosiy so'z: "${target_word || 'academic vocabulary'}"
Foydalanuvchining maqsadli IELTS balli: ${user_ielts_target}

Kutilayotgan JSON formati:
{
  "is_success": true,
  "evaluated_band": 8.0,
  "criteria_scores": {
    "task_achievement": 8.5,
    "lexical_resource": 8.0,
    "grammatical_range": 8.0
  },
  "feedback_uz": "O'zbek tilida qisqa va aniq professional tahlil (qaysi so'zlar C1 ga ko'tarilgani yoki qayerda kamchilik borligi)",
  "c1_upgrade": "Mukammal C1-C2 darajadagi namunaviy IELTS varianti",
  "upgrades": [
    { "original": "oddiy so'z", "upgraded": "akademik muqobili" }
  ],
  "xp_awarded": 45,
  "next_recommended_game": "sentence_builder"
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local heuristic evaluator:', geminiError);
      }
    }

    // 3. Built-in Academic Heuristic Evaluator
    const lower = user_paraphrase.toLowerCase();
    const hasTargetWord = target_word ? lower.includes(target_word.toLowerCase()) : true;
    const wordCount = user_paraphrase.trim().split(/\s+/).length;

    const academicTokens = [
      'mitigate', 'ubiquitous', 'detrimental', 'substantial', 'facilitate',
      'proliferate', 'scrutinize', 'consequently', 'furthermore', 'imperative',
      'paramount', 'exacerbate', 'exponential', 'manifest', 'predominantly'
    ];
    const foundTokens = academicTokens.filter(tok => lower.includes(tok));

    let band = 6.0;
    if (wordCount >= 7) band += 0.5;
    if (foundTokens.length >= 1) band += 0.5;
    if (foundTokens.length >= 2) band += 0.5;
    if (hasTargetWord) band += 0.5;
    if (user_paraphrase.includes(',') || user_paraphrase.includes('which') || user_paraphrase.includes('that')) {
      band += 0.5;
    }
    band = Math.min(8.5, Math.max(5.5, band));

    return NextResponse.json({
      is_success: band >= 6.5,
      evaluated_band: Number(band.toFixed(1)),
      criteria_scores: {
        task_achievement: Number((band + 0.2).toFixed(1)),
        lexical_resource: Number(band.toFixed(1)),
        grammatical_range: Number((band - 0.1).toFixed(1)),
      },
      feedback_uz: hasTargetWord
        ? `Juda yaxshi natija! '${target_word}' so'zi o'z o'rnida qo'llangan va jumlaga akademik ohang bergan.`
        : `Yaxshi, ammo topshiriqda belgilangan '${target_word}' so'zi to'liq qatnashmadi. Gap tuzilishi tahlil qilindi.`,
      c1_upgrade: `Implementing targeted strategies substantially mitigates the negative repercussions in the long term.`,
      upgrades: [
        { original: "make a lot of", upgraded: "generate substantial amounts of" },
        { original: "very bad", upgraded: "severely detrimental" },
      ],
      xp_awarded: Math.round(band * 6),
      next_recommended_game: "sentence_builder",
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Baholashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
