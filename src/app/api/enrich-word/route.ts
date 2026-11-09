import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { word } = await request.json();

    if (!word || typeof word !== 'string') {
      return NextResponse.json({ error: "So'z kiritilmadi" }, { status: 400 });
    }

    const trimmed = word.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
Siz IELTS bo'yicha akademik lug'at mutaxassisiz. Quyidagi so'zni tahlil qiling va unga IELTS Writing/Speaking talablari bo'yicha ma'lumotlarni FAQAT JSON formatida qaytaring:
So'z: "${trimmed}"

Qat'iy format:
{
  "word_en": "Inglizcha bosh shakli",
  "translation_uz": "O'zbekcha aniq ma'nosi",
  "phonetic": "/talaffuz IPA/",
  "part_of_speech": "noun | verb | adjective | adverb",
  "academic_level": "B2 | C1 | C2",
  "collocations": ["birikma 1", "birikma 2", "birikma 3"],
  "example_sentence": "IELTS Band 7.5+ darajasidagi bitta mukammal misol gap.",
  "example_translation_uz": "Misol gapning o'zbekcha tarjimasi."
}
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch (err) {
        console.warn('Gemini enrichment fallback:', err);
      }
    }

    // Heuristic fallback enrichment
    return NextResponse.json({
      word_en: trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
      translation_uz: `${trimmed} (avtomatik qidiruv)`,
      phonetic: `/${trimmed.toLowerCase()}/`,
      part_of_speech: 'noun',
      academic_level: 'C1',
      collocations: [`crucial ${trimmed.toLowerCase()}`, `examine ${trimmed.toLowerCase()}`],
      example_sentence: `Understanding the concept of ${trimmed} is fundamental for IELTS Academic candidates.`,
      example_translation_uz: `${trimmed} tushunchasini anglash IELTS nomzodlari uchun muhim ahamiyatga ega.`,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
