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
import { useUser } from "@clerk/nextjs";

const DesktopSidebar = () => {
  const pathname = usePathname()
  const { user } = useUser();

  const navItems = [
    { href: '/', icon: Home, label: 'Beranda' },
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
      <div className="hidden lg:flex fixed top-1/2 left-6 -translate-y-1/2 flex-col w-28 h-[680px] bg-mintPastel rounded-[40px] shadow-lg border-2 border-oliveSoft items-center justify-between z-40">
        {/* Navigation */}
        <nav className="flex flex-col items-center space-y-3 mt-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex flex-col items-center justify-center w-20 h-16 rounded-2xl transition-all duration-200 ${
                  active
                    ? 'bg-tealLight text-black shadow-lg scale-110'
                    : 'text-black hover:bg-yellowAmber hover:scale-110 hover:shadow-md'
                }`}
              >
                <Icon
                  className={`h-9 w-9 mb-1 ${active ? 'text-black' : 'text-black'}`}
                />
                <span className={`text-xs font-semibold leading-tight text-center ${active ? 'text-black' : 'text-black'}`}>
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
                  {user?.firstName}
                </p>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}

export default DesktopSidebar
