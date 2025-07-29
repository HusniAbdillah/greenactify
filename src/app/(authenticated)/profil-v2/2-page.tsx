// app/dashboard/page.tsx
import UserActivityList from '@/components/profil/activitiesPost'

export default function DashboardPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Aktivitas Saya</h1>
      <UserActivityList /> {/* Komponen client-side */}
    </div>
  )
}
