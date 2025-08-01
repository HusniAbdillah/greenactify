"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface UploadStepProps {
  onFileSelect: (file: File) => void;
  cooldownRemaining: number;
}

export default function UploadStep({ onFileSelect, cooldownRemaining }: UploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const isOnCooldown = cooldownRemaining > 0;

  const resetStatus = () => {
    setIsUploading(false);
    setUploadStatus("idle");
  };

  const processFile = async (file: File | undefined) => {
    if (!file) return;

    if (isOnCooldown) {
      alert(`Anda harus menunggu ${cooldownRemaining} detik sebelum mengunggah gambar lagi.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diizinkan!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    try {
      await onFileSelect(file); 
      setUploadStatus("success");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
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
    if (!isUploading && !isOnCooldown) setIsDragging(true);
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleBoxClick = () => {
    if (!isUploading && !isOnCooldown) {
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
            isDragging && !isOnCooldown
              ? "border-tealLight bg-mintPastel"
              : isOnCooldown
              ? "border-gray-300 bg-gray-50"
              : "border-greenDark hover:bg-whiteGreen hover:border-tealLight"
          }
          ${isUploading || isOnCooldown ? "cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          disabled={isUploading || isOnCooldown}
        />

        <UploadCloud
          className={`
            w-16 h-16 mb-4 transition-all duration-300
            ${
              isOnCooldown 
                ? "text-gray-400" 
                : isDragging 
                ? "scale-110 text-tealLight" 
                : "text-greenDark"
            }
          `}
          strokeWidth={1.5}
        />

        <div className="flex h-6 items-center justify-center mb-2">
          {isOnCooldown && (
            <div className="flex items-center gap-2">
              <Clock className="text-orange-500 w-5 h-5" />
              <span className="text-orange-500 text-sm">
                Kamu bisa unggah aksi baru dalam {cooldownRemaining} detik!
              </span>
            </div>
          )}
          {!isOnCooldown && isUploading && (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-tealLight w-5 h-5" />
              <span className="text-tealLight text-sm">Mengunggah...</span>
            </div>
          )}
          {!isOnCooldown && uploadStatus === "success" && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-greenDark w-5 h-5" />
              <span className="text-greenDark text-sm">Unggah berhasil!</span>
            </div>
          )}
          {!isOnCooldown && uploadStatus === "error" && (
            <div className="flex items-center gap-2">
              <XCircle className="text-red-500 w-5 h-5" />
              <span className="text-red-500 text-sm">Unggah gagal!</span>
            </div>
          )}
        </div>

        <p className={`text-lg font-semibold ${isOnCooldown ? "text-gray-400" : "text-greenDark"}`}>
          {isOnCooldown ? "Mohon Tunggu" : "Seret & Lepas Foto"}
        </p>
        <p className="text-gray-500">
          {isOnCooldown ? `` : "atau"}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBoxClick();
          }}
          disabled={isUploading || isOnCooldown}
          className={`
            mt-2 px-4 py-2 rounded-lg font-semibold transition
            ${
              isOnCooldown 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : isUploading
                ? "bg-whiteGreen text-gray-400 cursor-not-allowed"
                : "bg-mintPastel text-greenDark hover:bg-tealLight"
            }
          `}
        >
          {isOnCooldown 
            ? `Tunggu ${cooldownRemaining}s` 
            : "Pilih dari Perangkat"
          }
        </button>
      </div>
    </div>
  );
}