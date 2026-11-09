# ⚡ LexiAI IELTS: Sun'iy Intellektga Asoslangan Ingliz Tili va IELTS Platformasi

Foydalanuvchining shaxsiy lug'at bazasi, adaptiv 10 ta mini-o'yin va API orqali ulangan AI Agent yordamida foydalanuvchini boshlang'ich darajadan IELTS Band 7.5+ darajasigacha olib chiquvchi zamonaviy interaktiv platforma.

---

## 🎯 Asosiy Imkoniyatlar

1. **Game Center & Arena (10 Ta Interaktiv O'yin):**
   - ⚡ **Tarjima-Sprint (Speed Match & Spelling):** 60 soniyalik taymerli sprint, harflar to'plami va x2, x4, x8 Combo ko'paytirgichlar.
   - 🧩 **Grammatika Konstruktori (Sentence Builder):** Inversion, Conditionals va Passive strukturalarni bloklar yordamida terish.
   - 🎯 **Kontekst-Ovchisi (Smart Cloze):** IELTS matnlarida so'z turkumlarini (Word Formation) to'g'ri qo'llash.
   - 🔍 **Xatoni Top & To'g'rila (Grammar Error Hunter):** Proofreading va tipik IELTS xatolarini tuzatish.
   - ⚔️ **Akademik Parafraz Duellari (Band 5 → Band 8 Duel):** Sodda gaplarni C1 akademik darajaga o'girish va jonli AI Band baholash.
   - 🔗 **IELTS Kollokatsiya Matcher (Collocation Linker):** Tabiiy so'z birikmalarini (Verb + Noun, Adj + Noun) bog'lash.
   - 🎧 **Listening Audio-Speller:** UK/US/AU aksentlarida audio diktant va xatosiz yozish.
   - 🎙️ **Speaking Rapid-Fire:** 30 soniyalik ovozli chaqiruv va 3 ta yangi so'zni nutqda ishlatish.
   - 🔠 **IELTS Tematik Krossvord:** Sinonimlar va akademik ta'riflar zanjiri.
   - 👑 **AI Boss Fight (Weekly Target Challenge):** Hafta yakunida Task 2 inshosi va to'liq 4 ta IELTS mezonli tahlil.

2. **Shaxsiy Lug'at Banki & Spaced Repetition (SM-2):**
   - SuperMemo SM-2 algoritmi asosidagi avtomatik takrorlash oraliqlari (1, 3, 7, 14 kun).
   - Yangi so'z kiritilganda AI orqali avtomatik boyitish (IPA fonetika, so'z turkumi, kollokatsiyalar, IELTS misol gap).
   - Web Speech API orqali talaffuzni tinglash.
   - Xotira Zanjiri: `New` → `Learning` → `Reviewing` → `Mastered`.

3. **AI IELTS Coach & Evaluator:**
   - Writing Task 1/2 va Parafrazlarni real vaqtda 4 ta rasmiy mezon bo'yicha tahlil qilish:
     - Task Achievement
     - Coherence & Cohesion
     - Lexical Resource
     - Grammatical Range & Accuracy
   - O'zbek tilidagi aniq tushuntirish va C1 darajadagi namunaviy upgrade takliflari.

---

## 🚀 Ishga Tushirish (Quick Start)

### 1. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 2. Muhit o'zgaruvchilari (Ixtiyoriy)
Agar o'zingizning Google Gemini API kalitingizdan foydalanmoqchi bo'lsangiz, `.env.local` faylini yarating:
```env
GEMINI_API_KEY=sizning_gemini_api_kalitingiz
```
*(Eslatma: Agar API kalit kiritilmasa ham, tizim o'rnatilgan aqlli lokal baholash dvigateli bilan to'liq ishlayveradi!)*

### 3. Serverni ishga tushirish
```bash
npm run dev
```

Brauzerda oching: [http://localhost:3000](http://localhost:3000)

---

## 📂 Loyiha Tuzilmasi

```
d:/ielts bot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── enrich-word/route.ts      # AI so'zlarni avto-boyitish API
│   │   │   └── evaluate-paraphrase/route.ts # AI IELTS baholash quvuri
│   │   ├── globals.css                   # Dark Arena dizayn va neon stillar
│   │   ├── layout.tsx                    # Asosiy HTML layout
│   │   └── page.tsx                      # Dashboard, Game Center, Lug'at, AI Coach
│   ├── components/
│   │   ├── Navbar.tsx                    # Level, XP, Streak, Tablar paneli
│   │   ├── VocabularyModal.tsx           # AI boyitishli yangi so'z modal oynasi
│   │   └── games/
│   │       ├── SpeedSprintModal.tsx      # "Tarjima-Sprint" o'yini
│   │       ├── SentenceBuilderModal.tsx  # "Grammatika Konstruktori" o'yini
│   │       ├── CollocationMatcherModal.tsx # "Kollokatsiya Matcher" o'yini
│   │       └── ParaphraseDuelModal.tsx   # "Akademik Parafraz Duellari" o'yini
│   ├── data/
│   │   ├── gameModes.ts                  # 10 ta o'yin qoidalari va metama'lumotlari
│   │   └── seedVocabulary.ts             # IELTS C1 (Mitigate, Ubiquitous...) lug'ati
│   ├── lib/
│   │   ├── sm2.ts                        # SuperMemo SM-2 algoritmi
│   │   └── storage.ts                    # LocalStorage, XP, Streak va statistika
│   └── types/
│       └── index.ts                      # TypeScript interfeyslari
├── package.json
└── tsconfig.json
```
