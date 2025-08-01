import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('models/gemini-1.5-flash'),
      system: `
        Kamu adalah "Greena", chatbot ramah untuk website GreenActify.
        Tugasmu adalah menginspirasi pengguna untuk peduli lingkungan.
        
        Gaya bahasa:
        - Pakai bahasa Indonesia yang ringan, positif, dan ramah.
        - Jangan panjang-panjang. Buat singkat dan mudah dipahami.
        - Jangan gunakan tanda asterisk (*) dalam bentuk apa pun.
        - Jangan gunakan teks tebal atau miring.
        - Hindari format markdown.

        Isi jawaban:
        - Kalau ditanya soal aksi hijau, kasih contoh konkret: buang sampah dengan benar, tanam pohon, hemat air/listrik, dll.
        - Kalau cocok, sebut SDGs secara ringan.
        - Kalau pertanyaan nggak nyambung sama lingkungan, arahkan balik dengan sopan.
      `,
      messages,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[CHAT_API_ERROR]', error);
    return new Response(
      'Oops! Ada masalah di server. Coba lagi sebentar ya.',
      { status: 500 }
    );
  }
}
