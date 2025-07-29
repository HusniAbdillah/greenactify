'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ActivityItem } from '@/hooks/useSupabase'
import { handleDeleteActivity, handleUpdateActivity } from '@/hooks/useSupabase'

export default function ActivityCard({ activity, onUpdated }: { activity: ActivityItem, onUpdated?: () => void }) {
  const [editing, setEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(activity.title)
  const [newLocation, setNewLocation] = useState(activity.location_name || '')
  const [newImageUrl, setNewImageUrl] = useState(activity.image_url || '')
  const router = useRouter()

  const handleEditSubmit = async () => {
    const success = await handleUpdateActivity(
      activity.id,
      newTitle,
      newLocation,
      newImageUrl
    )

    if (success) {
      setEditing(false)
      onUpdated?.();
    }
  }

  return (
    <>
      {/* Card */}
      <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg bg-zinc-900 transition-all hover:scale-[0.98] border border-transparent hover:border-amber-400/30">

        {activity.image_url ? (
          <Image
            src={activity.image_url}
            alt={activity.title || "Activity image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover opacity-80"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-800 text-zinc-400">No Image</div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/70 to-transparent p-4">
          <h3 className="line-clamp-1 text-sm font-extrabold text-white drop-shadow-md">{activity.title}</h3>
          {activity.location_name && (
            <p className="text-xs text-zinc-300 mt-0.5">{activity.location_name}</p>
          )}
          <div className="flex justify-between items-end mt-2">
            <p className="text-xs font-black text-yellowGold px-2 py-1 rounded bg-amber-400/10">
              {activity.points} PTS
            </p>
            <p className="text-[10px] text-zinc-400">
              {new Date(activity.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {activity.activity_categories?.group_category && (
          <span className="absolute right-2 top-2 rounded-full bg-white/20 px-2 py-1 text-xs text-white font-semibold backdrop-blur">
            {activity.activity_categories.group_category}
          </span>
        )}

        <div className="absolute top-2 left-2 flex space-x-2 z-10">
          <button
            onClick={() => handleDeleteActivity(activity.id)}
            className="bg-red-500/80 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
          >
            Hapus
          </button>
          <button
            onClick={() => setEditing(true)}
            className="bg-tealLight/80 text-white px-2 py-1 text-xs rounded hover:bg-greenDark"
          >
            Edit
          </button>
          <button
            onClick={() => console.log("Share activity", activity.id)}
            className="bg-amber-500/80 text-white px-2 py-1 text-xs rounded hover:bg-amber-600"
          >
            Share
          </button>
        </div>
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-xl border border-zinc-700">
            <h2 className="text-lg font-bold text-white mb-4">Edit Aktivitas</h2>

            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Judul"
                className="w-full rounded bg-zinc-700 text-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Lokasi"
                className="w-full rounded bg-zinc-700 text-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="URL Gambar"
                className="w-full rounded bg-zinc-700 text-white px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm rounded bg-zinc-700 text-white hover:bg-zinc-600"
              >
                Batal
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 text-sm rounded bg-amber-500 text-black font-semibold hover:bg-amber-600"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
