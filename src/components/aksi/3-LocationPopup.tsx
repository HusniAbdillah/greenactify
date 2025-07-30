'use client';

import { useState, useMemo } from 'react';

// Mock data provinsi di Indonesia
const provinces = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung', 'Kepulauan Riau',
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten',
  'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat',
  'Maluku', 'Maluku Utara', 'Papua Barat', 'Papua'
];

interface LocationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: string) => void;
}

export default function LocationPopup({ isOpen, onClose, onConfirm }: LocationPopupProps) {
  const [showProvinceSearch, setShowProvinceSearch] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Jawa Barat'); // Lokasi default/terdeteksi
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProvinces = useMemo(() =>
    provinces.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );
  
  if (!isOpen) return null;

  const handleSelectProvince = (province: string) => {
    setCurrentLocation(province);
    setShowProvinceSearch(false);
    setSearchTerm('');
  };
  
  const handleConfirm = () => {
    onConfirm(currentLocation);
  };

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Main Popup Content */}
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl relative">
        <h3 className="text-lg font-bold mb-4">Konfirmasi Lokasi</h3>
        <p className="mb-2 text-sm">Aktivitas Anda akan dicatat di lokasi:</p>
        <div className="w-full p-3 mb-4 bg-gray-100 border rounded-md text-center font-medium">
          {currentLocation}
        </div>
        
        <div className="flex justify-between items-center">
          <button onClick={() => setShowProvinceSearch(true)} className="text-sm text-blue-600 hover:underline">
            Ubah Lokasi
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Batal</button>
            <button onClick={handleConfirm} className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600">Konfirmasi</button>
          </div>
        </div>

        {/* --- Province Search Popup (Pop-up di dalam Pop-up) --- */}
        {showProvinceSearch && (
          <div className="absolute inset-0 bg-white rounded-lg p-6 flex flex-col">
            <h4 className="font-bold mb-3">Cari Provinsi</h4>
            <input
              type="text"
              placeholder="Ketik nama provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
              autoFocus
            />
            <ul className="flex-1 overflow-y-auto">
              {filteredProvinces.map(p => (
                <li key={p} onClick={() => handleSelectProvince(p)} className="p-2 hover:bg-gray-100 cursor-pointer rounded-md">
                  {p}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowProvinceSearch(false)} className="mt-4 text-sm text-gray-600 self-center">Tutup</button>
          </div>
        )}
      </div>
    </div>
  );
}