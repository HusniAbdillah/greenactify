'use client';

import { useEffect, useState, useMemo } from 'react';
import { getProvinces } from '@/lib/get-provinces';
import { MapPin, Search, Loader2, CheckCircle, Edit3, ArrowLeft } from 'lucide-react';

// Props disederhanakan karena ini bukan lagi pop-up
export type LocationStepProps = {
  onConfirm: (location: string) => void;
  onBack: () => void; // Menambahkan onBack untuk kembali ke step sebelumnya
};

export default function LocationStep({ onConfirm, onBack }: LocationStepProps) {
  // State untuk mengontrol tampilan: 'confirm' atau 'search'
  const [view, setView] = useState<'confirm' | 'search'>('confirm');
  
  const [detectedLocation, setDetectedLocation] = useState<string>('Mendeteksi lokasi...');
  const [searchTerm, setSearchTerm] = useState('');
  const [provinces, setProvinces] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil daftar provinsi dari database saat komponen dimuat
  useEffect(() => {
    getProvinces().then((data) => {
      if (data) {
        setProvinces(data.map((p: any) => p.province));
      }
    });
  }, []);

  // 2. Deteksi lokasi pengguna menggunakan Geotagging
  useEffect(() => {
    // Hanya jalankan jika daftar provinsi sudah ada
    if (provinces.length === 0) return;

    let isMounted = true;
    setIsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (!isMounted) return;
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
            const json = await res.json();
            const detectedState = json.address?.state || 'Lokasi tidak diketahui';
            setDetectedLocation(detectedState);
          } catch (error) {
            console.error("Gagal melakukan reverse geocoding:", error);
            setDetectedLocation('Gagal mendeteksi');
          } finally {
            setIsLoading(false);
          }
        },
        () => { // Error callback
          if (!isMounted) return;
          setDetectedLocation('Izin lokasi ditolak');
          setIsLoading(false);
        }
      );
    } else {
      setDetectedLocation('Geolocation tidak didukung');
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [provinces]);

  // 3. Filter provinsi berdasarkan pencarian
  const filteredProvinces = useMemo(
    () => provinces.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, provinces]
  );

  // Handler untuk memilih provinsi dari daftar
  const handleSelectProvince = (province: string) => {
    setDetectedLocation(province);
    setView('confirm'); // Kembali ke tampilan konfirmasi
  };

  // Tampilan saat mencari provinsi
  if (view === 'search') {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col animate-fadeIn">
        <button
          onClick={() => setView('confirm')}
          className="self-start mb-6 flex items-center gap-2 text-greenDark font-semibold hover:text-tealLight transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Konfirmasi</span>
        </button>
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
          {filteredProvinces.map(p => (
            <button
              key={p}
              onClick={() => handleSelectProvince(p)}
              className="w-full text-left p-3 bg-whiteMint border border-gray-200 rounded-xl hover:bg-mintPastel hover:border-tealLight transition flex items-center gap-3"
            >
              <MapPin className="text-gray-400" size={20}/>
              <span>{p}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Tampilan default untuk konfirmasi
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center animate-fadeIn">
      <div className="bg-whiteMint p-8 rounded-2xl shadow-md border border-gray-200 w-full">
        <MapPin size={48} className="text-tealLight mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-greenDark mb-2">Lokasi Terdeteksi</h3>
        
        <div className="w-full p-4 mb-6 bg-white border border-gray-200 rounded-lg text-center font-semibold text-greenDark text-lg min-h-[60px] flex items-center justify-center">
          {isLoading ? <Loader2 className="animate-spin" /> : detectedLocation}
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onConfirm(detectedLocation)}
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
