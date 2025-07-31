"use client";

import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  Users,
  Target,
  Trophy,
  Award,
  MapPin,
  TreePine,
} from "lucide-react";
import Image from "next/image";

interface UserLeaderboard {
  id: string;
  name: string | null;
  full_name: string | null;
  province: string | null;
  points: number;
  rank: number;
}

interface AuthenticatedHomepageProps {
  userLeaderboard: UserLeaderboard[];
  loading: boolean;
  formatPoints: (points: number) => string;
  getRankIcon: (rank: number) => React.ReactNode;
}

const AuthenticatedHomepage: React.FC<AuthenticatedHomepageProps> = ({
  userLeaderboard,
  loading,
  formatPoints,
  getRankIcon,
}) => {
  return (
    <div className="min-h-screen bg-mintPastel">
      {/* Header for authenticated users */}
      <header className="flex justify-between items-center p-6 pt-8 bg-whiteMint shadow-sm">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={120} height={40} priority />
        </div>
        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      {/* Authenticated Homepage Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-greenDark mb-4">
            Selamat Datang di
            <span className="text-tealLight block">Dashboard GreenActify</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Mari lanjutkan perjalanan hijau Anda dan lihat dampak positif yang telah Anda buat untuk lingkungan.
          </p>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-whiteMint rounded-2xl p-6 shadow-lg border-l-4 border-tealLight">
            <Trophy className="w-10 h-10 text-yellowGold mb-3" />
            <h3 className="text-2xl font-bold text-greenDark">1,250</h3>
            <p className="text-gray-600">Total Poin Anda</p>
          </div>
          <div className="bg-whiteMint rounded-2xl p-6 shadow-lg border-l-4 border-greenDark">
            <Target className="w-10 h-10 text-tealLight mb-3" />
            <h3 className="text-2xl font-bold text-greenDark">15</h3>
            <p className="text-gray-600">Aksi Selesai</p>
          </div>
          <div className="bg-whiteMint rounded-2xl p-6 shadow-lg border-l-4 border-yellowGold">
            <Award className="w-10 h-10 text-oliveDark mb-3" />
            <h3 className="text-2xl font-bold text-greenDark">#42</h3>
            <p className="text-gray-600">Peringkat Nasional</p>
          </div>
          <div className="bg-whiteMint rounded-2xl p-6 shadow-lg border-l-4 border-oliveDark">
            <TreePine className="w-10 h-10 text-greenDark mb-3" />
            <h3 className="text-2xl font-bold text-greenDark">8</h3>
            <p className="text-gray-600">Hari Berturut</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <a href="/aksi" className="bg-tealLight hover:bg-greenDark text-white rounded-2xl p-6 shadow-lg transition-colors group">
            <Target className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Buat Aksi Baru</h3>
            <p className="text-sm opacity-90">Upload foto aktivitas hijau Anda</p>
          </a>
          <a href="/peringkat" className="bg-yellowGold hover:bg-oliveDark text-greenDark hover:text-whiteMint rounded-2xl p-6 shadow-lg transition-colors group">
            <Trophy className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Lihat Peringkat</h3>
            <p className="text-sm opacity-90">Cek posisi Anda di leaderboard</p>
          </a>
          <a href="/persebaran" className="bg-oliveSoft hover:bg-oliveDark text-greenDark hover:text-whiteMint rounded-2xl p-6 shadow-lg transition-colors group">
            <MapPin className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Peta Aktivitas</h3>
            <p className="text-sm opacity-90">Jelajahi aksi di seluruh Indonesia</p>
          </a>
          <a href="/profil" className="bg-greenDark hover:bg-oliveDark text-whiteMint rounded-2xl p-6 shadow-lg transition-colors group">
            <Users className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Profil Saya</h3>
            <p className="text-sm opacity-90">Kelola profil dan riwayat aktivitas</p>
          </a>
        </div>

        {/* Today's Challenge */}
        <div className="bg-gradient-to-r from-tealLight to-greenDark rounded-2xl p-8 text-white mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold mb-2">Tantangan Hari Ini</h2>
              <h3 className="text-xl mb-2">🌱 Kurangi Sampah Plastik</h3>
              <p className="opacity-90 mb-4">Upload foto aktivitas mengurangi penggunaan plastik sekali pakai</p>
              <div className="flex items-center gap-4">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">+50 poin</span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">Berakhir dalam 8 jam</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <a href="/aksi" className="bg-white text-greenDark px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-colors">
                Mulai Sekarang
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activities & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-whiteMint rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-greenDark mb-6">Aktivitas Terbaru Anda</h2>
            <div className="space-y-4">
              {[
                { type: 'Tanam Pohon', points: 50, date: '2 hari lalu', color: 'bg-green-100 text-green-800' },
                { type: 'Daur Ulang', points: 20, date: '3 hari lalu', color: 'bg-blue-100 text-blue-800' },
                { type: 'Bersepeda', points: 30, date: '5 hari lalu', color: 'bg-yellow-100 text-yellow-800' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-whiteGreen rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${activity.color.split(' ')[0]}`}></div>
                    <div>
                      <h3 className="font-semibold text-greenDark">{activity.type}</h3>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                  </div>
                  <span className="text-yellowGold font-bold">+{activity.points}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <a href="/riwayat" className="text-tealLight hover:text-greenDark font-semibold">
                Lihat semua aktivitas →
              </a>
            </div>
          </div>

          {/* Community Leaderboard Preview */}
          <div className="bg-whiteMint rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-greenDark mb-6">Top Pejuang Lingkungan</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-300 rounded w-20"></div>
                            <div className="h-2 bg-gray-300 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="h-4 bg-gray-300 rounded w-10"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                userLeaderboard.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-whiteGreen rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(user.rank)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-greenDark text-sm">
                          {user.full_name || user.name || "Unknown User"}
                        </h3>
                        <p className="text-xs text-gray-600">{user.province}</p>
                      </div>
                    </div>
                    <span className="text-yellowGold font-bold text-sm">
                      {formatPoints(user.points || 0)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6">
              <a href="/peringkat" className="text-tealLight hover:text-greenDark font-semibold">
                Lihat peringkat lengkap →
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer for authenticated users */}
      <footer className="bg-greenDark text-whiteMint p-6 mt-16">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TreePine className="w-6 h-6 text-whiteMint" />
            <span className="text-xl font-bold">GreenActify</span>
          </div>
          <p className="text-mintPastel">
            Terus berkarya untuk lingkungan yang lebih baik
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthenticatedHomepage;
