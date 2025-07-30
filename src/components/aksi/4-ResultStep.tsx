'use client';
import { useState, useEffect } from 'react';
import { uploadGeneratedImage } from '@/lib/upload-generated-image';

// Props Interface (tidak diubah)
interface ResultStepProps {
  imageData: {
    file: File;
    activity: {
      id: string;
      name: string;
      base_points: number;
    };
    location: string;
    points: number;
    username?: string;
  };
  onFinish: () => void;
  onGeneratedImageReady?: (url: string) => void;
}

// Komponen Ikon sederhana untuk digunakan di dalam JSX
const IconPin = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

// Komponen Utama
export default function ResultStep({ imageData, onFinish, onGeneratedImageReady }: ResultStepProps) {
  // State untuk menyimpan URL gambar yang di-generate oleh canvas
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  
  // Mendapatkan tanggal dan waktu saat ini untuk ditampilkan
  const now = new Date();
  const formattedDate = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' WIB';

  // useEffect untuk menggambar canvas saat komponen dimuat
  useEffect(() => {
    const originalImageUrl = URL.createObjectURL(imageData.file);
    const userImage = new window.Image();
    userImage.src = originalImageUrl;
    userImage.crossOrigin = "anonymous"; // Penting jika gambar dari sumber lain

    userImage.onload = async () => {
      // Setup canvas dengan dimensi kartu
      const canvas = document.createElement('canvas');
      const cardWidth = 800;
      const cardHeight = 1200;
      canvas.width = cardWidth;
      canvas.height = cardHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Gambar background utama kartu
      ctx.fillStyle = '#0C3B2E'; // bg-greenDark
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // 2. Gambar header (Logo & tagline)
      ctx.fillStyle = '#D2E8BB'; // bg-mintPastel
      ctx.font = 'bold 72px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GrenActify', cardWidth / 2, 90);
      ctx.font = '24px sans-serif';
      ctx.fillText('Aksi Hijau Hari Ini, Nafas Segar Esok Hari.', cardWidth / 2, 130);
      
      // 3. Gambar info pengguna
      ctx.fillStyle = '#F1FFF3'; // bg-whiteMint
      ctx.textAlign = 'left';
      ctx.font = '32px sans-serif';
      ctx.fillText(`@${imageData.username || 'User'}`, 50, 200);

      ctx.textAlign = 'right';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#FFBA00'; // bg-yellowGold
      ctx.fillText(`${imageData.points * 100 + 4570} Poin`, cardWidth - 50, 200);

      // 4. Gambar foto utama pengguna
      const imageY = 250;
      const imageHeight = 550;
      // Menjaga aspect ratio gambar asli
      const scale = Math.max(cardWidth / userImage.width, imageHeight / userImage.height);
      const imgX = (cardWidth - userImage.width * scale) / 2;
      const imgY = imageY + (imageHeight - userImage.height * scale) / 2;
      ctx.drawImage(userImage, imgX, imgY, userImage.width * scale, userImage.height * scale);

      // 5. Gambar footer
      const footerY = 850;
      ctx.textAlign = 'left';
      
      // Aktivitas
      ctx.fillStyle = '#F1FFF3'; // bg-whiteMint
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText(imageData.activity.name, 50, footerY + 60);

      // Poin
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFBA00'; // bg-yellowGold
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText(`+${imageData.points} Poin`, cardWidth - 50, footerY + 60);

      // Lokasi & Waktu
      const footerMetaY = footerY + 150;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#DFF7E2'; // bg-whiteGreen
      ctx.font = '32px sans-serif';
      ctx.fillText(`📍 ${imageData.location}`, 50, footerMetaY);
      
      ctx.textAlign = 'right';
      ctx.fillText(`🕒 ${formattedDate}, ${formattedTime}`, cardWidth - 50, footerMetaY);

      // Selesai, set URL dan upload ke storage
      const generatedDataUrl = canvas.toDataURL('image/png');
      setGeneratedUrl(generatedDataUrl);

      if (onGeneratedImageReady) {
        const path = `generated-cards/${Date.now()}-${imageData.activity.id}.png`;
        try {
          const url = await uploadGeneratedImage(generatedDataUrl, path);
          onGeneratedImageReady(url);
        } catch (err) {
          console.error("Gagal mengunggah gambar hasil generate:", err);
        }
      }
    };
  }, [imageData, onGeneratedImageReady, formattedDate, formattedTime]);


  // Handler untuk download dan share (tidak diubah)
  const handleDownload = () => {
    if (!generatedUrl) return;
    const link = document.createElement('a');
    link.href = generatedUrl;
    link.download = 'grenactify-card.png';
    link.click();
  };

  const handleShare = async () => {
    if (!generatedUrl) return;
    try {
      const res = await fetch(generatedUrl);
      const blob = await res.blob();
      const file = new File([blob], 'grenactify-card.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Aksi Hijauku!',
          text: `Saya baru saja melakukan ${imageData.activity.name} bersama GrenActify!`,
          files: [file],
        });
      } else {
        alert('Fitur share tidak didukung. Silakan unduh gambar untuk dibagikan.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Gagal membagikan gambar.');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4">
      <h2 className="text-3xl font-bold text-oliveSoft mb-4 text-center">Aksi Berhasil Dicatat!</h2>
      <p className="text-center text-gray-600 mb-6">Bagikan kartu ini untuk menginspirasi teman-temanmu.</p>
      
      {/* Tampilan Kartu Preview */}
      {generatedUrl ? (
        <img src={generatedUrl} alt="Generated Activity Card" className="w-full rounded-2xl shadow-xl border-4 border-white" />
      ) : (
        <div className="w-full h-96 bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
          <p className="text-gray-500">Membuat kartu...</p>
        </div>
      )}

      {/* Tombol Aksi */}
      <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
        <button onClick={handleShare} className="w-full px-6 py-3 rounded-xl bg-tealLight text-white font-bold text-lg hover:opacity-90 transition-opacity">Bagikan</button>
        <button onClick={handleDownload} className="w-full px-6 py-3 rounded-xl bg-oliveSoft text-white font-bold text-lg hover:opacity-90 transition-opacity">Unduh</button>
      </div>
       <button onClick={onFinish} className="w-full mt-4 px-6 py-3 rounded-xl bg-yellowGold text-greenDark font-bold text-lg hover:opacity-90 transition-opacity">Selesai</button>
    </div>
  );
}