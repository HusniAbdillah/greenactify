'use client';

import { useRef } from 'react';

interface UploadStepProps {
  onFileSelect: (file: File) => void;
}

export default function UploadStep({ onFileSelect }: UploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        onClick={handleBoxClick}
        className="w-full max-w-lg p-10 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50 hover:border-green-500 transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <p className="text-gray-500">Klik di sini untuk memilih foto</p>
        <p className="text-sm text-gray-400 mt-2">atau seret dan lepas gambar</p>
      </div>
      <p className="my-4 text-gray-600 font-semibold">Atau Pilih Kategori</p>
       {/* Di sini bisa ditambahkan tombol-tombol kategori jika perlu */}
       <div className="flex gap-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Menanam Pohon</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Hemat Air</button>
       </div>
    </div>
  );
}