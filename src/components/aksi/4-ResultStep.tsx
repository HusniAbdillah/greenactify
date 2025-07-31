"use client";

import { useState, useEffect, useRef } from "react";
import { uploadGeneratedImage } from "@/lib/upload-generated-image";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Share2, Download, CheckCircle2, LoaderCircle } from "lucide-react";

// Interface (tidak diubah)
interface ResultStepProps {
  imageData: {
    file: File;
    activity: { id: string; name: string; base_points: number };
    location: string;
    points: number;
    username?: string;
  };
  onFinish: () => void;
  onGeneratedImageReady?: (url: string) => void;
}

// Komponen Utama yang Telah Disempurnakan
export default function ResultStep({
  imageData,
  onFinish,
  onGeneratedImageReady,
}: ResultStepProps) {
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileId] = useState(() => uuidv4());
  const uploadRef = useRef(false);
  const router = useRouter();

  const now = new Date();
  const formattedDate = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // --- LOGIKA PEMBUATAN GAMBAR & UPLOAD (TIDAK DIUBAH) ---
  useEffect(() => {
    if (uploadRef.current) return;
    const originalImageUrl = URL.createObjectURL(imageData.file);
    const userImage = new window.Image();
    userImage.src = originalImageUrl;
    userImage.crossOrigin = "anonymous";
    userImage.onload = async () => {
      const canvas = document.createElement("canvas");
      const cardWidth = 1080;
      const cardHeight = 1920;
      canvas.width = cardWidth;
      canvas.height = cardHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#0C3B2E";
      ctx.fillRect(0, 0, cardWidth, cardHeight);
      ctx.fillStyle = "#D2E8BB";
      ctx.font = "bold 90px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("GrenActify", cardWidth / 2, 180);
      ctx.fillStyle = "#F1FFF3";
      ctx.font = "48px sans-serif";
      ctx.fillText(`@${imageData.username || "User"}`, cardWidth / 2, 260);
      const imageY = 320;
      const imageHeight = 960;
      const imageAspectRatio = userImage.width / userImage.height;
      const canvasAspectRatio = cardWidth / imageHeight;
      let drawWidth = cardWidth;
      let drawHeight = imageHeight;
      let imgX = 0;
      let imgY = imageY;
      if (imageAspectRatio > canvasAspectRatio) {
        drawHeight = cardWidth / imageAspectRatio;
        imgY += (imageHeight - drawHeight) / 2;
      } else {
        drawWidth = imageHeight * imageAspectRatio;
        imgX = (cardWidth - drawWidth) / 2;
      }
      ctx.drawImage(userImage, imgX, imgY, drawWidth, drawHeight);
      const bottomAreaY = cardHeight - 450;
      ctx.textAlign = "left";
      ctx.fillStyle = "#F1FFF3";
      ctx.font = "bold 92px sans-serif";
      ctx.fillText(imageData.activity.name, 80, bottomAreaY + 120);
      ctx.textAlign = "right";
      ctx.fillStyle = "#FFBA00";
      ctx.fillText(`+${imageData.points}`, cardWidth - 80, bottomAreaY + 120);
      const detailsY = bottomAreaY + 280;
      ctx.textAlign = "center";
      ctx.fillStyle = "#DFF7E2";
      ctx.font = "42px sans-serif";
      const detailsText = `${imageData.location} • ${formattedDate}, ${formattedTime}`;
      ctx.fillText(detailsText, cardWidth / 2, detailsY);
      const generatedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setGeneratedUrl(generatedDataUrl);
      if (onGeneratedImageReady && generatedDataUrl && !hasUploaded) {
        setIsUploading(true);
        uploadRef.current = true;
        const path = `generated-images/${fileId}-${imageData.activity.id}.png`;
        try {
          const url = await uploadGeneratedImage(generatedDataUrl, path);
          setHasUploaded(true);
          onGeneratedImageReady(url);
        } catch (err: any) {
          if (err?.message?.includes("already exists")) {
            setHasUploaded(true);
          } else {
            setHasUploaded(false);
            uploadRef.current = false;
          }
        } finally {
          setIsUploading(false);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  // --- FUNGSI HANDLER (TIDAK DIUBAH) ---
  const handleDownload = () => {
    if (!generatedUrl) return;
    const link = document.createElement("a");
    link.href = generatedUrl;
    link.download = "grenactify-card.png";
    link.click();
  };

  const handleShare = async () => {
    if (!generatedUrl) return;
    try {
      const res = await fetch(generatedUrl);
      const blob = await res.blob();
      const file = new File([blob], "grenactify-card.png", {
        type: "image/png",
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Aksi Hijauku!",
          text: `Saya baru saja melakukan ${imageData.activity.name} bersama GrenActify!`,
          files: [file],
        });
      } else {
        alert(
          "Fitur share tidak didukung. Silakan unduh gambar untuk dibagikan."
        );
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Gagal membagikan gambar.");
    }
  };

  const handleFinish = () => {
    onFinish();
    router.push("/");
  };

  // --- JSX / Tampilan Baru yang Responsif ---
  return (
    // Ganti dari div pembungkus utama ini
    <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto py-4 md:items-center md:gap-2 lg:gap-8">
      {/* Header Khusus Mobile */}
      <div className="w-full md:hidden mb-3 pb-1 text-center">
        <h2 className="text-xl font-bold text-greenDark">
          Satu Aksi, Sejuta Inspirasi!
        </h2>
        <p className="text-black/90 mt-1">
          Bagikan aksimu dan tebarkan semangat hijau ke seluruh dunia.
        </p>
      </div>

      {/* Kolom Kiri: Preview Gambar (Tidak Berubah) */}
      <div className="w-full md:w-5/12 flex-shrink-0">
        <div className="w-full max-w-xs mx-auto shadow-2xl rounded-2xl overflow-hidden aspect-[9/16] bg-whiteGreen">
          {generatedUrl ? (
            <Image
              src={generatedUrl}
              alt="Hasil Kartu Aksi Lingkungan"
              width={1080}
              height={1920}
              className="w-full h-full object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full animate-pulse flex items-center justify-center bg-greenDark/10">
              <p className="text-oliveSoft">Membuat kartu...</p>
            </div>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Judul & Tombol Aksi (Diperbarui) */}
      <div className="w-full md:w-7/12 flex flex-col justify-center items-center mt-8 md:mt-0">
        {/* Judul & Subjudul untuk Desktop */}
        <div className="hidden md:block text-center mb-8">
          <h2 className="text-4xl font-bold text-greenDark leading-tight">
            Satu Aksi, <br /> Sejuta Inspirasi!
          </h2>
          <p className="text-oliveSoft mt-2 max-w-md">
            Bagikan aksimu dan tebarkan semangat hijau ke seluruh dunia.
          </p>
        </div>

        {/* --- Tombol Aksi (Tampilan Desktop) --- */}
        <div className="hidden md:flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl bg-tealLight text-whiteMint font-bold text-lg hover:bg-tealLight/90 transition-all shadow-md"
          >
            <Share2 size={20} />
            <span>Bagikan</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl bg-oliveSoft text-whiteMint font-bold text-lg hover:bg-oliveSoft/90 transition-all shadow-md"
          >
            <Download size={20} />
            <span>Unduh Gambar</span>
          </button>
          <button
            onClick={handleFinish}
            disabled={!generatedUrl || !hasUploaded || isUploading}
            className="flex items-center justify-center gap-3 w-full mt-2 px-6 py-4 rounded-xl bg-yellowGold text-greenDark font-bold text-lg hover:bg-yellowGold/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <LoaderCircle size={24} className="animate-spin" />
            ) : (
              <CheckCircle2 size={24} />
            )}
            <span>{isUploading ? "Mengunggah..." : "Selesai"}</span>
          </button>
        </div>

        {/* --- Tombol Aksi (Tampilan Mobile) --- */}
        <div className="flex flex-col items-center w-full mt-2 md:hidden">
          <div className="flex justify-center w-full gap-4">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-oliveSoft text-whiteMint font-bold shadow-lg hover:bg-oliveSoft/90 transition-all"
            >
              <Download size={20} />
              <span>Unduh</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-tealLight text-whiteMint font-bold shadow-lg hover:bg-tealLight/90 transition-all"
            >
              <Share2 size={20} />
              <span>Bagikan</span>
            </button>
          </div>
          <div className="w-full mt-4">
            <button
              onClick={handleFinish}
              disabled={!generatedUrl || !hasUploaded || isUploading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-whiteGreen border border-greenDark/20 text-greenDark font-bold shadow-sm hover:bg-greenDark/10 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <LoaderCircle size={20} className="animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Selesai</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
