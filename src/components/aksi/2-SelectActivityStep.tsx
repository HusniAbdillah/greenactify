'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getActivityCategoriesWithGroups, getActivityGroups } from '@/lib/get-activities';
import { 
  Search, Leaf, Recycle, TreeDeciduous, BookOpen, BrushCleaning, Bike, Droplet, Zap, Layers, ArrowLeft, Sparkles, X, Target, Trophy, Zap as Lightning
} from 'lucide-react';

export type ActivityCategory = {
  id: string;
  name: string;
  base_points: number;
  description: string;
  group_category?: string;
};

interface ActivityGroup {
  id: string;
  name: string;
  icon?: string;
}

interface SelectActivityStepProps {
  onActivitySelect: (activity: ActivityCategory) => void;
  onBack: () => void;
  challengeFilter?: string; 
  challengeMultiplier?: number; 
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
    target: Target,
    trophy: Trophy,
    lightning: Lightning,
  }), []);

  const IconComponent = iconName ? iconMap[iconName.toLowerCase()] : Layers;

  return IconComponent ? <IconComponent className={className} /> : <Layers className={className} />;
};
export default function SelectActivityStep({ 
  onActivitySelect, 
  onBack, 
  challengeFilter,
  challengeMultiplier 
}: SelectActivityStepProps) {
  const [groups, setGroups] = useState<ActivityGroup[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getActivityGroups().then((groupsData) => {
      setGroups(groupsData);
    });
    getActivityCategoriesWithGroups().then((categoriesData) => {
      setCategories(categoriesData);
    });
    
    if (challengeFilter) {
      setSelectedGroup(challengeFilter);
    } else {
      setSelectedGroup('all');
    }
  }, [challengeFilter]);

  const filteredCategories = useMemo(() => {
    
    if (challengeFilter && groups.length > 0) {
      const targetGroup = groups.find(g => g.id === challengeFilter);
       
      const challengeFiltered = categories.filter((cat) => {
        const matchById = cat.group_category === challengeFilter;
        const matchByName = targetGroup && cat.group_category === targetGroup.name;
        
        return matchById || matchByName;
      });
            
      const searchFiltered = challengeFiltered.filter((cat) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return cat.name.toLowerCase().includes(searchLower) ||
               (cat.description && cat.description.toLowerCase().includes(searchLower));
      });
      
      return searchFiltered;
    }

    const filtered = categories.filter((cat) => {
      const searchLower = search.toLowerCase();
      const matchSearch = cat.name.toLowerCase().includes(searchLower) ||
                         (cat.description && cat.description.toLowerCase().includes(searchLower));
      
      let matchGroup = true;
      if (selectedGroup !== 'all') {
        const group = groups.find(g => g.id === selectedGroup);
        matchGroup = cat.group_category === selectedGroup || 
                    cat.group_category === group?.name;
      }
      
      return matchSearch && matchGroup;
    });

    if (selectedGroup === 'all') {
      const shuffled = [...filtered];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    return filtered;
  }, [categories, selectedGroup, search, groups, challengeFilter]);

  const clearAllFilters = () => {
    setSelectedGroup('all');
    setSearch('');
  };

  const hasActiveFilters = selectedGroup !== 'all' || search;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col">

      {challengeFilter && (
        <div className="bg-yellowGold/10 border border-yellowGold/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-yellowAmber" />
            <h3 className="font-bold text-yellowAmber">Mode Challenge Aktif</h3>
          </div>
          <p className="text-sm text-gray-700">
            Aktivitas telah difilter sesuai dengan challenge hari ini. 
            {challengeMultiplier && challengeMultiplier > 1 && (
              <span className="font-semibold"> Poin akan dikalikan {challengeMultiplier}x!</span>
            )}
          </p>
        </div>
      )}

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

      {!challengeFilter && (
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2 md:flex-wrap md:overflow-x-visible">
          <button
            className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border transition-all duration-300 flex-shrink-0
              ${selectedGroup === 'all' 
                ? 'bg-greenDark text-whiteMint border-greenDark shadow-md' 
                : 'bg-whiteMint text-greenDark border-gray-200 hover:border-tealLight hover:bg-mintPastel'
              }`}
            onClick={() => setSelectedGroup('all')}
            disabled={!!challengeFilter} 
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
              disabled={!!challengeFilter} // Convert to boolean using !!
            >
              <IconRenderer iconName={group.icon} className="w-5 h-5" />
              {group.name}
            </button>
          ))}
        </div>
      )}

      {/* Show selected challenge group in challenge mode */}
      {challengeFilter && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter aktif:</span>
            {(() => {
              const group = groups.find(g => g.id === challengeFilter);
              return (
                <div className="px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border bg-yellowGold text-greenDark border-yellowGold">
                  <IconRenderer iconName={group?.icon} className="w-4 h-4" />
                  {group?.name || 'Challenge Group'}
                  <Target className="w-4 h-4 ml-1" />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Activities list */}
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
              ${challengeFilter 
                ? 'bg-yellowGold border border-yellowGold text-greenDark' 
                : 'bg-greenDark border border-greenDark text-whiteMint'
              } rounded-xl
              hover:bg-tealLight hover:border-tealLight hover:shadow-lg hover:-translate-y-1 transition-all duration-300
              flex justify-between items-center group
            `}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm md:text-base">
                  {activity.name}
                </span>
                {challengeFilter && <Target className="w-4 h-4" />}
              </div>
              {activity.description && (
                <span className="text-xs opacity-80 mt-1">{activity.description}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className={`font-bold text-sm md:text-base whitespace-nowrap ${
                challengeFilter ? 'text-greenDark' : 'text-yellowGold'
              }`}>
                +{activity.base_points} Poin
              </span>
              {challengeFilter && challengeMultiplier && challengeMultiplier > 1 && (
                <div className="flex items-center gap-1 ml-2">
                  <Lightning className="w-3 h-3" />
                  <span className="text-xs">(x{challengeMultiplier})</span>
                </div>
              )}
            </div>
          </button>
        ))}
        
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
