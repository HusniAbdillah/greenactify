'use client';
import { useState, useEffect } from 'react';
import { uploadGeneratedImage } from '@/lib/upload-generated-image';


interface ResultStepProps {
  imageData: {
    file: File;
    activity: {
      id: string;
      name: string;
      base_points: number;
      activity_category_group?: { group_id: string }[];
    };
    location: string;
    points: number;
    username?: string;
  };
  onFinish: () => void;
  onGeneratedImageReady?: (url: string) => void;
}

export default function ResultStep({ imageData, onFinish, onGeneratedImageReady }: ResultStepProps) {
  const imageUrl = URL.createObjectURL(imageData.file);

  // Generate canvas image with overlay text
  const [generatedUrl, setGeneratedUrl] = useState<string>(imageUrl);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      // Card overlay
      ctx.fillStyle = 'rgba(16,185,129,0.7)';
      ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(`Aktivitas: ${imageData.activity.name}`, 20, canvas.height - 80);
      ctx.font = '18px sans-serif';
      ctx.fillText(`Lokasi: ${imageData.location}`, 20, canvas.height - 50);
      ctx.fillText(`Poin: +${imageData.points}`, 20, canvas.height - 20);
      if (imageData.username) {
        ctx.font = 'italic 16px sans-serif';
        ctx.fillText(`Oleh: ${imageData.username}`, canvas.width - 180, canvas.height - 20);
      }
      const generatedDataUrl = canvas.toDataURL();
      setGeneratedUrl(generatedDataUrl);

      // Upload ke storage di background
      if (onGeneratedImageReady) {
        const path = `generated-uploads/${Date.now()}-${imageData.activity.id}.png`;
        try {
          const url = await uploadGeneratedImage(generatedDataUrl, path);
          onGeneratedImageReady(url);
        } catch (err) {
          // Optional: handle error upload
        }
      }
    };
  }, [imageUrl, imageData, onGeneratedImageReady]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedUrl;
    link.download = 'aktivitas-hijau.png';
    link.click();
  };

  const handleShare = async () => {
    // Cek dukungan share file
    if (navigator.canShare && navigator.canShare({ files: [] })) {
      // Convert dataURL ke Blob
      const res = await fetch(generatedUrl);
      const blob = await res.blob();
      const file = new File([blob], 'aktivitas-hijau.png', { type: 'image/png' });

      await navigator.share({
        title: 'Aktivitas Hijau',
        text: `Saya baru saja melakukan aktivitas hijau: ${imageData.activity.name}`,
        files: [file],
      });
    } else {
      alert('Fitur share gambar tidak didukung di browser ini. Silakan unduh dan bagikan manual.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Aksi Berhasil Dicatat!</h2>
      <div className="w-full max-w-sm border rounded-lg shadow-lg bg-white p-4 mb-6">
        <img src={generatedUrl} alt="Aktivitas" className="w-full h-48 object-cover rounded-md" />
        <div className="mt-4">
          <p className="text-sm text-gray-500">Aktivitas:</p>
          <p className="font-semibold text-lg">{imageData.activity.name}</p>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Lokasi:</p>
          <p className="font-semibold">{imageData.location}</p>
        </div>
        <div className="mt-3 pt-3 border-t text-center">
          <p className="text-lg font-bold text-yellow-500">+{imageData.points} Poin!</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button onClick={handleDownload} className="w-full px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">Unduh</button>
        <button onClick={handleShare} className="w-full px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-800">Bagikan</button>
        <button onClick={onFinish} className="w-full px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600">Selesai</button>
      </div>
    </div>
  );
}