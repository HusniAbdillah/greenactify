"use client";

import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import { SendHorizonal, Bot, User, BrainCircuit } from 'lucide-react';
import { Message } from 'ai';

// Daftar lengkap semua kemungkinan prompt
const ALL_PROMPT_RECOMMENDATIONS = [
  "Apa itu zero waste?",
  "Bagaimana cara membuat kompos dari sampah dapur?",
  "Jelaskan hubungan antara jejak karbon dan perubahan iklim",
  "Sebutkan 3 contoh aksi ramah lingkungan di kantor",
  "Apa saja yang termasuk dalam Sustainable Development Goals (SDGs)?",
  "Bagaimana cara mengurangi penggunaan plastik sekali pakai?",
  "Apa manfaat menanam pohon bagi lingkungan?",
  "Jelaskan konsep ekonomi sirkular",
];

export default function ChatbotPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
  });

  const [recommendedPrompts, setRecommendedPrompts] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Efek untuk mengacak dan memilih beberapa prompt saat komponen pertama kali dimuat
  useEffect(() => {
    const shuffled = [...ALL_PROMPT_RECOMMENDATIONS].sort(() => 0.5 - Math.random());
    setRecommendedPrompts(shuffled.slice(0, 5)); // Ambil 5 prompt secara acak
  }, []);


  // Efek untuk otomatis scroll ke pesan paling bawah
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fungsi untuk menangani klik pada saran prompt
  const handlePromptClick = (prompt: string) => {
    const message: Message = {
      id: Date.now().toString(), // id sementara
      role: 'user',
      content: prompt,
    };
    append(message);
  };


  return (
    // Menggunakan h-full agar tinggi container fleksibel mengikuti layout induk
    <main className="flex flex-col h-full bg-transparent font-poppins">
      {/* Header yang didesain ulang */}
      <div className="px-4 pt-4 sm:px-6">
        <header className="bg-tealLight text-black rounded-lg p-4 sm:p-6 w-full">
            <div className="flex items-center gap-3 mb-1">
                <BrainCircuit size={32}/>
                <h1 className="text-2xl sm:text-3xl font-bold">Greena</h1>
            </div>
            <p className="text-sm sm:text-base text-gray-800">Asisten AI Anda untuk semua hal tentang gaya hidup hijau.</p>
        </header>
      </div>


      {/* Container untuk history chat */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-2 sm:gap-4 max-w-5xl mx-auto ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* Avatar untuk 'Greena' */}
            {m.role !== 'user' && (
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tealLight text-white flex items-center justify-center">
                <Bot size={24} />
              </div>
            )}
            
            <div
              className={`px-4 py-3 rounded-2xl w-fit max-w-[80%] sm:max-w-xl md:max-w-3xl ${
                m.role === 'user'
                  ? 'bg-greenDark text-white rounded-br-lg'
                  : 'bg-whiteMint text-greenDark shadow-sm rounded-bl-lg'
              }`}
            >
              {/* Ukuran font responsif */}
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
            </div>

             {/* Avatar untuk Pengguna */}
             {m.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellowAmber text-white flex items-center justify-center">
                <User size={24} />
              </div>
            )}
          </div>
        ))}

        {/* Indikator loading yang lebih halus */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex items-start gap-3 max-w-5xl mx-auto justify-start">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tealLight text-white flex items-center justify-center">
                <Bot size={24} />
              </div>
             <div className="px-4 py-3 rounded-2xl bg-whiteMint text-gray-500 shadow-sm rounded-bl-lg">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Area Input Pengguna & Saran Prompt: Fixed, transparan, responsive */}
      <div className="fixed left-0 w-full z-30 bottom-20 sm:bottom-8 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {/* Saran Prompt */}
          {messages.length === 0 && !isLoading && (
            <div className="flex w-full gap-2 mb-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {recommendedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium bg-whiteGreen text-oliveSoft rounded-full hover:bg-mintPastel transition-colors duration-200 whitespace-nowrap shadow-none border-none"
                  style={{ boxShadow: 'none', background: 'rgba(255,255,255,0.85)' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Prompt */}
          <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-transparent">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Tanyakan sesuatu pada Greena..."
              disabled={isLoading}
              className="flex-1 w-full px-5 py-3 text-sm sm:text-base text-greenDark bg-whiteGreen border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-tealLight transition-shadow duration-200 shadow-none"
              style={{ boxShadow: 'none', background: 'rgba(255,255,255,0.85)' }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-greenDark text-white rounded-full disabled:bg-mintPastel disabled:cursor-not-allowed hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greenDark transform enabled:hover:scale-110 shadow-none"
              style={{ boxShadow: 'none' }}
              aria-label="Kirim pesan"
            >
              <SendHorizonal size={24} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
