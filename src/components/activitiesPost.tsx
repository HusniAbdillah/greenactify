'use client'

import { useEffect, useState } from 'react'

type ActivityItem = {
  id: string
  title: string
  location_name?: string
  created_at: string
  image_url?: string 
  points: number
  activity_categories: {
    name: string
    group_category: string
  }
}


export default function UserActivityList() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/activities')
        const data = await res.json()
        setActivities(data)
      } catch (err) {
        console.error('❌ Gagal fetch data aktivitas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (loading) return <p>Memuat aktivitas...</p>
  if (activities.length === 0) return <p>Tidak ada aktivitas ditemukan.</p>

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div
          key={act.id}
          className="border rounded-lg p-4 shadow-sm bg-white"
        >
          <img
            src={act.image_url}
            alt={act.title}
            className="w-full h-48 object-cover rounded-md mb-2"
          />
          <h2 className="text-lg font-bold">{act.title}</h2>
          <p className="text-sm text-gray-600">
            {act.location_name || 'Lokasi tidak tersedia'}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(act.created_at).toLocaleString('id-ID')}
          </p>
          <div className="mt-2 text-sm">
            <p><strong>Kategori:</strong> {act.activity_categories.name}</p>
            <p><strong>Grup:</strong> {act.activity_categories.group_category}</p>
            <p><strong>Poin:</strong> {act.points}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

