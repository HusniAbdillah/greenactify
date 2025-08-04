'use client'

import React, { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export type ActivityItem = {
  id: string
  title: string
  province: string | null
  points: number
  latitude: number | null
  longitude: number | null
  created_at: string
  activity_categories: {
    name: string
  }
}

export type ProvinceStats = {
  id: string
  province: string
  total_users: number
  total_activities: number
  total_points: number
  avg_points_per_user: number
  rank: number | null
  coordinates: Record<string, any> | null
  updated_at: string
}

const ActivitiesMapPage = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [provinces, setProvinces] = useState<ProvinceStats[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);


  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true)
      try {
        const res = await fetch('/api/activities/getAll')
        const result = await res.json()
        setActivities(res.ok && !result.error ? result.data || [] : [])
      } catch {
        setActivities([])
      } finally {
        setLoadingActivities(false)
      }
    }

    const fetchProvinces = async () => {
      setLoadingProvinces(true)
      try {
        const res = await fetch('/api/province-bare')
        const result = await res.json()
        if (!res.ok || result.error) {
          setProvinces([])
        } else {
          const sorted = result.data.sort((a: ProvinceStats, b: ProvinceStats) =>
            (a.rank || Infinity) - (b.rank || Infinity)
          )
          setProvinces(sorted)
        }
      } catch {
        setProvinces([])
      } finally {
        setLoadingProvinces(false)
      }
    }

    fetchActivities()
    fetchProvinces()
  }, [])

  const getProvinceExtraStats = (provinceName: string) => {
    const provinceActivities = activities.filter(act => act.province === provinceName)

    const highPointCount = provinceActivities.filter(act => act.points >= 50).length
    const highPointPercentage = provinceActivities.length > 0
      ? ((highPointCount / provinceActivities.length) * 100).toFixed(1) + '%'
      : '0%'

    const latestActivity = provinceActivities.length > 0
      ? new Date(provinceActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at).toLocaleDateString('id-ID')
      : 'N/A'

    const activityCount: { [key: string]: number } = {}
    provinceActivities.forEach(act => {
      const categoryName = act.activity_categories.name
      activityCount[categoryName] = (activityCount[categoryName] || 0) + 1
    })

    let mostFrequentActivity = 'N/A'
    let maxCount = 0
    for (const category in activityCount) {
      if (activityCount[category] > maxCount) {
        maxCount = activityCount[category]
        mostFrequentActivity = category
      }
    }

    const totalPoints = provinceActivities.reduce((sum, act) => sum + act.points, 0)
    const avgPointsPerActivity = provinceActivities.length > 0 ? (totalPoints / provinceActivities.length).toFixed(2) : '0.00'

    return {
      highPointPercentage,
      mostFrequentActivity,
      avgPointsPerActivity,
      latestActivity
    }
  }
  const exportToCSV = () => {
    if (provinces.length === 0 || loadingProvinces) {
      alert('Data masih loading, tunggu sebentar ya!')
      return
    }

    const now = new Date()
    const timestamp = now.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/[/,:]/g, '-').replace(/\s/g, '_')

    const headers = [
      "Provinsi", "Total Pengguna", "Total Aktivitas", "Total Poin",
      "Rata2 Poin/User", "Aktivitas Berpoin Tinggi (%)", "Aktivitas Terbanyak",
      "Rata2 Poin/Aktivitas", "Aktivitas Terbaru"
    ]

    const rows = provinces.map(prov => {
      const extra = getProvinceExtraStats(prov.province)
      return [
        prov.province,
        prov.total_users,
        prov.total_activities,
        prov.total_points,
        prov.avg_points_per_user,
        extra.highPointPercentage,
        extra.mostFrequentActivity,
        extra.avgPointsPerActivity,
        extra.latestActivity
      ]
    })

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    

    link.setAttribute("download", `Laporan_Dampak_GreenActify_${timestamp}.csv`)
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
const exportToPDF = () => {
  if (provinces.length === 0 || loadingProvinces) {
    alert('Data masih loading, tunggu sebentar ya!')
    return
  }
  const doc = new jsPDF()

  const now = new Date()
  const timestamp = now.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/[/,:]/g, '-').replace(/\s/g, '_')
  
  const readableTimestamp = now.toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const logoUrl = '/logo-greenactify.png'
  const img = new window.Image()
  img.src = logoUrl
  img.crossOrigin = 'anonymous'

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth()

    const logoWidth = 60
    const logoX = (pageWidth - logoWidth) / 2
    doc.addImage(img, 'PNG', logoX, 10, logoWidth, 20)

    doc.setFontSize(16)
    doc.setTextColor(34, 78, 64)
    doc.setFont('helvetica', 'bold')
    doc.text('Dampak GreenActify Terhadap Aksi Hijau Indonesia', pageWidth / 2, 40, {
      align: 'center'
    })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(`Laporan diunduh pada: ${readableTimestamp}`, pageWidth / 2, 50, {
      align: 'center'
    })

    const tableData = provinces.map(prov => {
      const extra = getProvinceExtraStats(prov.province)
      return [
        prov.province,
        prov.total_users,
        prov.total_activities,
        prov.total_points,
        prov.avg_points_per_user,
        extra.highPointPercentage,
        extra.mostFrequentActivity,
        extra.avgPointsPerActivity,
        extra.latestActivity
      ]
    })

    autoTable(doc, {
      startY: 55, 
      head: [[
        "Provinsi", "Total Pengguna", "Total Aktivitas", "Total Poin",
        "Rata2 Poin/User", "Aktivitas Berpoin Tinggi (%)", "Aktivitas Terbanyak",
        "Rata2 Poin/Aktivitas", "Aktivitas Terbaru"
      ]],
      body: tableData,
      styles: {
        fontSize: 7,
        halign: 'center',
        valign: 'middle',
        cellPadding: 3
      },
      headStyles: {
        fillColor: [12, 59, 46],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [0,0,0]
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244]
      },
      tableLineColor: [200, 250, 200],
      tableLineWidth: 0.2
    })

    doc.save(`Laporan Dampak_GreenActify_${timestamp}.pdf`)
  }

  img.onerror = () => {
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFontSize(16)
    doc.setTextColor(34, 78, 64)
    doc.setFont('helvetica', 'bold')
    doc.text('Dampak GreenActify Terhadap Aksi Hijau Indonesia', pageWidth / 2, 20, {
      align: 'center'
    })


    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(`Laporan diunduh pada: ${readableTimestamp} WIB`, pageWidth / 2, 30, {
      align: 'center'
    })

    const tableData = provinces.map(prov => {
      const extra = getProvinceExtraStats(prov.province)
      return [
        prov.province,
        prov.total_users,
        prov.total_activities,
        prov.total_points,
        prov.avg_points_per_user,
        extra.highPointPercentage,
        extra.mostFrequentActivity,
        extra.avgPointsPerActivity,
        extra.latestActivity
      ]
    })

    autoTable(doc, {
      startY: 35, 
      head: [[
        "Provinsi", "Total Pengguna", "Total Aktivitas", "Total Poin",
        "Rata2 Poin/User", "Aktivitas Berpoin Tinggi (%)", "Aktivitas Terbanyak",
        "Rata2 Poin/Aktivitas", "Aktivitas Terbaru"
      ]],
      body: tableData,
      styles: {
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
        cellPadding: 3
      },
      headStyles: {
        fillColor: [12, 59, 46],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244]
      },
      tableLineColor: [200, 250, 200],
      tableLineWidth: 0.2
    })

    doc.save(`Dampak_GreenActify_${timestamp}.pdf`)
  }
}

  return (
    <div className="p-4 bg-mintPastel min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
        <div className="flex justify-center md:justify-start">
          <Image
            src="/logo-greenactify.png"
            alt="Logo GreenActify"
            width={200}
            height={65}
            className="mb-2 md:mb-0 w-[160px] sm:w-[200px] h-auto"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-end">
          <button
            onClick={exportToPDF}
            className="bg-red/60 text-white px-4 py-2 rounded-md hover:bg-red w-full sm:w-auto transition-colors"
          >
            Unduh PDF
          </button>

          <button
            onClick={exportToCSV}
            className="bg-oliveSoft/80 text-white px-4 py-2 rounded-md hover:bg-oliveSoft w-full sm:w-auto transition-colors"
          >
            Unduh CSV
          </button>

        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow border border-whiteGreen">
        <h3 className="text-xl font-bold mb-4 text-greenDark px-4 pt-4">Dampak GreenActify Terhadap Aksi Hijau Indonesia</h3>
        <table className="table-auto w-full text-sm border-collapse">
          <thead className="bg-whiteGreen text-oliveDark">
            <tr>
              <th className="border border-whiteGreen px-2 py-2">Provinsi</th>
              <th className="border border-whiteGreen px-2 py-2">Total Pengguna</th>
              <th className="border border-whiteGreen px-2 py-2">Total Aktivitas</th>
              <th className="border border-whiteGreen px-2 py-2">Total Poin</th>
              <th className="border border-whiteGreen px-2 py-2">Rata2 Poin/User</th>
              <th className="border border-whiteGreen px-2 py-2">Aktivitas Berpoin Tinggi (%)</th>
              <th className="border border-whiteGreen px-2 py-2">Aktivitas Terbanyak</th>
              <th className="border border-whiteGreen px-2 py-2">Rata2 Poin/Aktivitas</th>
              <th className="border border-whiteGreen px-2 py-2">Aktivitas Terbaru</th>
            </tr>
          </thead>
          <tbody>
            {provinces.map((prov, index) => {
              const extra = getProvinceExtraStats(prov.province);
              const rowColor = index % 2 === 0 ? 'bg-whiteMint/30' : 'bg-mintPastel/30';
              return (
                <tr key={prov.id} className={`text-center hover:bg-whiteGreen transition ${rowColor}`}>
                  <td className="border border-whiteGreen px-2 py-2">{prov.province}</td>
                  <td className="border border-whiteGreen px-2 py-2">{prov.total_users}</td>
                  <td className="border border-whiteGreen px-2 py-2">{prov.total_activities}</td>
                  <td className="border border-whiteGreen px-2 py-2">{prov.total_points}</td>
                  <td className="border border-whiteGreen px-2 py-2">{prov.avg_points_per_user}</td>
                  <td className="border border-whiteGreen px-2 py-2">{extra.highPointPercentage}</td>
                  <td className="border border-whiteGreen px-2 py-2">{extra.mostFrequentActivity}</td>
                  <td className="border border-whiteGreen px-2 py-2">{extra.avgPointsPerActivity}</td>
                  <td className="border border-whiteGreen px-2 py-2">{extra.latestActivity}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ActivitiesMapPage