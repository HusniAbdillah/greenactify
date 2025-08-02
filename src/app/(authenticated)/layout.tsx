import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import DesktopSidebar from '@/components/navbar/DesktopSidebar'
import MobileBottomNav from '@/components/navbar/MobileBottomNav'
import { Toaster } from 'sonner'


export const dynamic = 'force-dynamic'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-mintPastel">

      <DesktopSidebar />

 
      <div className="lg:ml-35 h-full"> 
        <main className="h-full">
          {children}
          <Toaster /> 
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}