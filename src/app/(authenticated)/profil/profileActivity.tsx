'use client'
import React, { useState } from 'react';
import { useActivities } from '@/hooks/useSupabase';
import ActivityCard from "@/components/profil/activityCard";
import {
Recycle,
Trash2,
Lightbulb,
Book,
Droplet,
Wheat,
Bike,
Trees,
Loader2,
AlertCircle,
BrushCleaning,
} from 'lucide-react';

import { ChevronDown, ChevronUp } from 'lucide-react';
export default function ProfileActivity(){
    const [activeTab, setActiveTab] = useState<'activities' | 'overview'>('overview');
    const { activities, loading, error, refetch } = useActivities();;
    const [visibleCount, setVisibleCount] = useState(9); // jumlah awal yang ditampilkan

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

    if (loading)
        return (
        <div className="flex justify-center items-center h-64 bg-green-50 rounded-lg shadow-inner">
            <Loader2 className="h-12 w-12 animate-spin text-green-400" />
            <p className="ml-4 text-green-600 text-lg font-medium">Memuat data aktivitas...</p>
        </div>
        );



    let daur_ulang_count = 0;
    let bersih_bersih_count = 0;
    let hemat_energi_count = 0;
    let edukasi_lingkungan_count = 0;
    let hemat_air_count = 0;
    let makanan_organik_count = 0;
    let transportasi_hijau_count = 0;
    let penghijauan_count = 0;

    for (const activity of activities) {
        if (activity.activity_categories.group_category === 'Daur Ulang')
        daur_ulang_count += 1;
        else if (activity.activity_categories.group_category === 'Bersih-bersih')
        bersih_bersih_count += 1;
        else if (activity.activity_categories.group_category === 'Hemat Energi')
        hemat_energi_count += 1;
        else if (
        activity.activity_categories.group_category === 'Edukasi Lingkungan'
        )
        edukasi_lingkungan_count += 1;
        else if (activity.activity_categories.group_category === 'Hemat Air')
        hemat_air_count += 1;
        else if (activity.activity_categories.group_category === 'Makanan Organik')
        makanan_organik_count += 1;
        else if (
        activity.activity_categories.group_category === 'Transportasi Hijau'
        )
        transportasi_hijau_count += 1;
        else if (activity.activity_categories.group_category === 'Penghijauan')
        penghijauan_count += 1;
    }

    const activitiesData = [
        {
        name: 'daur_ulang',
        count: daur_ulang_count,
        icon: <Recycle className="h-10 w-10 text-emerald-500" />,
        label: 'Daur Ulang',
        description:
            'Mengubah sampah menjadi sesuatu yang baru dan bermanfaat, mengurangi limbah.',
        },
        {
        name: 'bersih_bersih',
        count: bersih_bersih_count,
        icon: <BrushCleaning className="h-10 w-10 text-blue-500" />,
        label: 'Bersih-Bersih',
        description:
            'Menjaga lingkungan tetap rapi dan bebas dari sampah, untuk kesehatan bersama.',
        },
        {
        name: 'hemat_energi',
        count: hemat_energi_count,
        icon: <Lightbulb className="h-10 w-10 text-amber-500" />,
        label: 'Hemat Energi',
        description:
            'Mengurangi konsumsi energi untuk melestarikan sumber daya dan biaya.',
        },
        {
        name: 'edukasi_lingkungan',
        count: edukasi_lingkungan_count,
        icon: <Book className="h-10 w-10 text-purple-500" />,
        label: 'Edukasi Lingkungan',
        description:
            'Meningkatkan kesadaran dan pengetahuan tentang isu-isu lingkungan.',
        },
        {
        name: 'hemat_air',
        count: hemat_air_count,
        icon: <Droplet className="h-10 w-10 text-cyan-500" />,
        label: 'Hemat Air',
        description:
            'Mengelola penggunaan air secara bijak untuk keberlanjutan pasokan air bersih.',
        },
        {
        name: 'makanan_organik',
        count: makanan_organik_count,
        icon: <Wheat className="h-10 w-10 text-lime-500" />,
        label: 'Makanan Organik',
        description:
            'Mendukung pertanian berkelanjutan dan mengurangi paparan bahan kimia berbahaya.',
        },
        {
        name: 'transportasi_hijau',
        count: transportasi_hijau_count,
        icon: <Bike className="h-10 w-10 text-indigo-500" />,
        label: 'Transportasi Hijau',
        description:
            'Memilih moda transportasi ramah lingkungan untuk mengurangi emisi karbon.',
        },
        {
        name: 'penghijauan',
        count: penghijauan_count,
        icon: <Trees className="h-10 w-10 text-green-500" />,
        label: 'Penghijauan',
        description:
            'Menanam pohon dan menjaga vegetasi untuk udara bersih dan ekosistem sehat.',
        },
    ];

    return(
        <>
            <section className="mx-auto flex bg-oliveSoft rounded-4xl p-1 mt-5 max-w-7xl">
                <button
                className={`flex-1 py-3 px-4 rounded-4xl font-semibold transition-colors ${
                    activeTab === 'overview'
                    ? 'bg-greenDark text-whiteMint shadow-sm'
                    : 'text-greenDark hover:bg-mintPastel hover:shadow-lg'
                }`}
                onClick={() => setActiveTab('overview')}
                >
                Jejakku
                </button>

                <button
                className={`flex-1 py-3 px-4 rounded-4xl font-semibold transition-colors ${
                    activeTab === 'activities'
                    ? 'bg-greenDark text-whiteMint shadow-sm'
                    : 'text-greenDark hover:bg-mintPastel hover:shadow-lg'
                }`}
                onClick={() => setActiveTab('activities')}
                >
                Riwayat
                </button>
            </section>

            <section className="w-full bg-greenDark rounded-4xl mb-4 mt-5 md:px-8 md:py-6 px-3 py-1">
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
                            className="mt-8 px-6 py-3 border-2 border-[#BBE8C3] text-[#BBE8C3] rounded-full shadow-md hover:bg-[#6d9773] hover:border-green-700 transition-all duration-300 text-lg font-medium flex items-center gap-2"
                          >
                            Lihat Lebih Banyak Aktivitas <ChevronDown className="h-5 w-5" />
                          </button>
                        )}
                  
                        {visibleCount > 9 && (
                          <button
                            onClick={() => setVisibleCount(9)}
                            className="mt-4 px-6 py-2 border border-white text-white rounded-full hover:bg-gray-700 transition-all flex items-center gap-2"
                          >
                            Sembunyikan Aktivitas <ChevronUp className="h-4 w-4" />
                          </button>
                        )}
                    </div>
                      
                </>
              )}
      
              {activeTab === 'overview' && (
                <>
                  <h2 className="font-bold text-xl text-whiteMint text-center pb-4">
                    Jumlah Aktivitas
                  </h2>

                    <div className="grid grid-cols-2 gap-4 pb-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 place-items-center px-4">
                        {activitiesData.map((activity) => (
                            <div
                            key={activity.name}
                            className="flex flex-col items-center p-4 bg-green-50 rounded-2xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-102 border border-green-100 w-full h-[280px]"
                            >
                            <div className="mb-3 p-3 bg-white rounded-full shadow-inner flex items-center justify-center">
                                {activity.icon}
                            </div>
                            <h3 className="mb-1 text-base font-semibold text-green-800 text-center">
                                {activity.label}
                            </h3>
                            <p className="mb-4 sm:text-sm text-[9px]   text-green-700 text-center leading-relaxed flex-grow overflow-y-auto">
                                {activity.description}
                            </p>
                            <div className="mt-auto flex flex-col items-center">
                                <span className="text-xl  sm:text-3xl font-extrabold text-green-800 leading-none">
                                {activity.count}
                                </span>
                                <span className="block text-sm font-medium text-green-600 mt-1">Aktivitas</span>
                            </div>
                            </div>
                        ))}
                    </div>
                </>
              )}
            </section>
        </>
    )
}