'use client'
import React, { useState, useEffect } from 'react'
import { useActivities } from '@/hooks/useSupabase'
import { Calendar, Filter, Search, MapPin, Share2, Download, TrendingUp, Trash2 } from 'lucide-react'
import { handleDeleteActivity } from '@/hooks/useSupabase'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ActivityItem } from '@/hooks/useSupabase'

export default function RiwayatPage() {
  const { activities, loading, error } = useActivities()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month' | 'year'>('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user === null) {
      router.push('/')
    }
  }, [user, router])

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [customModal, setCustomModal] = useState<{ title: string, message: string } | null>(null)
  const [activityToDelete, setActivityToDelete] = useState<ActivityItem | null>(null)

  const showModal = (title: string, message: string) => {
    setCustomModal({ title, message })
  }

  const handleDeleteConfirmed = async () => {
    if (!activityToDelete) return
    setShowDeleteConfirm(false)
    const success = await handleDeleteActivity(activityToDelete.id)
    if (success) {
      setActivityToDelete(null)
      router.refresh()
    } else {
      showModal("Gagal Menghapus", "Terjadi kesalahan saat menghapus aktivitas.")
    }
  }

  const handleShareActivity = async (activity: ActivityItem) => {
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

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'Penghijauan', label: 'Penghijauan' },
    { value: 'Daur Ulang', label: 'Daur Ulang' },
    { value: 'Transportasi Hijau', label: 'Transportasi Hijau' },
    { value: 'Hemat Energi', label: 'Hemat Energi' },
    { value: 'Hemat Air', label: 'Hemat Air' },
    { value: 'Makanan Organik', label: 'Makanan Organik' },
    { value: 'Edukasi Lingkungan', label: 'Edukasi Lingkungan' },
    { value: 'Bersih-bersih', label: 'Bersih-bersih' },
  ]

  const filterByTime = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffTime = now.getTime() - date.getTime()
    const diffDays = diffTime / (1000 * 3600 * 24)

    if (selectedFilter === 'week') return diffDays <= 7
    if (selectedFilter === 'month') return diffDays <= 30
    if (selectedFilter === 'year') return now.getFullYear() === date.getFullYear()
    return true
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.province?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesCategory =
      selectedCategory === 'all' || activity.activity_categories.group_category === selectedCategory

    const matchesTime = filterByTime(activity.created_at)

    return matchesSearch && matchesCategory && matchesTime
  })

  const totalPoints = filteredActivities.reduce((sum, a) => sum + a.points, 0)

  const streakDays = (() => {
    const dates = filteredActivities
      .map((a) => new Date(a.created_at).toISOString().split('T')[0])
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .map((d) => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime())

    let maxStreak = 0
    let currentStreak = 0

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        currentStreak = 1
      } else {
        const diff = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
        if (diff === 1) {
          currentStreak++
        } else if (diff > 1) {
          currentStreak = 1
        }
      }
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak
      }
    }

    return maxStreak
  })()

  return (
    <div className="p-6 space-y-6 bg-mintPastel min-h-screen">
      <div className="bg-gradient-to-r from-greenDark to-oliveSoft text-white rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-2">Riwayat Aktivitas</h1>
        <p className="text-lg">Lihat kembali perjalanan hijau Anda</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center border-b-4 border-greenDark">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-greenDark">
              {filteredActivities.length}
            </div>
            <div className="text-xs text-oliveSoft">Total Aktivitas</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center border-b-4 border-pinkSoft">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-pinkSoft">
              {totalPoints}
            </div>
            <div className="text-xs text-oliveSoft">Total Poin</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center border-b-4 border-oliveSoft box col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-oliveSoft">
              {streakDays} Hari
            </div>
            <div className="text-xs text-oliveSoft">Streak Terlama</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-oliveSoft w-5 h-5" />
              <input
                type="text"
                placeholder="Cari aktivitas atau lokasi..."
                className="w-full pl-10 pr-4 py-3 border border-whiteGreen rounded-lg focus:ring-greenDark focus:border-greenDark text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-whiteGreen rounded-lg focus:ring-greenDark focus:border-greenDark text-black"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="px-4 py-3 border border-whiteGreen rounded-lg focus:ring-greenDark focus:border-greenDark text-black"
            >
              <option value="all">Semua Waktu</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="year">Tahun Ini</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-pinkSoft mb-4" />
              <p className="text-oliveSoft">Tidak ada aktivitas ditemukan</p>
            </div>
          ) : (
            filteredActivities.map((a) => (
              <div key={a.id} className="bg-white rounded-lg shadow p-4 md:p-6 flex gap-4 items-center">
                <div className='flex flex-col gap-y-2 item'>
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-whiteGreen flex items-center justify-center text-greenDark font-bold flex-shrink-0">
                    {a.image_url ? (
                      <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                    ) : (
                      'IMG'
                    )}
                  </div>
                  <div className="flex">
                    <button
                      onClick={() => handleShareActivity(a)}
                      className="bg-amber-500/80 text-white p-2 rounded hover:bg-amber-600"
                      title="Bagikan"
                    >
                      <Share2 className="w-3 h-3 sm:w-5 sm:h-5" />
                    </button>

                    <button
                      onClick={() => {
                        setActivityToDelete(a)
                        setShowDeleteConfirm(true)
                      }}
                      className="bg-red-500/80 text-white p-2 rounded hover:bg-red-600"
                      title="Hapus"
                    >
                      <Trash2 className="w-3 h-3 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="pr-4">
                      <h3 className="text-base md:text-md font-semibold text-greenDark">{a.title}</h3>
                      <p className="text-xs md:text-bse text-oliveSoft">{a.activity_categories.group_category}</p>
                      <div className="text-sm text-oliveSoft flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-pinkSoft" />
                          <span className='text-[10px] md:text-sm'>
                            {new Date(a.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </span>
                        {a.province && (
                          <span className="flex items-center truncate">
                            <MapPin className="w-4 h-4 mr-1 text-pinkSoft" />
                            <span className='text-[10px] md:text-sm'>{a.province}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                        <span className="flex items-center text-greenDark font-medium">
                          <TrendingUp className="w-4 h-4 mr-1" />+{a.points} poin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
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
      </div>
    </div>
  )
}
