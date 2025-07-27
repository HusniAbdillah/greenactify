'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, Camera, MessageCircle, User } from 'lucide-react'

const MobileBottomNav = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/beranda', icon: Home, label: 'Beranda' },
    { href: '/peringkat', icon: Trophy, label: 'Peringkat' },
    { href: '/aksi', icon: Camera, label: 'Aksi' },
    { href: '/chatbot', icon: MessageCircle, label: 'Chatbot' },
    { href: '/profil', icon: User, label: 'Profil' },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-3 px-2 text-xs transition-colors ${
                  active
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {active && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-600 rounded-b-lg"></div>
                )}
                <Icon
                  className={`h-6 w-6 mb-1 ${
                    active ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
                <span className={`font-medium ${active ? 'text-green-600' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mobile bottom padding to prevent content overlap */}
      <div className="lg:hidden h-20"></div>
    </>
  )
}

export default MobileBottomNav