import React from 'react';
import { useActivities } from '@/hooks/useSupabase';
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
} from 'lucide-react';

export default function GroupActivityGrid() {
  const { activities, loading, error } = useActivities();

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 bg-green-50 rounded-lg shadow-inner">
        <Loader2 className="h-12 w-12 animate-spin text-green-400" />
        <p className="ml-4 text-green-600 text-lg font-medium">Memuat data aktivitas...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center p-6 bg-red-50 rounded-lg shadow-md border border-red-200 text-red-700 font-medium">
        <AlertCircle className="h-6 w-6 mr-3 text-red-500" />
        <span>Gagal memuat aktivitas: {error.message}, Tolong Refresh halaman </span>
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
      icon: <Trash2 className="h-10 w-10 text-blue-500" />,
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

  return (
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
  );
}