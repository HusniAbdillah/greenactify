'use client';

interface ResultStepProps {
  imageData: {
    file: File;
    activity: string;
    location: string;
    points: number;
  };
  onFinish: () => void;
}

export default function ResultStep({ imageData, onFinish }: ResultStepProps) {
  const imageUrl = URL.createObjectURL(imageData.file);

  const handleDownload = () => alert('Logika untuk mengunduh gambar...');
  const handleShare = () => alert('Logika untuk membagikan gambar...');
  
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Aksi Berhasil Dicatat!</h2>
      
      {/* Card Hasil Generate */}
      <div className="w-full max-w-sm border rounded-lg shadow-lg bg-white p-4 mb-6">
        <img src={imageUrl} alt="Aktivitas" className="w-full h-48 object-cover rounded-md" />
        <div className="mt-4">
          <p className="text-sm text-gray-500">Aktivitas:</p>
          <p className="font-semibold text-lg">{imageData.activity}</p>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Lokasi:</p>
          <p className="font-semibold">{imageData.location}</p>
        </div>
        <div className="mt-3 pt-3 border-t text-center">
          <p className="text-lg font-bold text-yellow-500">+{imageData.points} Poin!</p>
        </div>
      </div>
      
      {/* Tombol Aksi */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button onClick={handleDownload} className="w-full px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">Unduh</button>
        <button onClick={handleShare} className="w-full px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-800">Bagikan</button>
        <button onClick={onFinish} className="w-full px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600">Selesai</button>
      </div>
    </div>
  );
}