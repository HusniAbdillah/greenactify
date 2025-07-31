'use client'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import React, { useState } from 'react' // Baris ini yang diperbaiki
import { useActivities } from '@/hooks/useSupabase'
import { Calendar, Filter, Search, MapPin, Share2, Download, TrendingUp } from 'lucide-react'

export default function RiwayatPage() {
  const { activities, loading, error } = useActivities()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month' | 'year'>('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

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
      (activity.location_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesCategory =
      selectedCategory === 'all' || activity.activity_categories.group_category === selectedCategory

    const matchesTime = filterByTime(activity.created_at)

    return matchesSearch && matchesCategory && matchesTime
  })

  const totalPoints = filteredActivities.reduce((sum, a) => sum + a.points, 0)
  const totalCO2Saved = filteredActivities.reduce((sum, a) => sum + a.points * 0.1, 0) // asumsi simulasi

  const handleShare = (activity: any) => {
    if (navigator.share) {
      navigator.share({
        title: 'GreenActify',
        text: `Saya menyelesaikan aktivitas ${activity.title} dan dapat ${activity.points} poin!`,
        url: window.location.href,
      })
    }
  }

const handleDownloadPDF = async () => {
  const report = document.getElementById('report-content')
  if (!report) return

  // Tambahkan padding & background putih untuk rendering yang lebih rapi
  report.style.backgroundColor = 'white'
  report.style.padding = '20px'

  const canvas = await html2canvas(report, {
    scale: 2,               // Kualitas tinggi
    useCORS: true,          // Untuk gambar dari luar (jika ada)
    backgroundColor: '#fff' // Pastikan latar belakang putih
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  // Jika konten lebih tinggi dari 1 halaman A4
  if (pdfHeight > 297) {
    const totalPages = Math.ceil(pdfHeight / 297)
    for (let i = 0; i < totalPages; i++) {
      const position = -i * 297
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      if (i < totalPages - 1) pdf.addPage()
    }
  } else {
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  }

  pdf.save('laporan-aktivitas.pdf')
}



  return (
    <div className="p-6 space-y-6 bg-mintPastel min-h-screen"> {/* Latar Belakang Mint Pastel */}
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-greenDark to-oliveSoft text-white rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-2">Riwayat Aktivitas</h1>
        <p className="text-lg">Lihat kembali perjalanan hijau Anda</p>
      </div>
      <div id="report-content" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox label="Total Aktivitas" value={filteredActivities.length} color="greenDark" />
        <StatBox label="Total Poin" value={totalPoints} color="pinkSoft" />
        <StatBox label="kg CO₂ Diselamatkan" value={totalCO2Saved.toFixed(1)} color="oliveSoft" />
      </div>

      {/* Filter */}
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

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-3 bg-greenDark text-white rounded-lg flex items-center hover:bg-oliveDark transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Unduh PDF
          </button>

        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-pinkSoft mb-4" />
            <p className="text-oliveSoft">Tidak ada aktivitas ditemukan</p>
          </div>
        ) : (
          filteredActivities.map((a) => (
            <div key={a.id} className="bg-white rounded-lg shadow p-4 md:p-6 flex gap-4 items-center">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-whiteGreen flex items-center justify-center text-greenDark font-bold flex-shrink-0">
                {a.image_url ? (
                  <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                ) : (
                  'IMG'
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="pr-4">
                    <h3 className="text-lg font-semibold text-greenDark truncate">{a.title}</h3>
                    <p className="text-sm text-oliveSoft">{a.activity_categories.name}</p>
                    <div className="text-sm text-oliveSoft flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-pinkSoft" />
                        {new Date(a.created_at).toLocaleDateString('id-ID')}
                      </span>
                      {a.location_name && (
                        <span className="flex items-center truncate">
                          <MapPin className="w-4 h-4 mr-1 text-pinkSoft" />
                          {a.location_name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                      <span className="flex items-center text-greenDark font-medium">
                        <TrendingUp className="w-4 h-4 mr-1" />+{a.points} poin
                      </span>
                      <span className="flex items-center text-pinkSoft font-medium">
                        🌱 {(a.points * 0.1).toFixed(1)} kg CO₂
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleShare(a)}
                    className="text-oliveSoft hover:text-greenDark transition-colors flex-shrink-0"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  )
}

const StatBox = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className={`bg-white rounded-lg shadow-lg p-6 text-center border-b-4 border-${color}`}>
    <div className={`text-3xl font-bold text-${color}`}>{value}</div>
    <div className="text-oliveSoft">{label}</div>
  </div>
)