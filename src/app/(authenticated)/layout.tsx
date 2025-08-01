import React from 'react'
import DesktopSidebar from '@/components/navbar/DesktopSidebar'
import MobileBottomNav from '@/components/navbar/MobileBottomNav'
import { checkUser } from '@/lib/check-user'
import { Toaster } from 'sonner';


export const dynamic = 'force-dynamic'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await checkUser();
  console.log("user : ", user );

  return (
    <div className="min-h-screen bg-mintPastel">

      <DesktopSidebar />

 
      <div className="lg:ml-35 h-full"> 
        <main className="h-full">
          {children}
          <Toaster /> 
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}