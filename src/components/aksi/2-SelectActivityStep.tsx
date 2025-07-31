'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getActivityCategoriesWithGroups, getActivityGroups } from '@/lib/get-activities';
import { 
  Search, Leaf, Recycle, TreeDeciduous, BookOpen, BrushCleaning, Bike, Droplet, Zap, Layers, ArrowLeft, Sparkles
} from 'lucide-react';

// Tipe data tidak berubah
export type ActivityCategory = {
  id: string;
  name: string;
  base_points: number;
  activity_category_group?: { group_id: string }[];
};

interface ActivityGroup {
  id: string;
  name: string;
  icon?: string;
}

interface SelectActivityStepProps {
  onActivitySelect: (activity: ActivityCategory) => void;
  onBack: () => void;
}

// Komponen untuk me-render ikon secara dinamis, sudah mendukung ikon yang Anda sebutkan
const IconRenderer = ({ iconName, className }: { iconName?: string; className?: string }) => {
  const iconMap: Record<string, React.ElementType> = useMemo(() => ({
    recycle: Recycle,
    'tree-deciduous': TreeDeciduous,
    'book-open': BookOpen,
    broom: BrushCleaning, // Ikon untuk "Bersih-bersih"
    bike: Bike,
    droplet: Droplet,
    zap: Zap,
    leaf: Leaf,
    Layers: Layers, // Ikon untuk "Semua"
  }), []);

  const IconComponent = iconName ? iconMap[iconName.toLowerCase()] : Layers;

  return IconComponent ? <IconComponent className={className} /> : <Layers className={className} />;
};
export default function SelectActivityStep({ onActivitySelect, onBack }: SelectActivityStepProps) {
  const [groups, setGroups] = useState<ActivityGroup[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getActivityGroups().then(setGroups);
    getActivityCategoriesWithGroups().then(setCategories);
  }, []);

  const filteredCategories = useMemo(() => {
    // Langkah 1: Filter berdasarkan grup dan pencarian
    const filtered = categories.filter((cat) => {
      const matchSearch = cat.name.toLowerCase().includes(search.toLowerCase());
      if (selectedGroup === 'all') {
        return matchSearch;
      }
      const hasGroup = cat.activity_category_group?.some((rel) => rel.group_id === selectedGroup);
      return hasGroup && matchSearch;
    });

    // [FIX] Langkah 2: Acak urutan jika filter "Semua" aktif
    if (selectedGroup === 'all') {
      // Buat salinan array dan acak menggunakan algoritma Fisher-Yates
      const shuffled = [...filtered];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    // Jika bukan "Semua", kembalikan hasil filter biasa
    return filtered;
  }, [categories, selectedGroup, search]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col">

      {/* Search Bar dibuat lebih kecil di mobile */}
      <div className="relative w-full mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Aksi hijau apa yang kamu cari?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm md:py-3 md:text-base md:pl-12 border border-gray-200 rounded-full bg-whiteMint focus:ring-2 focus:ring-tealLight focus:border-tealLight outline-none transition"
        />
      </div>

      {/* Margin bawah dikurangi dari mb-8 menjadi mb-4 agar lebih dekat */}
      <div className="flex gap-3 mb-4 overflow-x-auto pb-2 md:flex-wrap md:overflow-x-visible">
        <button
          className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border transition-all duration-300 flex-shrink-0
            ${selectedGroup === 'all' 
              ? 'bg-greenDark text-whiteMint border-greenDark shadow-md' 
              : 'bg-whiteMint text-greenDark border-gray-200 hover:border-tealLight hover:bg-mintPastel'
            }`}
          onClick={() => setSelectedGroup('all')}
        >
          <IconRenderer iconName="layers" className="w-5 h-5" />
          Semua
        </button>
        {groups.map((group) => (
          <button
            key={group.id}
            className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border transition-all duration-300 flex-shrink-0
              ${selectedGroup === group.id 
                ? 'bg-greenDark text-whiteMint border-greenDark shadow-md' 
                : 'bg-whiteMint text-greenDark border-gray-200 hover:border-tealLight hover:bg-mintPastel'
              }`}
            onClick={() => setSelectedGroup(group.id)}
          >
            <IconRenderer iconName={group.icon} className="w-5 h-5" />
            {group.name}
          </button>
        ))}
      </div>

      {/* Daftar Aktivitas */}
      <div className="w-full space-y-3">
        {filteredCategories.length === 0 && (
          <div className="text-center text-gray-500 py-10 flex flex-col items-center gap-4">
            <Sparkles size={40} className="text-gray-400"/>
            <p>Oops! Aktivitas tidak ditemukan.</p>
          </div>
        )}
        {filteredCategories.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onActivitySelect(activity)}
            className={`
              w-full text-left p-3
              bg-greenDark border border-greenDark rounded-xl
              hover:bg-tealLight hover:border-tealLight hover:shadow-lg hover:-translate-y-1 transition-all duration-300
              flex justify-between items-center group
            `}
          >
            <span className="font-medium text-whiteMint text-sm md:text-base mr-4">{activity.name}</span>
            <span className="font-bold text-yellowGold text-sm md:text-base whitespace-nowrap">
              +{activity.base_points} Poin
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
