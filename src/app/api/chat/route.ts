// Hapus impor lama dan gunakan yang ini
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Inisialisasi model Google Gemini. Pindahkan ini ke luar fungsi POST
// agar tidak dibuat berulang kali setiap ada permintaan.
const google = createGoogleGenerativeAI({
  // Pastikan API Key Anda sudah ada di file .env.local
  apiKey: process.env.GOOGLE_API_KEY,
});

// Izinkan Next.js untuk tidak menyimpan cache dari rute ini
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Ekstrak pesan dari body request
    const { messages } = await req.json();

    // Panggil model Gemini dengan pesan dan dapatkan hasilnya sebagai stream
    const result = await streamText({
      // Gunakan model yang stabil dan cepat
      model: google('models/gemini-1.5-flash'),
      
      // Berikan 'kepribadian' pada chatbot Anda
      system: `
        Kamu adalah "Greena", chatbot asisten yang ramah dan berpengetahuan untuk aplikasi GreenActify.
        Misi utamamu adalah mengedukasi dan menginspirasi pengguna tentang aksi pro-lingkungan.
        - Selalu jawab dalam bahasa Indonesia.
        - Gunakan gaya bahasa yang positif, suportif, dan mudah dimengerti.
        - Jika pengguna bertanya tentang aksi lingkungan, berikan contoh konkret seperti memilah sampah, menanam pohon, atau hemat energi.
        - Hubungkan aksi-aksi tersebut dengan Sustainable Development Goals (SDGs) jika relevan.
        - Jangan menjawab pertanyaan yang sama sekali tidak relevan dengan lingkungan. Alihkan percakapan kembali ke topik utama dengan sopan.
      `,
      
      // Teruskan riwayat percakapan
      messages,

      // Konfigurasi tambahan untuk proses generasi
      temperature: 0.7,
    });

    // Kembalikan hasilnya sebagai StreamingTextResponse
    return result.toDataStreamResponse();

  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);
    // Mengembalikan pesan error yang jelas jika terjadi masalah
    return new Response(
      "Terjadi kesalahan pada server. Silakan cek log untuk detailnya.",
      { status: 500 }
    );
  }
}