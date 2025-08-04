'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useProvinces } from '@/hooks/useSWRData'; // Import SWR hook
import { MapPin, Search, Loader2, CheckCircle, Edit3, ArrowLeft } from 'lucide-react';

interface Province {
  id: string;
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type LocationStepProps = {
  onConfirm: (location: string, latitude?: number, longitude?: number) => void;
  onBack: () => void;
};

export default function LocationStep({ onConfirm, onBack }: LocationStepProps) {
  const [view, setView] = useState<'confirm' | 'search'>('confirm');
  const [detectedLocation, setDetectedLocation] = useState<string>('Mendeteksi lokasi...');
  const [detectedLatitude, setDetectedLatitude] = useState<number | null>(null);
  const [detectedLongitude, setDetectedLongitude] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [provinces, setProvinces] = useState<Province[]>([]);

  const { data: provincesData, isLoading: provincesLoading, error: provincesError } = useProvinces();
  const filteredProvinces = useMemo(
    () => {
      return provinces.filter(province => 
        province.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [provinces, searchTerm]
  );

  const handleReverseGeocode = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      const json = await res.json();
      return json.address?.state || 'Lokasi tidak diketahui';
    } catch (error) {
      console.error("Gagal melakukan reverse geocoding:", error);
      return 'Gagal mendeteksi';
    }
  }, []);


  useEffect(() => {

    if (provincesLoading || provincesError || provinces.length === 0) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (!isMounted) return;
          const { latitude, longitude } = pos.coords;
          setDetectedLatitude(latitude);
          setDetectedLongitude(longitude);
          
          const location = await handleReverseGeocode(latitude, longitude);
          setDetectedLocation(location);
          setIsLoading(false);
        },
        () => {
          if (!isMounted) return;
          setDetectedLocation('Izin lokasi ditolak');
          setIsLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setDetectedLocation('Geolocation tidak didukung');
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [provinces.length, provincesLoading, provincesError, handleReverseGeocode]);

  useEffect(() => {
    if (
      detectedLocation.includes("Gagal") ||
      detectedLocation.includes("Izin lokasi ditolak") ||
      detectedLocation.includes("Geolocation tidak didukung")
    ) {
      setView("search");
    }
  }, [detectedLocation]);

  const handleSelectProvince = useCallback((province: string) => {
    setDetectedLocation(province);
    setView('confirm');
  }, []);

  if (provincesLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-fadeIn">
        <div className="text-center py-8">
          <Loader2 className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-500">Memuat data provinsi...</p>
        </div>
      </div>
    );
  }

  if (provincesError) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-fadeIn">
        <div className="text-center py-8">
          <p className="text-red-500">Gagal memuat data provinsi</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (view === "search") {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-fadeIn">
        <div className="flex justify-center w-full mb-6">
          <button
            onClick={() => setView("confirm")}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-whiteMint border border-tealLight text-greenDark font-semibold shadow hover:bg-mintPastel transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Konfirmasi</span>
          </button>
        </div>
        <div className="relative w-full mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama provinsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm md:py-3 md:text-base md:pl-12 border border-gray-200 rounded-full bg-whiteMint focus:ring-2 focus:ring-tealLight focus:border-tealLight outline-none transition"
            autoFocus
          />
        </div>
        <div className="w-full space-y-3">
          {filteredProvinces.map((province: Province) => (
            <button
              key={province.id}
              onClick={() => handleSelectProvince(province.name)}
              className={`w-full p-3 rounded-lg border transition-all duration-200
                ${detectedLocation === province.name 
                  ? 'border-tealLight bg-tealLight/10 text-tealLight' 
                  : 'border-gray-200 hover:border-tealLight/50'
                }`}
            >
              {province.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="bg-whiteMint p-8 rounded-2xl shadow-md border border-gray-200 w-full max-w-md flex flex-col items-center">
        <MapPin size={48} className="text-tealLight mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-greenDark mb-2">Lokasi Terdeteksi</h3>
        
        <div className="w-full p-4 mb-6 bg-white border border-gray-200 rounded-lg text-center font-semibold text-greenDark text-lg min-h-[60px] flex items-center justify-center">
          {isLoading ? <Loader2 className="animate-spin" /> : detectedLocation}
        </div>
        
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => onConfirm(detectedLocation, detectedLatitude ?? undefined, detectedLongitude ?? undefined)}
            disabled={isLoading || detectedLocation.includes('Mendeteksi') || detectedLocation.includes('Gagal')}
            className="w-full flex items-center justify-center gap-2 bg-greenDark text-whiteMint font-bold py-3 px-4 rounded-full hover:bg-tealLight transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <CheckCircle size={20} />
            Konfirmasi Lokasi Ini
          </button>
          <button
            onClick={() => setView('search')}
            className="w-full flex items-center justify-center gap-2 text-greenDark font-semibold py-3 px-4 rounded-full hover:bg-mintPastel transition-colors"
          >
            <Edit3 size={18} />
            Ubah Lokasi
          </button>
        </div>
      </div>
    </div>
  );
}
