'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, HandHeart, Bot, UserRound } from 'lucide-react'

const MobileBottomNav = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/beranda', icon: Home, label: 'Beranda' },
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
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 bg-mintPastel border-t border-oliveDark shadow-lg z-50">
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
                    ? 'bg-tealLight text-black'
                    : 'text-black hover:bg-yellowAmber'
                }`}
              >
                {active && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-tealLight rounded-b-lg"></div>
                )}
                <Icon
                  className={`h-6 w-6 mb-1 ${active ? 'text-black' : 'text-black'}`}
                />
                <span className={`font-medium ${active ? 'text-black' : 'text-black'}`}>
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