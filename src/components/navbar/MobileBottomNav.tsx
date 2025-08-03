'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, HandHeart, Bot, UserRound } from 'lucide-react'

const MobileBottomNav = () => {
  const pathname = usePathname() || ''

  const navItems = [
    { href: '/', icon: Home, label: 'Beranda' },
    { href: '/peringkat', icon: Trophy, label: 'Peringkat' },
    { href: '/aksi', icon: HandHeart, label: 'Aksi' },
    { href: '/chatbot', icon: Bot, label: 'Chatbot' },
    { href: '/profil', icon: UserRound, label: 'Profil' },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 max-w-full bg-mintPastel border-t-2 border-oliveDark shadow-lg z-50 rounded-t-[20px] py-2 mx-auto">
        <div className="grid grid-cols-5 max-w-screen-sm mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1 px-2 mx-1 text-xs transition-all ${
                  active
                    ? 'bg-tealLight text-whiteMint rounded-[20px]'
                    : 'text-black rounded-[20px] hover:bg-yellowAmber'
                }`}
                style={{ minWidth: 0, maxWidth: '100%' }}
              >
                {active && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-tealLight rounded-b-lg"></div>
                )}
                <Icon className="h-8 w-8 mb-1 text-inherit" />
                <span className="font-medium text-inherit truncate text-[10px] leading-tight">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mobile bottom padding - Hanya untuk non-chatbot pages */}
      {!pathname.includes('/chatbot') && <div className="lg:hidden h-20"></div>}
    </>
  )
}

export default MobileBottomNav
