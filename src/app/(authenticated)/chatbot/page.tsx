"use client";

import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import { SendHorizonal, Bot, User, BrainCircuit } from 'lucide-react';
import { Message } from 'ai';

const ALL_PROMPT_RECOMMENDATIONS = [
  "Apa itu zero waste?",
  "Gimana cara bikin kompos?",
  "Kenapa jejak karbon penting?",
  "Plastik itu bahaya nggak sih?",
  "Cara hemat listrik di rumah?",
  "Kebiasaan hijau yang simpel?",
  "Apa itu ekonomi sirkular?",
  "Kenapa harus bawa tumbler?",
  "Aksi hijau buat anak muda?",
  "Manfaat nanam pohon?",
  "Aksi bareng teman yang hijau?",
  "Biar kantor jadi ramah lingkungan?",
  "Apa isi SDGs?",
  "Ganti plastik pakai apa?",
  "Kenapa harus peduli iklim?",
];

export default function ChatbotPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    onFinish() {
      scrollToBottom();
    },
  });

  const [recommendedPrompts, setRecommendedPrompts] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const shuffled = [...ALL_PROMPT_RECOMMENDATIONS].sort(() => 0.5 - Math.random());
    setRecommendedPrompts(shuffled.slice(0, 5));
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePromptClick = (prompt: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
    };
    append(message);
  };

  const hasPrompts = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-screen bg-mintPastel font-poppins">
      <header className="flex-shrink-0 px-2 pt-4 sm:px-20 w-full bg-mintPastel z-30">
        <div className="bg-tealLight text-black rounded-lg p-2 sm:p-3 w-full text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <BrainCircuit size={32} />
            <h1 className="text-2xl sm:text-3xl font-bold">Greena</h1>
          </div>
        </div>
      </header>

      <div 
        ref={chatContainerRef} 
        className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 chat-container ${!hasPrompts ? 'no-prompts' : ''}`}
        style={{
          minHeight: 0
        }}
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-2 sm:gap-4 max-w-6xl mx-auto ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role !== 'user' && (
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tealLight text-white flex items-center justify-center">
                <Bot size={24} />
              </div>
            )}
            <div
              className={`px-4 py-3 rounded-2xl w-fit max-w-[80%] sm:max-w-2xl md:max-w-4xl ${
                m.role === 'user'
                  ? 'bg-greenDark text-white rounded-br-lg'
                  : 'bg-whiteMint text-greenDark shadow-sm rounded-bl-lg'
              }`}
            >
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
            </div>
            {m.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellowAmber text-white flex items-center justify-center">
                <User size={24} />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-3 max-w-6xl mx-auto justify-start">
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
      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-mintPastel z-40 border-t border-gray-200"
           style={{ height: hasPrompts ? '180px' : '140px' }}>
        <div className="h-full relative">
          <div className="absolute bottom-22 left-4 right-4">
            <div className="max-w-6xl mx-auto w-full">
              {hasPrompts && (
                <div className="mb-3">
                  <div className="flex w-full gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {recommendedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handlePromptClick(prompt)}
                        className="px-4 py-2 text-xs font-medium bg-whiteGreen text-oliveSoft rounded-full hover:bg-opacity-80 transition-colors duration-200 whitespace-nowrap flex-shrink-0"
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
                  className="flex-1 w-full px-5 py-3 text-sm text-greenDark bg-whiteGreen border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-tealLight transition-shadow duration-200"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3 bg-greenDark text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greenDark transform enabled:hover:scale-110 flex-shrink-0"
                  aria-label="Kirim pesan"
                >
                  <SendHorizonal size={24} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block flex-shrink-0 w-full bg-mintPastel border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          {hasPrompts && (
            <div className="mb-3">
              <div className="flex gap-2 flex-wrap justify-center">
                {recommendedPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-4 py-2 text-sm font-medium bg-whiteGreen text-oliveSoft rounded-full hover:bg-opacity-80 transition-colors duration-200 whitespace-nowrap"
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
              className="flex-1 px-5 py-3 text-base text-greenDark bg-whiteGreen border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-tealLight transition-shadow duration-200"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-greenDark text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greenDark transform enabled:hover:scale-110"
              aria-label="Kirim pesan"
            >
              <SendHorizonal size={24} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
