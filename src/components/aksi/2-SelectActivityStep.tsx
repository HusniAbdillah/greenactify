'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getActivityCategoriesWithGroups, getActivityGroups } from '@/lib/get-activities';
import { 
  Search, Leaf, Recycle, TreeDeciduous, BookOpen, BrushCleaning, Bike, Droplet, Zap, Layers, ArrowLeft, Sparkles, X
} from 'lucide-react';

export type ActivityCategory = {
  id: string;
  name: string;
  base_points: number;
  description: string;
  group_category?: string; // Langsung string dari kolom group_category
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

const IconRenderer = ({ iconName, className }: { iconName?: string; className?: string }) => {
  const iconMap: Record<string, React.ElementType> = useMemo(() => ({
    recycle: Recycle,
    'tree-deciduous': TreeDeciduous,
    'book-open': BookOpen,
    broom: BrushCleaning,
    bike: Bike,
    droplet: Droplet,
    zap: Zap,
    leaf: Leaf,
    Layers: Layers,
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
    getActivityGroups().then((groupsData) => {
      console.log('Groups data:', groupsData);
      setGroups(groupsData);
    });
    getActivityCategoriesWithGroups().then((categoriesData) => {
      console.log('Categories data:', categoriesData);
      setCategories(categoriesData);
    });
  }, []);

  const filteredCategories = useMemo(() => {
    console.log('Filtering - selectedGroup:', selectedGroup);
    console.log('Available categories:', categories.map(c => ({ name: c.name, group_category: c.group_category })));
    
    const filtered = categories.filter((cat) => {
      // Search dalam nama dan deskripsi
      const searchLower = search.toLowerCase();
      const matchSearch = cat.name.toLowerCase().includes(searchLower) ||
                         (cat.description && cat.description.toLowerCase().includes(searchLower));
      
      // Filter berdasarkan grup
      let matchGroup = true;
      if (selectedGroup !== 'all') {
        // Coba match dengan ID atau nama grup
        const group = groups.find(g => g.id === selectedGroup);
        matchGroup = cat.group_category === selectedGroup || 
                    cat.group_category === group?.name;
        console.log(`Category ${cat.name}: group_category=${cat.group_category}, selectedGroup=${selectedGroup}, groupName=${group?.name}, match=${matchGroup}`);
      }
      
      return matchSearch && matchGroup;
    });

    console.log('Filtered results:', filtered.length);

    if (selectedGroup === 'all') {
      const shuffled = [...filtered];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    return filtered;
  }, [categories, selectedGroup, search, groups]);

  const clearAllFilters = () => {
    setSelectedGroup('all');
    setSearch('');
  };

  const hasActiveFilters = selectedGroup !== 'all' || search;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col">

      <div className="relative w-full mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Cari nama atau deskripsi aktivitas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm md:py-3 md:text-base md:pl-12 border border-gray-200 rounded-full bg-whiteMint focus:ring-2 focus:ring-tealLight focus:border-tealLight outline-none transition"
        />
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear all filters"
          >
            <X size={18} />
          </button>
        )}
      </div>

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

      <div className="w-full space-y-3">
        {filteredCategories.length === 0 && (
          <div className="text-center text-gray-500 py-10 flex flex-col items-center gap-4">
            <Sparkles size={40} className="text-gray-400"/>
            <p>Oops! Aktivitas tidak ditemukan.</p>
            {(selectedGroup !== 'all' || search) && (
              <p className="text-sm">
                Coba ubah filter atau kata kunci pencarian
              </p>
            )}
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
            <div className="flex flex-col">
              <span className="font-medium text-whiteMint text-sm md:text-base mr-4">{activity.name}</span>
              {activity.description && (
                <span className="text-xs text-mintPastel opacity-80 mt-1">{activity.description}</span>
              )}
            </div>
            <span className="font-bold text-yellowGold text-sm md:text-base whitespace-nowrap">
              +{activity.base_points} Poin
            </span>
          </button>
        ))}
        
        {/* Info jumlah aktivitas */}
        {filteredCategories.length > 0 && (
          <div className="text-center text-gray-500 text-sm mt-4">
            Menampilkan {filteredCategories.length} aktivitas
            {selectedGroup !== 'all' && ` dari grup yang dipilih`}
          </div>
        )}
      </div>
    </div>
  );
}
