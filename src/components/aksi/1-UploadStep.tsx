"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface UploadStepProps {
  onFileSelect: (file: File) => void;
}

export default function UploadStep({ onFileSelect }: UploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const resetStatus = () => {
    setIsUploading(false);
    setUploadStatus("idle");
  };

  const processFile = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diizinkan!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    try {
      // Simulasi proses upload di parent
      await onFileSelect(file); 
      setUploadStatus("success");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
      // Reset status setelah beberapa saat untuk memberi feedback ke user
      setTimeout(resetStatus, 2000);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isUploading) setIsDragging(true);
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleBoxClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div
        onClick={handleBoxClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center
          w-full max-w-lg p-6 md:p-10 border-2 border-dashed rounded-xl
          bg-whiteMint text-center transition-colors
          ${
            isDragging
              ? "border-tealLight bg-mintPastel"
              : "border-greenDark hover:bg-whiteGreen hover:border-tealLight"
          }
          ${isUploading ? "cursor-not-allowed" : "cursor-pointer"}
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
            ${isDragging ? "scale-110 text-tealLight" : ""}
          `}
          strokeWidth={1.5}
        />

        {/* Status Upload */}
        <div className="flex h-6 items-center justify-center mb-2">
          {isUploading && (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-tealLight w-5 h-5" />
              <span className="text-tealLight text-sm">Mengunggah...</span>
            </div>
          )}
          {uploadStatus === "success" && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-greenDark w-5 h-5" />
              <span className="text-greenDark text-sm">Unggah berhasil!</span>
            </div>
          )}
          {uploadStatus === "error" && (
            <div className="flex items-center gap-2">
              <XCircle className="text-red-500 w-5 h-5" />
              <span className="text-red-500 text-sm">Unggah gagal!</span>
            </div>
          )}
        </div>

        <p className="text-lg font-semibold text-greenDark">
          Seret & Lepas Foto
        </p>
        <p className="text-gray-500">atau</p>

        {/* [FIX] Tambahkan e.stopPropagation() untuk mencegah event bubbling */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBoxClick();
          }}
          disabled={isUploading}
          className="mt-2 px-4 py-2 rounded-lg bg-mintPastel text-greenDark font-semibold hover:bg-tealLight disabled:bg-whiteGreen disabled:text-gray-400 disabled:cursor-not-allowed transition"
        >
          Pilih dari Perangkat
        </button>
      </div>
    </div>
  );
}