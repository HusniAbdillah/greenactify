'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true

    setIsStandalone(standalone)
    
    if (standalone) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 2000) 
      
      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [])

  if (isLoading && isStandalone) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: '#D2E8BB' }}
      >
        <div className="text-center">
          <div className="relative w-[28rem] h-52 mx-auto mb-6">
            <Image
              src="/logo-greenactify.png"
              alt="GreenActify"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">GreenActify</h1>
          <p className="text-green-700 px-4 text-lg">Aksi Hijau Hari Ini, Nafas Segar Esok Hari</p>
          
          <div className="mt-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}