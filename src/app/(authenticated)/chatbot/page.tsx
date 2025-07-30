"use client";

import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import { SendHorizonal, Bot, User, BrainCircuit } from 'lucide-react';

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
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
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


  return (
    // Latar belakang dihilangkan agar mengikuti layout induk
    <main className="flex flex-col h-screen bg-transparent font-poppins">
      <div className="pt-4 sticky top-0 z-10">
          <header className="py-3 px-6 bg-tealLight text-black rounded-[20px] flex items-center justify-center gap-2 w-fit mx-auto">
            <BrainCircuit size={28}/>
            <h1 className="text-2xl font-bold text-center">
              Greena
            </h1>
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

      {/* Area Input Pengguna yang Didesain Ulang */}
      <div className="p-4 sticky bottom-0">
        <div className="max-w-5xl mx-auto">
          {messages.length === 0 && !isLoading && (
            <div className="relative mb-3">
                <div className="flex w-full gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {recommendedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSubmit(undefined, { data: { prompt } })}
                      className="px-4 py-2 text-xs sm:text-sm font-medium bg-whiteGreen text-oliveSoft rounded-full hover:bg-mintPastel transition-colors duration-200 whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Tanyakan sesuatu pada Greena..."
              disabled={isLoading}
              className="flex-1 w-full px-5 py-3 text-sm sm:text-base text-greenDark bg-whiteGreen border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-tealLight transition-shadow duration-200"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-greenDark text-white rounded-full disabled:bg-mintPastel disabled:cursor-not-allowed hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greenDark transform enabled:hover:scale-110"
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
