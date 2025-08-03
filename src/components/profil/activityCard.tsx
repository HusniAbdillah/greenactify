'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ActivityItem } from '@/hooks/useSupabase'
import { handleDeleteActivity, handleUpdateActivity } from '@/hooks/useSupabase'
import { Trash2, Pencil, Share2 } from 'lucide-react'

export default function ActivityCard({ activity, onUpdated }: { activity: ActivityItem, onUpdated?: () => void }) {
  const [editing, setEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [customModal, setCustomModal] = useState<{ title: string, message: string } | null>(null)
  const [newTitle, setNewTitle] = useState(activity.title)
  const [newProvince, setNewLocation] = useState(activity.province || '')
  const [newImageUrl, setNewImageUrl] = useState(activity.image_url || '')
  const router = useRouter()
  
  const showModal = (title: string, message: string) => {
    setCustomModal({ title, message })
  }


  const handleDeleteConfirmed = async () => {
    const success = await handleDeleteActivity(activity.id)
    setShowDeleteConfirm(false)

    if (success) {
      onUpdated?.()
    } else {
      showModal("Gagal Menghapus", "Terjadi kesalahan saat menghapus aktivitas.")
    }
  }


  const handleShareActivity = async () => {
    console.log("Sharing activity:", activity)
    try {
      const url = activity.generated_image_url
      if (!url) {
        showModal("Gagal Membagikan", "Gambar belum tersedia untuk dibagikan.")
        return
      }

      const res = await fetch(url)
      const blob = await res.blob()
      const file = new File([blob], "grenactify-card.png", { type: "image/png" })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Aksi Hijauku!",
          text: `Saya baru saja melakukan ${activity.title} bersama GrenActify! 🌱`,
          files: [file],
        })
      } else {
        showModal("Fitur Tidak Didukung", "Perangkat kamu tidak mendukung fitur share gambar. Gambar akan diunduh otomatis.")
        const a = document.createElement("a")
        a.href = url
        a.download = "grenactify-card.png"
        a.click()
      }
    } catch (err) {
      console.error("Gagal share:", err)
      showModal("Kesalahan", "Terjadi kesalahan saat membagikan aktivitas.")
    }
  }

  return (
    <>
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
          <h3 className="text-sm md:text-lg font-extrabold text-white drop-shadow-md">
            {activity.title}
          </h3>
          {activity.province && (
            <p className="text-xs md:text-base text-zinc-300 mt-0.5">{activity.province}</p>
          )}
          <div className="flex justify-between items-end mt-2">
            <p className="text-xs md:text-sm font-black text-yellowGold px-2 py-1 rounded bg-amber-400/10">
              {activity.points} Poin
            </p>
            <p className="text-[10px] md:text-xs text-zinc-400">
              {new Date(activity.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {activity.activity_categories?.group_category && (
          <span className="absolute right-2 top-2 rounded-full bg-white/20 px-2 py-1 text-xs md:text-sm text-white font-semibold backdrop-blur">
            {activity.activity_categories.group_category}
          </span>
        )}

        <div className="absolute top-2 left-2 flex space-x-2 z-10">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-500/80 text-white p-2 md:p-3 text-xs md:text-sm rounded hover:bg-red-600 flex items-center gap-1"
            title="Hapus"
          >
            <Trash2 size={15} className="md:w-5 md:h-5" />
          </button>

          <button
            onClick={handleShareActivity}
            className="bg-amber-500/80 text-white p-2 md:p-3 text-xs md:text-sm rounded hover:bg-amber-600 flex items-center gap-1"
            title="Bagikan"
          >
            <Share2 size={15} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-sm shadow-xl border border-zinc-700 text-white">
            <h2 className="text-lg font-bold mb-4">Hapus Aktivitas?</h2>
            <p className="text-sm text-zinc-300">Apakah kamu yakin ingin menghapus aktivitas ini? Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm rounded bg-zinc-700 hover:bg-zinc-600">Batal</button>
              <button onClick={handleDeleteConfirmed} className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {customModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center space-y-4">
            <h3 className="text-xl font-bold text-zinc-800">{customModal.title}</h3>
            <p className="text-zinc-600">{customModal.message}</p>
            <button
              onClick={() => setCustomModal(null)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  )
}
