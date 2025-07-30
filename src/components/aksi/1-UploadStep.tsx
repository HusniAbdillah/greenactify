'use client';

import { useRef, useState } from 'react';
import { UploadCloud, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface UploadStepProps {
  onFileSelect: (file: File) => void;
}

export default function UploadStep({ onFileSelect }: UploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadStatus('idle');
      try {
        await new Promise(res => setTimeout(res, 1200));
        onFileSelect(file);
        setIsUploading(false);
        setUploadStatus('success');
      } catch {
        setIsUploading(false);
        setUploadStatus('error');
      }
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadStatus('idle');
      try {
        await new Promise(res => setTimeout(res, 1200));
        onFileSelect(file);
        setIsUploading(false);
        setUploadStatus('success');
      } catch {
        setIsUploading(false);
        setUploadStatus('error');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleBoxClick = () => !isUploading && fileInputRef.current?.click();

  return (
    <div className="flex min-h-[60vh] items-center justify-center w-full">
      <div
        onClick={handleBoxClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center
          w-full max-w-lg p-6 md:p-10 border-2 border-dashed rounded-xl
          bg-whiteMint
          text-center cursor-pointer transition-colors
          ${isDragging ? 'border-tealLight bg-mintPastel' : 'border-greenDark hover:bg-whiteGreen hover:border-tealLight'}
          ${isUploading ? 'cursor-not-allowed' : ''}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          disabled={isUploading}
        />

        <UploadCloud
          className={`
            w-16 h-16 mb-4 text-greenDark
            transition-all duration-300
            ${isDragging ? 'scale-110 text-tealLight' : ''}
            ${isUploading ? 'animate-pulse' : ''}
          `}
          strokeWidth={1.5}
        />

        {/* Status Upload */}
        {isUploading && (
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="animate-spin text-tealLight w-5 h-5" />
            <span className="text-tealLight text-sm">Mengunggah...</span>
          </div>
        )}
        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-greenDark w-5 h-5" />
            <span className="text-greenDark text-sm">Unggah berhasil!</span>
          </div>
        )}
        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-red w-5 h-5" />
            <span className="text-red text-sm">Unggah gagal!</span>
          </div>
        )}

        <p className="text-lg font-semibold text-greenDark">
          Seret & Lepas Foto
        </p>
        <p className="text-gray-500">atau</p>
        <button
          type="button"
          onClick={handleBoxClick}
          disabled={isUploading}
          className="mt-2 px-4 py-2 rounded-lg bg-mintPastel text-greenDark font-semibold hover:bg-tealLight disabled:bg-whiteGreen disabled:text-gray-400 disabled:cursor-not-allowed transition"
        >
          Pilih dari Perangkat
        </button>
      </div>
    </div>
  );
}