"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Trophy,
  Award,
  MapPin,
  TreePine,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Map,
  ExternalLink,
  FileText,
  Download,
} from "lucide-react";
import { DailyChallenge, ActivityHistory } from "@/lib/types/homepage";
import DesktopSidebar from "@/components/navbar/DesktopSidebar";
import MobileBottomNav from "@/components/navbar/MobileBottomNav";
import { HeatmapWidget, useProvinceData } from "@/components/heatmap";

interface AuthenticatedHomepageProps {
  dailyChallenges: DailyChallenge[];
  activityHistory: ActivityHistory[];
  activityLoading: boolean;
  userName?: string;
}

const AuthenticatedHomepage: React.FC<AuthenticatedHomepageProps> = ({
  dailyChallenges,
  activityHistory,
  activityLoading,
  userName,
}) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  const nextChallenge = () => {
    if (dailyChallenges && dailyChallenges.length > 1) {
      const newIndex = currentChallengeIndex === dailyChallenges.length - 1 ? 0 : currentChallengeIndex + 1;
      setCurrentChallengeIndex(newIndex);
    }
  };

  const prevChallenge = () => {
    if (dailyChallenges && dailyChallenges.length > 1) {
      const newIndex = currentChallengeIndex === 0 ? dailyChallenges.length - 1 : currentChallengeIndex - 1;
      setCurrentChallengeIndex(newIndex);
    }
  };

  // Reset index if it's out of bounds
  React.useEffect(() => {
    if (dailyChallenges && currentChallengeIndex >= dailyChallenges.length) {
      setCurrentChallengeIndex(0);
    }
  }, [dailyChallenges, currentChallengeIndex]);

  // Ensure we have valid challenges and index
  const validChallenges = dailyChallenges || [];
  const safeIndex = Math.max(0, Math.min(currentChallengeIndex, validChallenges.length - 1));
  const currentChallenge = validChallenges[safeIndex];
  return (
    <div className="min-h-screen bg-mintPastel">
      {/* Navigation Components */}
      <DesktopSidebar />
      <MobileBottomNav />

      {/* Main Content - This will work with the existing layout */}
      <main className="container mx-auto px-6 pb-24 pt-0 lg:ml-36 lg:pl-15 lg:pb-8 lg:pt-20">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-10 md:mb-8">
            <img
              src="/logo-greenactify.svg"
              alt="GreenActify Logo"
              className="h-14 md:h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-greenDark mb-0 md:mb-2 px-4">
            {userName ? `Selamat Datang Kembali, ${userName}!` : 'Selamat Datang Kembali!'}
            <span className="text-tealLight block text-lg md:text-xl mt-2">Mari lanjutkan misi hijau Anda</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
          {/* Today's Challenge Carousel */}
          <div className="lg:flex-1 mb-12 lg:mb-0">
            <div className="relative bg-gradient-to-br from-tealLight via-greenDark to-oliveDark rounded-3xl py-6 px-2 md:px-6 text-white overflow-visible md:overflow-hidden shadow-xl">
              {dailyChallenges.length > 0 && currentChallenge ? (
                <>
                  {/* Challenge Content */}
                  <div className="relative z-10">
                    {/* Header with indicators */}
                    <div className="flex items-center justify-between mb-4 px-6">
                      <div>
                        <h2 className="text-xl font-bold mb-1">
                          {currentChallenge.id === 0 ? 'Tantangan Acak' : 'Tantangan Hari Ini'}
                          {dailyChallenges.length > 1 && (
                            <span className="text-sm font-normal ml-2 opacity-80">
                              ({safeIndex + 1}/{dailyChallenges.length})
                            </span>
                          )}
                        </h2>
                        <p className="text-white/80 text-sm">
                          {(() => {
                            const now = new Date();
                            const indonesianTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
                            return indonesianTime.toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                          })()}
                        </p>
                      </div>
                      {dailyChallenges.length > 1 && (
                        <div className="flex items-center space-x-2">
                          {dailyChallenges.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setCurrentChallengeIndex(index);
                              }}
                              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                index === safeIndex
                                  ? 'bg-white scale-110'
                                  : 'bg-white/40 hover:bg-white/60'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Challenge Card and Arrows Container */}
                    <div className="flex items-center justify-center gap-1 md:gap-2 px-1 md:px-2">
                      {/* Left Arrow */}
                      {dailyChallenges.length > 1 && (
                        <button
                          onClick={prevChallenge}
                          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 z-20 backdrop-blur-sm border border-white/30 hover:scale-110"
                        >
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                      )}

                      {/* Challenge Card */}
                      <div
                        className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-h-[200px] md:min-h-[140px] flex items-start justify-center mx-auto max-w-2xl flex-1 h-auto cursor-pointer hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:border-white/30"
                        onClick={() => window.location.href = `/aksi?challenge=${currentChallenge.id}&mode=challenge`}
                      >
                        <div className="flex items-start justify-between flex-wrap gap-4 w-full">
                          <div className="flex-1 min-w-0">
                            {/* Challenge Icon & Title */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">
                                {currentChallenge.icon}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold">{currentChallenge.title}</h3>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-white/90 mb-3 leading-relaxed text-sm">{currentChallenge.description}</p>

                            {/* Instructions */}
                            {currentChallenge.instructions && (
                              <div className="mb-3 p-3 bg-white/10 rounded-lg border border-white/20">
                                <h4 className="text-sm font-semibold text-white mb-2">📋 Instruksi:</h4>
                                {Array.isArray(currentChallenge.instructions) ? (
                                  <ul className="space-y-1">
                                    {currentChallenge.instructions.map((instruction, index) => (
                                      <li key={index} className="text-white/90 text-xs leading-relaxed flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{instruction}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-white/90 text-xs leading-relaxed">{currentChallenge.instructions}</p>
                                )}
                              </div>
                            )}

                            {/* Challenge Stats */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="bg-[#FFEC86]/40 border border-[#FFEC86]/60 px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="text-xs font-medium text-red">x{currentChallenge.double_points} poin</span>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                currentChallenge.difficulty === 'easy'
                                  ? 'bg-green-500/20 border-green-400/30 text-green-100' :
                                currentChallenge.difficulty === 'medium'
                                  ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-100' :
                                  'bg-red-500/20 border-red-400/30 text-red-100'
                              }`}>
                                {currentChallenge.difficulty === 'easy' ? '🟢 Mudah' :
                                 currentChallenge.difficulty === 'medium' ? '🟡 Sedang' : '🔴 Sulit'}
                              </div>
                              {currentChallenge.hoursRemaining !== undefined && (
                                <div className="bg-white/20 border border-white/30 px-2 py-1 rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-white" />
                                  <span className="text-xs font-medium">{currentChallenge.hoursRemaining}h tersisa</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Arrow */}
                      {dailyChallenges.length > 1 && (
                        <button
                          onClick={nextChallenge}
                          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 z-20 backdrop-blur-sm border border-white/30 hover:scale-110"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                  <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-yellowGold/10 rounded-full -translate-y-8"></div>

                  {/* Floating particles effect */}
                  <div className="absolute top-3 left-1/4 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-4 right-1/3 w-1 h-1 bg-yellowGold/50 rounded-full animate-pulse delay-300"></div>
                  <div className="absolute top-1/3 left-1/6 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-700"></div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 animate-spin" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">Memuat Tantangan...</h2>
                    <p className="text-white/80 text-sm">Sedang mempersiapkan tantangan menarik untuk Anda</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:flex-1">
            <div className="bg-oliveSoft rounded-2xl shadow-lg p-6">
              <h2 className="text-xl text-center italic md:text-2xl lg:text-xl font-bold text-greenDark mb-6">Aktivitas Terbaru Anda</h2>
              <div className="space-y-4">
                {activityLoading ? (
                  // Loading state
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-300 rounded w-32"></div>
                              <div className="h-3 bg-gray-300 rounded w-24"></div>
                            </div>
                          </div>
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activityHistory.length > 0 ? (
                  activityHistory.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-whiteGreen rounded-xl md:text-3xl transition-colors duration-200 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          {activity.verified && <CheckCircle className="w-5 h-5 text-green-500" />}
                          <div>
                            <h3 className="font-semibold text-greenDark text-base">{activity.type}</h3>
                            <p className="text-sm text-gray-600">{activity.relativeTime}</p>
                            {activity.location && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-yellowGold font-bold text-lg">+{activity.points}</span>
                        <p className="font-bold text-yellowGold text-base md:text-sm">Poin</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="bg-gray-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <Target className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada aktivitas</h3>
                    <p className="text-sm mb-4">Mulai buat aksi lingkungan pertama Anda!</p>
                    <button
                      onClick={() => window.location.href = '/aksi'}
                      className="bg-tealLight hover:bg-greenDark text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Mulai Aksi Sekarang
                    </button>
                  </div>
                )}
              </div>
              {activityHistory.length > 0 && (
                <div className="mt-8 text-center">
                  <a
                    href="/profil"
                    className="inline-flex items-center gap-2 text-whiteMint hover:text-greenDark font-semibold text-lg transition-colors duration-200 hover:underline"
                  >
                    Lihat semua aktivitas
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Heatmap and PDF Report Section */}
        <div className="mt-12 lg:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Heatmap Section - 70% width on desktop */}
            <div className="lg:col-span-7">
              <div className="bg-whiteMint rounded-2xl shadow-lg p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-greenDark mb-2">
                      Persebaran Aktivitas Lingkungan
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base">
                      Lihat aktivitas lingkungan di seluruh Indonesia
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-0">
                  <HomepageHeatmap />
                </div>

                {/* Bottom button for map detail */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => window.location.href = '/persebaran'}
                    className="inline-flex items-center gap-2 bg-greenDark hover:bg-tealLight text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-base shadow-md hover:shadow-lg"
                  >
                    <Map className="w-5 h-5" />
                    Lihat Detail Lengkap
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Report Download Section - 30% width on desktop */}
            <div className="lg:col-span-3">
              <div className="bg-whiteMint rounded-2xl shadow-lg p-6 h-full flex flex-col justify-center">
                <div className="text-center mb-6">
                  <FileText className="w-12 h-12 lg:w-16 lg:h-16 text-tealLight mx-auto mb-4" />
                  <h2 className="text-lg lg:text-xl font-bold text-greenDark mb-4">
                    Laporan Dampak Lingkungan
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm lg:text-base">
                    Unduh laporan lengkap tentang dampak aksi lingkungan di
                    Indonesia. Dapatkan insight mendalam tentang kontribusi setiap
                    provinsi dan pencapaian komunitas.
                  </p>
                </div>

                <div className="flex justify-center mb-6">
                  <a
                    href="/unduh-dampak"
                    className="w-full bg-tealLight text-white py-2 px-4 rounded-lg font-semibold hover:bg-greenDark transition-colors flex items-center justify-center gap-2 text-center text-sm lg:text-base"
                  >
                    <Download className="w-4 h-4" />
                    Unduh PDF
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    Laporan ini berisi data real-time dari aktivitas pengguna dan
                    dampak lingkungan yang terukur
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Data Statistik
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Trend Analisis
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Pencapaian Komunitas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Heatmap component for homepage
const HomepageHeatmap: React.FC = () => {
  const { provinceData, loading, error } = useProvinceData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 bg-tealLight/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Map className="w-6 h-6 text-tealLight" />
          </div>
          <p className="text-gray-600">Memuat peta persebaran...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Map className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-red-600 mb-2">Gagal memuat peta</p>
          <p className="text-gray-500 text-sm">Silakan coba lagi nanti</p>
        </div>
      </div>
    );
  }

  return (
    <HeatmapWidget
      provinceData={provinceData}
      config={{
        height: '400px',
        dataField: 'totalActivities',
        colorScheme: 'green',
        showLegend: true,
        showSummary: false
      }}
      mapControls={{
        showZoom: true,
        showAttribution: false,
        showScale: false
      }}
      title="Aktivitas Lingkungan per Provinsi"
      description="Distribusi aktivitas lingkungan di seluruh Indonesia"
      className="w-full"
    />
  );
};

export default AuthenticatedHomepage;
