'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Users, Target, Heart, Trophy, Medal, Award, MapPin, Download, FileText, TreePine } from 'lucide-react'
import { fetchStats, type StatsData } from '@/lib/calculate-stats'
import './globals.css'

interface UserLeaderboard {
  id: string
  name: string | null
  full_name: string | null
  province: string | null
  points: number
  rank: number
}

interface ProvinceLeaderboard {
  id: number
  province: string
  total_users: number
  total_activities: number
  total_points: number
  rank: number
}

const formatNumber = (num: number) => {
  if (num >= 1500000) {
    return (num / 1000000).toFixed(1) + 'M+'
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1500) {
    return (num / 1000).toFixed(1) + 'k+'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const formatPoints = (points: number) => {
  if (points >= 1000) {
    return (points / 1000).toFixed(1) + 'k'
  }
  return points.toString()
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-500" />
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />
    case 3:
      return <Award className="w-5 h-5 text-orange-500" />
    default:
      return <span className="w-5 h-5 bg-greenDark rounded-full flex items-center justify-center text-xs font-bold text-white">{rank}</span>
  }
}

export default function HomePage() {
  const { isSignedIn } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'provinces'>('users')
  const [userLeaderboard, setUserLeaderboard] = useState<UserLeaderboard[]>([])
  const [provinceLeaderboard, setProvinceLeaderboard] = useState<ProvinceLeaderboard[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalActivities: 0,
    activeProvinces: 0
  })

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true)

        // Fetch stats data
        const statsData = await fetchStats()
        setStats(statsData)

        const userResponse = await fetch('/api/leaderboard?type=users')
        if (userResponse.ok) {
          const userResult = await userResponse.json()
          const userData = userResult.data || userResult

          const sortedUsers = userData
            .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
            .slice(0, 5)
            .map((user: any, index: number) => ({
              ...user,
              rank: index + 1
            }))
          setUserLeaderboard(sortedUsers)
        }

        const provinceResponse = await fetch('/api/provinces')
        if (provinceResponse.ok) {
          const provinceResult = await provinceResponse.json()
          const provinceData = provinceResult.data || provinceResult

          const sortedProvinces = provinceData
            .sort((a: any, b: any) => (b.total_points || 0) - (a.total_points || 0))
            .slice(0, 5)
            .map((province: any, index: number) => ({
              ...province,
              rank: index + 1
            }))
          setProvinceLeaderboard(sortedProvinces)
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboardData()
  }, [])

  if (isSignedIn) {
    window.location.href = '/beranda'
    return null
  }

  return (
    <div className="min-h-screen bg-mintPastel">
      {/* Header */}
      <header className="flex justify-between items-center p-6 pt-8">
        <div className="flex items-center gap-2">
         <img src="/logo-greenactify.svg" alt="GreenActify" className='w-32'/>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <button className="text-greenDark hover:text-tealLight font-medium">
                Masuk
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-greenDark text-whiteMint rounded-full font-medium px-6 py-2 hover:bg-tealLight transition-colors">
                Daftar
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-8">
        <div className="text-center mb-20 md:mb-24">
          <h1 className="text-3xl md:text-6xl font-bold text-greenDark mb-6">
            Aksi Hijau Hari Ini,
            <span className="text-tealLight block">Nafas Segar Esok Hari</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pejuang lingkungan di Indonesia.
            Lakukan aksi nyata, kumpulkan poin, dan jadilah bagian dari perubahan positif untuk planet ini.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8 md:mb-12">
            <div className="bg-whiteMint rounded-2xl p-6 shadow-lg">
              <Users className="w-12 h-12 text-tealLight mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-greenDark">
                {loading ? '...' : formatNumber(stats.totalUsers)}
              </h3>
              <p className="text-gray-600">Pejuang Lingkungan</p>
            </div>
            <div className="bg-whiteMint rounded-2xl p-6 shadow-lg">
              <Target className="w-12 h-12 text-yellowGold mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-greenDark">
                {loading ? '...' : formatNumber(stats.totalActivities)}
              </h3>
              <p className="text-gray-600">Aksi Lingkungan</p>
            </div>
            <div className="bg-whiteMint rounded-2xl p-6 shadow-lg">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-greenDark">
                {loading ? '...' : stats.activeProvinces}
              </h3>
              <p className="text-gray-600">Provinsi Aktif</p>
            </div>
          </div>

          <SignUpButton>
            <button className="bg-tealLight text-white text-md md:text-xl font-bold px-8 py-4 rounded-full hover:bg-greenDark transition-colors shadow-lg">
              Mulai Aksi Sekarang
            </button>
          </SignUpButton>
        </div>

        {/* Leaderboard Preview */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-greenDark mb-4">
              Pejuang Lingkungan Terdepan
            </h2>
            <p className="text-gray-600">
              Lihat siapa saja yang memimpin dalam aksi penyelamatan lingkungan
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-mintPastel border-greenDark border-2 rounded-full p-1 mb-6 max-w-md mx-auto">
            <button
              className={`flex-1 py-3 px-4 rounded-full font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'bg-greenDark text-whiteMint shadow-sm'
                  : 'text-greenDark hover:text-tealLight active:text-tealLight'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Pengguna
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-full font-semibold transition-colors ${
                activeTab === 'provinces'
                  ? 'bg-greenDark text-whiteMint shadow-sm'
                  : 'text-greenDark hover:text-tealLight active:text-tealLight'
              }`}
              onClick={() => setActiveTab('provinces')}
            >
              <MapPin className="w-5 h-5 inline mr-2" />
              Provinsi
            </button>
          </div>

          {/* Leaderboard Content */}
          <div className="bg-whiteMint rounded-2xl shadow-lg overflow-hidden">
            <div className={`${activeTab === 'users' ? 'bg-greenDark' : 'bg-oliveDark'} text-white p-6`}>
              <h3 className="text-xl font-bold text-center flex items-center justify-center gap-2">
                {activeTab === 'users' ? (
                  <>
                    <Users className="w-6 h-6" />
                    Peringkat Pengguna
                  </>
                ) : (
                  <>
                    <MapPin className="w-6 h-6" />
                    Peringkat Provinsi
                  </>
                )}
              </h3>
            </div>

            <div className="p-4 md:p-6">
              {loading ? (
                // Loading state
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-24"></div>
                            <div className="h-3 bg-gray-300 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-300 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'users' ? (
                // Users Leaderboard
                <>
                  {userLeaderboard.length > 0 ? (
                    userLeaderboard.map((user) => (
                      <div
                        key={user.id}
                        className={`${user.rank === 1 ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-whiteGreen'} rounded-xl p-4 mb-3 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-10 h-10">
                              {getRankIcon(user.rank)}
                            </div>

                            <div className="flex-1">
                              <h4 className="font-bold text-greenDark">{user.full_name || user.name || 'Unknown User'}</h4>
                              <p className="text-sm text-gray-600">{user.province || 'Unknown Province'}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-bold text-yellowGold">
                              {formatPoints(user.points || 0)}
                            </div>
                            <div className="text-sm text-gray-600">poin</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada data pengguna tersedia
                    </div>
                  )}
                </>
              ) : (
                // Provinces Leaderboard
                <>
                  {provinceLeaderboard.length > 0 ? (
                    provinceLeaderboard.map((province) => (
                      <div
                        key={province.id}
                        className={`${province.rank === 1 ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-whiteGreen'} rounded-xl p-4 mb-3 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-10 h-10">
                              {getRankIcon(province.rank)}
                            </div>

                            <div className="flex-1">
                              <h4 className="font-bold text-greenDark">{province.province}</h4>
                              <p className="text-sm text-gray-600">
                                {formatPoints(province.total_users || 0)} peserta • {formatPoints(province.total_activities || 0)} aktivitas
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-bold text-yellowGold">
                              {formatPoints(province.total_points || 0)}
                            </div>
                            <div className="text-sm text-gray-600">poin</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada data provinsi tersedia
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="text-center mt-6">
            <SignInButton>
              <button className="bg-oliveSoft text-greenDark px-6 py-3 rounded-full font-semibold hover:bg-tealLight transition-colors">
                Lihat Peringkat Lengkap
              </button>
            </SignInButton>
          </div>
        </div>

        {/* PDF Report Download Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-whiteMint rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <FileText className="w-16 h-16 text-tealLight mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-greenDark mb-4">
                Laporan Dampak Lingkungan
              </h2>
              <p className="text-gray-600 mb-6">
                Unduh laporan lengkap tentang dampak aksi lingkungan di Indonesia.
                Dapatkan insight mendalam tentang kontribusi setiap provinsi dan pencapaian komunitas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-whiteGreen rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-tealLight" />
                  <h3 className="font-bold text-greenDark">Laporan Bulanan</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Ringkasan aktivitas dan pencapaian bulan ini
                </p>
                <button className="w-full bg-tealLight text-white py-2 px-4 rounded-lg font-semibold hover:bg-greenDark transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Unduh PDF (2.3 MB)
                </button>
              </div>

              <div className="bg-whiteGreen rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="w-6 h-6 text-yellowGold" />
                  <h3 className="font-bold text-greenDark">Laporan Tahunan</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Analisis komprehensif dampak lingkungan sepanjang tahun
                </p>
                <button className="w-full bg-yellowGold text-greenDark py-2 px-4 rounded-lg font-semibold hover:bg-oliveSoft transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Unduh PDF (8.7 MB)
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-10 md:mb-4">
                Laporan ini berisi data real-time dari aktivitas pengguna dan dampak lingkungan yang terukur
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                <span>📊 Data Statistik</span>
                <span>📈 Trend Analisis</span>
                <span>🏆 Pencapaian Komunitas</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-greenDark text-whiteMint p-6 mt-16">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TreePine className="w-6 h-6 text-whiteMint" />
            <span className="text-xl font-bold">GreenActify</span>
          </div>
          <p className="text-mintPastel">
            Bersama membangun Indonesia yang lebih hijau dan berkelanjutan
          </p>
        </div>
      </footer>
    </div>
  )
}
