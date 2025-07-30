'use client';

import { useEffect, useState } from 'react';
import { getActivityCategoriesWithGroups, getActivityGroups } from '@/lib/get-activities';

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
  description?: string;
}

interface SelectActivityStepProps {
  onActivitySelect: (activity: ActivityCategory) => void;
  onBack: () => void;
}

export default function SelectActivityStep({ onActivitySelect, onBack }: SelectActivityStepProps) {
  const [groups, setGroups] = useState<ActivityGroup[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getActivityGroups().then((data) => setGroups(data.slice(0, 8)));
    getActivityCategoriesWithGroups().then((data) => setCategories(data));
  }, []);

  // Filter aktivitas berdasarkan grup dan search
  const filteredCategories = categories.filter((cat) => {
    if (selectedGroup === 'all') {
      return cat.name.toLowerCase().includes(search.toLowerCase());
    }
    // Cek relasi ke grup
    const hasGroup = cat.activity_category_group?.some((rel) => rel.group_id === selectedGroup);
    const matchSearch = cat.name.toLowerCase().includes(search.toLowerCase());
    return hasGroup && matchSearch;
  });

  return (
    <div className="flex flex-col items-center w-full">
      <button
        type="button"
        onClick={onBack}
        className="self-start mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
      >
        &larr; Kembali
      </button>
      <h2 className="text-xl font-semibold mb-2">Pilih Aktivitas</h2>
      <input
        type="text"
        placeholder="Cari aktivitas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md mb-3 px-3 py-2 border rounded-lg"
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded-full border ${selectedGroup === 'all' ? 'bg-greenDark text-whiteMint' : 'bg-whiteMint text-greenDark'}`}
          onClick={() => setSelectedGroup('all')}
        >
          Semua
        </button>
        {groups.map((group) => (
          <button
            key={group.id}
            className={`px-3 py-1 rounded-full border ${selectedGroup === group.id ? 'bg-greenDark text-whiteMint' : 'bg-whiteMint text-greenDark'}`}
            onClick={() => setSelectedGroup(group.id)}
          >
            {group.name}
          </button>
        ))}
      </div>
      <div className="w-full max-w-md">
        {filteredCategories.length === 0 && (
          <p className="text-center text-gray-400">Tidak ada aktivitas ditemukan.</p>
        )}
        {filteredCategories.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onActivitySelect(activity)}
            className="w-full text-left p-3 mb-2 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all flex justify-between items-center"
          >
            <span>{activity.name}</span>
            <span className="font-bold text-greenDark">{activity.base_points} poin</span>
          </button>
        ))}
      </div>
    </div>
  );
}