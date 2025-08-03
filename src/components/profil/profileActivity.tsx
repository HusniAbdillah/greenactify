'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ActivityCard from "@/components/profil/activityCard";
import {
  Recycle, Trash2, Lightbulb, Book, Droplet, Wheat, Bike, Trees,
  Loader2, AlertCircle, BrushCleaning, ChevronDown, ChevronUp
} from 'lucide-react';

export type ActivityItem = {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description?: string | null;
  points: number;
  image_url?: string | null
  latitude?: number | null;
  longitude?: number | null;
  province?: string | null;
  like_count: number;
  created_at: string;
  updated_at: string;
  generated_image_url?: string | null;

  activity_categories: {
    name: string;
    base_points: number;
    group_category: string;
  };
};

type ProfileActivityProps = {
  activities: ActivityItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};
export default function ProfileActivity({
  activities,
  loading,
  error,
  refetch,
}: ProfileActivityProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'activities' | 'overview'>('overview');
  const [visibleCount, setVisibleCount] = useState(9);

  const activitiesToShow = activities.slice(0, visibleCount);
  const hasMoreActivities = activities.length > visibleCount;

  if (loading) return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-md bg-gray-200" />
      ))}
    </div>
  );

  if (error) return (
    <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
      Gagal memuat aktivitas: {error.message}, Tolong Refresh halaman
    </div>
  );

  if (activities.length === 0) return (
    <div className="rounded-lg bg-blue-50 p-4 text-center text-blue-600">
      Belum ada aktivitas yang tercatat
    </div>
  );

  const countMap = {
    'Daur Ulang': 0,
    'Bersih-bersih': 0,
    'Hemat Energi': 0,
    'Edukasi Lingkungan': 0,
    'Hemat Air': 0,
    'Makanan Organik': 0,
    'Transportasi Hijau': 0,
    'Penghijauan': 0,
  };

  for (const activity of activities) {
    const group = activity.activity_categories.group_category;
    if (group in countMap) {
      countMap[group as keyof typeof countMap] += 1;
    }
  }
  const activitiesData = [
    { name: 'daur_ulang', count: countMap['Daur Ulang'], icon: <Recycle className="h-8 w-8 md:h-10 md:w-10 text-emerald-500" />, label: 'Daur Ulang', description: 'Mengubah sampah menjadi sesuatu yang baru dan bermanfaat, mengurangi limbah.' },
    { name: 'bersih_bersih', count: countMap['Bersih-bersih'], icon: <BrushCleaning className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />, label: 'Bersih-Bersih', description: 'Menjaga lingkungan agar tetap bersih, rapi, dan mengurangi sumber penyakit.' },
    { name: 'hemat_energi', count: countMap['Hemat Energi'], icon: <Lightbulb className="h-8 w-8 md:h-10 md:w-10 text-amber-500" />, label: 'Hemat Energi', description: 'Mengurangi konsumsi energi untuk melestarikan sumber daya dan biaya.' },
    { name: 'edukasi_lingkungan', count: countMap['Edukasi Lingkungan'], icon: <Book className="h-10 w-10 text-purple-500" />, label: 'Edukasi Lingkungan', description: 'Meningkatkan kesadaran tentang isu lingkungan.' },
    { name: 'hemat_air', count: countMap['Hemat Air'], icon: <Droplet className="h-8 w-8 md:h-10 md:w-10 text-cyan-500" />, label: 'Hemat Air', description: 'Mengelola penggunaan air secara bijak untuk keberlanjutan pasokan air bersih.' },
    { name: 'makanan_organik', count: countMap['Makanan Organik'], icon: <Wheat className="h-8 w-8 md:h-10 md:w-10 text-lime-500" />, label: 'Makanan Organik', description: 'Mendukung pertanian yang sehat dan berkelanjutan.' },
    { name: 'transportasi_hijau', count: countMap['Transportasi Hijau'], icon: <Bike className="h-8 w-8 md:h-10 md:w-10 text-indigo-500" />, label: 'Transportasi Hijau', description: 'Memilih moda transportasi ramah lingkungan untuk mengurangi emisi karbon.' },
    { name: 'penghijauan', count: countMap['Penghijauan'], icon: <Trees className="h-8 w-8 md:h-10 md:w-10 text-green-500" />, label: 'Penghijauan', description: 'Menanam pohon dan menjaga vegetasi untuk udara bersih dan ekosistem sehat.' },
  ];

  return (
    <>
      <section className="mx-auto flex bg-oliveSoft rounded-4xl p-1 mt-5 max-w-7xl">
        <button
          className={` cursor-pointer flex-1 py-3 px-4 rounded-4xl font-semibold transition-colors ${activeTab === 'overview' ? 'bg-greenDark text-whiteMint shadow-sm' : 'text-greenDark hover:bg-mintPastel hover:shadow-lg'}`}
          onClick={() => setActiveTab('overview')}
        >
          Jejakku
        </button>
        <button
          className={` cursor-pointer flex-1 py-3 px-4 rounded-4xl font-semibold transition-colors ${activeTab === 'activities' ? 'bg-greenDark text-whiteMint shadow-sm' : 'text-greenDark hover:bg-mintPastel hover:shadow-lg'}`}
          onClick={() => setActiveTab('activities')}
        >
          Riwayat

        </button>
      </section>

      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push('/riwayat');
          }}
          className="px-4 py-2 rounded-xl bg-oliveSoft text-whiteMint hover:bg-greenDark transition-colors duration-200 text-xs sm:text-sm md:text-base shadow-md"
        >
          Cari Akrivitas
        </button>
      </div>




      <section className="w-full bg-greenDark rounded-4xl mb-4 mt-3 md:px-8 md:py-6 px-3 py-1">
        {activeTab === 'activities' && (
          <>
            <h2 className="font-bold text-xl text-whiteMint text-center pb-4">
              Riwayat Aksi
            </h2>

            <div className="flex flex-col items-center w-full">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {activitiesToShow.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} onUpdated={refetch} />
                ))}
              </div>

              {hasMoreActivities && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                  className="mt-8 mb-4 px-6 py-3 border-2 border-[#BBE8C3] text-[#BBE8C3] rounded-full shadow-md hover:bg-[#6d9773] hover:border-green-700 transition-all duration-300 text-xs sm:text-sm lg:text-lg font-medium flex items-center gap-2"
                >
                  Lihat Lebih Banyak Aktivitas <ChevronDown className="h-5 w-5" />
                </button>
              )}

              {visibleCount > 9 && (
                <button
                  onClick={() => setVisibleCount(9)}
                  className="mt-4  mb-4 px-6 py-2 border border-white text-white rounded-full hover:bg-gray-700 transition-all flex items-center gap-2 text-xs sm:text-sm  lg:text-lg"
                >
                  Sembunyikan Aktivitas <ChevronUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </>
        )}

        {activeTab === 'overview' && (
          <>
            <h2 className="font-bold text-md sm:text-lg md:text-xl text-whiteMint text-center pb-4">
              Jumlah Aktivitas
            </h2>


            <div className="grid grid-cols-2 gap-4 pb-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 place-items-center px-4">
              {activitiesData.map((activity) => (
                <div
                  key={activity.name}
                  className="flex flex-col items-center p-4 bg-whiteMint rounded-3xl shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02] border border-whiteGreen w-full h-[280px]"
                >
                  <div className="mb-3 p-3 bg-whiteGreen rounded-full shadow-md flex items-center justify-center">
                    {activity.icon}
                  </div>
                  <h3 className="mb-1 text-sm sm:text-lg font-bold text-greenDark text-center">
                    {activity.label}
                  </h3>
                  <p className="mb-4 text-[9.2px] sm:text-sm md:text-md  text-oliveDark text-center leading-relaxed flex-grow overflow-y-auto">
                    {activity.description}
                  </p>
                  <div className="mt-auto flex flex-col items-center">
                    <span className="text-xl sm:text-3xl  font-extrabold text-greenDark leading-none">
                      {activity.count}
                    </span>
                    <span className="block text-xs sm:text-sm font-medium text-oliveDark mt-1">Aktivitas</span>
                  </div>
                </div>
              ))}
            </div>


          </>
        )}
      </section>
    </>
  );
}