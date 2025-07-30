'use client';

import { useEffect, useState, useMemo } from 'react';
import { getProvinces } from '@/lib/get-provinces';

interface LocationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: string) => void;
}

export default function LocationPopup({ isOpen, onClose, onConfirm }: LocationPopupProps) {
  const [showProvinceSearch, setShowProvinceSearch] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('Mendeteksi...');
  const [searchTerm, setSearchTerm] = useState('');
  const [provinces, setProvinces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data provinsi dari database
  useEffect(() => {
    getProvinces().then((data) => {
      setProvinces(data.map((p: any) => p.province));
      setLoading(false);
    });
  }, []);

  // Geotagging: deteksi lokasi user
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode (contoh pakai Nominatim)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const json = await res.json();
        // Cocokkan nama provinsi dengan data dari DB
        const detected = provinces.find(p =>
          json.address?.state?.toLowerCase().includes(p.toLowerCase())
        );
        setCurrentLocation(detected || json.address?.state || 'Tidak Diketahui');
      });
    }
  }, [provinces]);

  const filteredProvinces = useMemo(
    () => provinces.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, provinces]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl relative animate-fadeIn">
        <h3 className="text-xl font-bold mb-3 text-green-700">Konfirmasi Lokasi</h3>
        <p className="mb-2 text-sm text-gray-600">Aktivitas Anda akan dicatat di lokasi:</p>
        <div className="w-full p-3 mb-4 bg-green-50 border border-green-200 rounded-lg text-center font-semibold text-green-800">
          {loading ? 'Memuat data...' : currentLocation}
        </div>
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setShowProvinceSearch(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Pilih Provinsi Lain
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Batal
            </button>
            <button
              onClick={() => onConfirm(currentLocation)}
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-semibold"
              disabled={loading || !currentLocation}
            >
              Konfirmasi
            </button>
          </div>
        </div>
        {/* Province Search Popup */}
        {showProvinceSearch && (
          <div className="absolute inset-0 bg-white rounded-xl p-6 flex flex-col shadow-xl animate-fadeIn">
            <h4 className="font-bold mb-3 text-green-700">Cari Provinsi</h4>
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
                <li
                  key={p}
                  onClick={() => {
                    setCurrentLocation(p);
                    setShowProvinceSearch(false);
                    setSearchTerm('');
                  }}
                  className="p-2 hover:bg-green-50 cursor-pointer rounded-md text-green-800"
                >
                  {p}
                </li>
              ))}
              {filteredProvinces.length === 0 && (
                <li className="p-2 text-gray-400">Provinsi tidak ditemukan.</li>
              )}
            </ul>
            <button
              onClick={() => setShowProvinceSearch(false)}
              className="mt-4 text-sm text-gray-600 self-center"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}