'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { 
  Home, 
  AreaChart, 
  Trophy, 
  HandHeart,
  Bot,
  History, 
  UserRound,
} from 'lucide-react'

const DesktopSidebar = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/beranda', icon: Home, label: 'Beranda' },
    { href: '/persebaran', icon: AreaChart, label: 'Persebaran' },
    { href: '/peringkat', icon: Trophy, label: 'Peringkat' },
    { href: '/aksi', icon: HandHeart, label: 'Aksi' },
    { href: '/chatbot', icon: Bot, label: 'Chatbot' },
    { href: '/riwayat', icon: History, label: 'Riwayat' },
    { href: '/profil', icon: UserRound, label: 'Profil' },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-25 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-mintPastel shadow-lg rounded-r-3xl">
          {/* Navigation */}
          <nav className="flex-1 flex flex-col items-center space-y-3 px-4 py-15">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex flex-col items-center justify-center w-20 h-16 rounded-2xl transition-all duration-200 ${
                    active
                      ? 'bg-tealLight text-black shadow-lg scale-105'
                      : 'text-black hover:bg-yellowAmber hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 mb-1 ${
                      active ? 'text-black' : 'text-black'
                    }`}
                  />
                  <span className={`text-xs font-semibold leading-tight text-center ${
                    active ? 'text-black' : 'text-black'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 p-4 pb-6 -mt-8">
            <div className="flex flex-col items-center">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-12 h-12 rounded-2xl shadow-lg border-2 border-tealLight"
                  }
                }}
              />
              <div className="mt-2 text-center">
                <p className="text-xs font-bold text-black truncate">
                  Ahmad
                </p>
                <p className="text-xs text-tealLight truncate">
                  2.4k
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DesktopSidebar