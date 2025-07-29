'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { 
  Home, 
  Map, 
  Trophy, 
  HandHeart,
  Bot,
  History, 
  User,
  Leaf
} from 'lucide-react'

const DesktopSidebar = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/beranda', icon: Home, label: 'Beranda' },
    { href: '/persebaran', icon: Map, label: 'Persebaran' },
    { href: '/peringkat', icon: Trophy, label: 'Peringkat' },
    { href: '/aksi', icon: HandHeart, label: 'Aksi' },
    { href: '/chatbot', icon: Bot, label: 'Chatbot' },
    { href: '/riwayat', icon: History, label: 'Riwayat' },
    { href: '/profil', icon: User, label: 'Profil' },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-25 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-green-100 to-green-200 shadow-lg rounded-r-3xl">
          {/* Logo
          <div className="flex h-20 flex-shrink-0 items-center justify-center px-4 pt-6">
            <Link href="/beranda" className="flex flex-col items-center">
              <div className="w-16 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                <Image
                  src="/images/logo-fiks.png"
                  alt="GreenActify Logo"
                  width={56}
                  height={40}
                  className="object-contain scale-90"
                />
              </div>
            </Link>
          </div> */}

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
                      ? 'bg-green-600 text-white shadow-lg transform scale-105'
                      : 'text-green-700 hover:bg-green-300 hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 mb-1 ${
                      active ? 'text-white' : 'text-green-700 group-hover:text-green-800'
                    }`}
                  />
                  <span className={`text-xs font-medium leading-tight text-center ${
                    active ? 'text-white' : 'text-green-700 group-hover:text-green-800'
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
                    avatarBox: "w-12 h-12 rounded-2xl shadow-lg border-2 border-white"
                  }
                }}
              />
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-green-800 truncate">
                  Ahmad
                </p>
                <p className="text-xs text-green-600 truncate">
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