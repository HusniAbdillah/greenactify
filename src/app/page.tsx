'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Users, Target, Heart, Trophy, Medal, Award, MapPin, Download, FileText, TreePine } from 'lucide-react'
import './globals.css'

// Dummy leaderboard data
const dummyLeaderboard = [
  { id: 1, name: "Eko Santoso", province: "DKI Jakarta", points: 12450, rank: 1 },
  { id: 2, name: "Sari Wijaya", province: "Jawa Barat", points: 11200, rank: 2 },
  { id: 3, name: "Ahmad Rizki", province: "Jawa Tengah", points: 10800, rank: 3 },
  { id: 4, name: "Maya Putri", province: "Jawa Timur", points: 9650, rank: 4 },
  { id: 5, name: "Budi Hartono", province: "Sumatera Utara", points: 8900, rank: 5 },
]

// Dummy provinces data
const dummyProvinces = [
  { id: 1, province: "DKI Jakarta", total_users: 8520, total_activities: 25600, total_points: 456780, rank: 1 },
  { id: 2, province: "Jawa Barat", total_users: 7890, total_activities: 23400, total_points: 423100, rank: 2 },
  { id: 3, province: "Jawa Timur", total_users: 6750, total_activities: 20100, total_points: 398500, rank: 3 },
  { id: 4, province: "Jawa Tengah", total_users: 5920, total_activities: 18700, total_points: 365200, rank: 4 },
  { id: 5, province: "Sumatera Utara", total_users: 4680, total_activities: 15200, total_points: 298700, rank: 5 },
]

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
              <h3 className="text-3xl font-bold text-greenDark">25,000+</h3>
              <p className="text-gray-600">Pejuang Lingkungan</p>
            </div>
            <div className="bg-whiteMint rounded-2xl p-6 shadow-lg">
              <Target className="w-12 h-12 text-yellowGold mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-greenDark">150,000+</h3>
              <p className="text-gray-600">Aksi Lingkungan</p>
            </div>
            <div className="bg-whiteMint rounded-2xl p-6 shadow-lg">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-greenDark">34</h3>
              <p className="text-gray-600">Provinsi Terjangkau</p>
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

            <div className="p-6">
              {activeTab === 'users' ? (
                // Users Leaderboard
                <>
                  {dummyLeaderboard.map((user) => (
                    <div
                      key={user.id}
                      className={`${user.rank === 1 ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-gray-50'} rounded-xl p-4 mb-3 hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10">
                            {getRankIcon(user.rank)}
                          </div>

                          <div className="flex-1">
                            <h4 className="font-bold text-greenDark">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.province}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold text-yellowGold">
                            {formatPoints(user.points)}
                          </div>
                          <div className="text-sm text-gray-600">poin</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                // Provinces Leaderboard
                <>
                  {dummyProvinces.map((province) => (
                    <div
                      key={province.id}
                      className={`${province.rank === 1 ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-gray-50'} rounded-xl p-4 mb-3 hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10">
                            {getRankIcon(province.rank)}
                          </div>

                          <div className="flex-1">
                            <h4 className="font-bold text-greenDark">{province.province}</h4>
                            <p className="text-sm text-gray-600">
                              {formatPoints(province.total_users)} peserta • {formatPoints(province.total_activities)} aktivitas
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold text-yellowGold">
                            {formatPoints(province.total_points)}
                          </div>
                          <div className="text-sm text-gray-600">poin</div>
                        </div>
                      </div>
                    </div>
                  ))}
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
              <div className="bg-mintPastel rounded-xl p-6">
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

              <div className="bg-mintPastel rounded-xl p-6">
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
              <p className="text-sm text-gray-500 mb-4">
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
