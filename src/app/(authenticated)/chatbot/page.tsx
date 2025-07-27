'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Lightbulb, Recycle, TreePine, Bike } from 'lucide-react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Saya Greena, asisten virtual GreenActify. Saya siap membantu Anda dengan pertanyaan seputar lingkungan dan aktivitas hijau. Ada yang bisa saya bantu?',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickMessages = [
    { icon: <Lightbulb className="w-5 h-5" />, text: 'Tips hemat energi', response: 'Berikut beberapa tips hemat energi:\n1. Gunakan lampu LED\n2. Cabut charger yang tidak digunakan\n3. Atur suhu AC pada 24°C\n4. Gunakan kipas angin sebagai alternatif\n5. Matikan perangkat elektronik saat tidak digunakan' },
    { icon: <Recycle className="w-5 h-5" />, text: 'Cara daur ulang', response: 'Panduan daur ulang yang mudah:\n1. Pisahkan sampah organik dan anorganik\n2. Bersihkan kemasan sebelum didaur ulang\n3. Gunakan kembali botol dan kantong plastik\n4. Buat kompos dari sampah organik\n5. Donasikan barang yang masih layak pakai' },
    { icon: <TreePine className="w-5 h-5" />, text: 'Manfaat menanam pohon', response: 'Manfaat menanam pohon:\n1. Menyerap CO2 dan menghasilkan oksigen\n2. Mengurangi polusi udara\n3. Mencegah erosi tanah\n4. Menurunkan suhu lingkungan\n5. Menyediakan habitat untuk satwa\n6. Meningkatkan kualitas hidup' },
    { icon: <Bike className="w-5 h-5" />, text: 'Transportasi ramah lingkungan', response: 'Pilihan transportasi ramah lingkungan:\n1. Bersepeda untuk jarak dekat\n2. Jalan kaki jika memungkinkan\n3. Gunakan transportasi umum\n4. Carpooling dengan teman\n5. Kendaraan listrik atau hybrid\n6. Kombinasi berbagai moda transportasi' }
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true)
    
    // Simple keyword-based responses
    let response = 'Terima kasih atas pertanyaannya! Sebagai asisten lingkungan, saya merekomendasikan untuk selalu memilih aktivitas yang ramah lingkungan. Apakah ada topik spesifik yang ingin Anda tanyakan tentang lingkungan atau aktivitas hijau?'
    
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('sampah') || lowerMessage.includes('limbah')) {
      response = 'Pengelolaan sampah yang baik:\n1. Kurangi penggunaan plastik sekali pakai\n2. Pisahkan sampah organik dan anorganik\n3. Daur ulang kertas, plastik, dan logam\n4. Buat kompos dari sampah organik\n5. Donasikan barang yang masih layak pakai'
    } else if (lowerMessage.includes('energi') || lowerMessage.includes('listrik')) {
      response = 'Tips menghemat energi:\n1. Gunakan lampu LED yang lebih efisien\n2. Cabut charger yang tidak digunakan\n3. Atur suhu AC pada 24-26°C\n4. Gunakan kipas angin sebagai alternatif\n5. Matikan perangkat elektronik saat tidak digunakan'
    } else if (lowerMessage.includes('pohon') || lowerMessage.includes('tanaman')) {
      response = 'Menanam pohon memiliki banyak manfaat:\n1. Menyerap CO2 dan menghasilkan oksigen\n2. Mengurangi polusi udara\n3. Mencegah erosi tanah\n4. Menurunkan suhu lingkungan\n5. Habitat untuk satwa\n\nMulailah dengan tanaman yang mudah dirawat seperti lidah buaya atau sirih gading!'
    } else if (lowerMessage.includes('transportasi') || lowerMessage.includes('kendaraan')) {
      response = 'Transportasi ramah lingkungan:\n1. Bersepeda untuk jarak dekat (< 5km)\n2. Jalan kaki jika memungkinkan\n3. Gunakan transportasi umum\n4. Carpooling dengan teman atau keluarga\n5. Pertimbangkan kendaraan listrik\n\nSelain ramah lingkungan, bersepeda juga baik untuk kesehatan!'
    }

    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
      setIsTyping(false)
    }, 1500)
  }

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    
    simulateBotResponse(text)
  }

  const handleQuickMessage = (quickMsg: any) => {
    sendMessage(quickMsg.text)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputText)
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-[calc(100vh-2rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Greena</h1>
            <p className="text-sm opacity-90">Asisten Virtual GreenActify</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.isUser ? 'bg-green-600 text-white ml-2' : 'bg-gray-300 text-gray-600 mr-2'
              }`}>
                {message.isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div
                className={`rounded-lg p-3 ${
                  message.isUser
                    ? 'bg-green-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                <Bot className="w-5 h-5 text-gray-600" />
              </div>
              <div className="bg-white rounded-lg rounded-bl-none p-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Messages */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {quickMessages.map((quickMsg, index) => (
            <button
              key={index}
              onClick={() => handleQuickMessage(quickMsg)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap transition-colors"
            >
              {quickMsg.icon}
              <span className="text-sm">{quickMsg.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tanyakan tentang lingkungan..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatbotPage