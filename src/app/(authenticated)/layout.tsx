import React from 'react'
import DesktopSidebar from '@/components/DesktopSidebar'
import MobileBottomNav from '@/components/MobileBottomNav'
import { checkUser } from '@/lib/check-user'
export default async  function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await checkUser();
  console.log("user : ", user );
  
  return (
    <div className="min-h-screen bg-mintPastel">
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* Main Content */}
      <div className="lg:ml-35"> {/* Sesuaikan dengan width sidebar */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}