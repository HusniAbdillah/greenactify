'use client';

import { useState } from 'react';
import { ActivityItem } from "@/hooks/useSupabase";
import ActivityCard from "./activityCard";
import { useActivities } from '@/hooks/useSupabase';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ActivitiesGrid() {
  const { activities, loading, error, refetch } = useActivities();
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

  return (
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
  );
}
