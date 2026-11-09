import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LexiAI IELTS — 10 Ta Interaktiv O\'yinlar va AI Tizimi',
  description: 'Shaxsiy lug\'at bazasi, adaptiv mini-o\'yinlar va AI Agent yordamida IELTS Band 7.5+ ga erishish platformasi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
