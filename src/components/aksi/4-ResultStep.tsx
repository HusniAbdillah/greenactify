"use client";
import { useState, useEffect, useRef } from "react";
import { uploadGeneratedImage } from "@/lib/upload-generated-image";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid"; // install: npm i uuid
import { useRouter } from "next/navigation";

// Interface untuk props, tidak diubah
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

// Komponen Utama
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

  useEffect(() => {
    if (uploadRef.current) return; // Sudah pernah upload, skip

    const originalImageUrl = URL.createObjectURL(imageData.file);
    const userImage = new window.Image();
    userImage.src = originalImageUrl;
    userImage.crossOrigin = "anonymous";

    userImage.onload = async () => {
      // 1. Setup Canvas dengan rasio 9:16 (resolusi Story)
      const canvas = document.createElement("canvas");
      const cardWidth = 1080;
      const cardHeight = 1920;
      canvas.width = cardWidth;
      canvas.height = cardHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 2. Gambar background utama kartu
      ctx.fillStyle = "#0C3B2E"; // bg-greenDark
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // 3. Gambar header (Logo & tagline)
      ctx.fillStyle = "#D2E8BB"; // bg-mintPastel
      ctx.font = "bold 90px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("GrenActify", cardWidth / 2, 180);

      // 4. Gambar info pengguna
      ctx.fillStyle = "#F1FFF3"; // bg-whiteMint
      ctx.font = "48px sans-serif";
      ctx.fillText(`@${imageData.username || "User"}`, cardWidth / 2, 260);

      // 5. Gambar foto utama pengguna
      const imageY = 320;
      const imageHeight = 960; // Area tinggi untuk gambar
      // Kalkulasi untuk memotong dan memposisikan gambar agar pas (cover)
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

      // 6. Gambar bagian bawah (Aktivitas, Poin, Detail)
      const bottomAreaY = cardHeight - 450;

      // Nama Aktivitas (kiri)
      ctx.textAlign = "left";
      ctx.fillStyle = "#F1FFF3"; // bg-whiteMint
      ctx.font = "bold 92px sans-serif";
      ctx.fillText(imageData.activity.name, 80, bottomAreaY + 120);

      // Poin (kanan)
      ctx.textAlign = "right";
      ctx.fillStyle = "#FFBA00"; // bg-yellowGold
      ctx.fillText(`+${imageData.points}`, cardWidth - 80, bottomAreaY + 120);

      // Detail Lokasi dan Waktu (paling bawah, di tengah)
      const detailsY = bottomAreaY + 280;
      ctx.textAlign = "center";
      ctx.fillStyle = "#DFF7E2"; // bg-whiteGreen
      ctx.font = "42px sans-serif";
      const detailsText = `${imageData.location} • ${formattedDate}, ${formattedTime}`;
      ctx.fillText(detailsText, cardWidth / 2, detailsY);

      // Selesai, set URL dan upload ke storage
      // Ubah PNG ke JPEG dan atur kualitas
      const generatedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setGeneratedUrl(generatedDataUrl);

      if (onGeneratedImageReady && generatedDataUrl && !hasUploaded) {
        setIsUploading(true);
        uploadRef.current = true; // Tandai sudah upload
        const path = `generated-images/${fileId}-${imageData.activity.id}.png`;
        try {
          const url = await uploadGeneratedImage(generatedDataUrl, path);
          setHasUploaded(true); // Aktifkan tombol selesai
          onGeneratedImageReady(url);
        } catch (err: any) {
          // Jika error "already exists", anggap sudah upload
          if (err?.message?.includes("already exists")) {
            setHasUploaded(true); // Aktifkan tombol selesai
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
  }, [fileId]); // Dependency hanya fileId agar hanya sekali per aksi

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

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto p-4">

      {/* Tampilan Kartu Preview dengan rasio 9:16 */}
      <div className="w-full shadow-xl rounded-2xl overflow-hidden border-4 border-white bg-gray-200">
        {generatedUrl ? (
          <Image
            src={generatedUrl}
            alt="Hasil Aksi"
            width={300}
            height={200}
            className="rounded-lg"
          />
        ) : (
          <div className="w-full aspect-[9/16] animate-pulse flex items-center justify-center">
            <p className="text-gray-500">Membuat kartu...</p>
          </div>
        )}
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-col gap-4 w-full mt-8">
        <button
          onClick={handleShare}
          className="w-full px-6 py-3 rounded-xl bg-tealLight text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-md"
        >
          Bagikan
        </button>
        <button
          onClick={handleDownload}
          className="w-full px-6 py-3 rounded-xl bg-oliveSoft text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-md"
        >
          Unduh Gambar
        </button>
      </div>
      <button
        onClick={() => router.push("/")}
        disabled={!generatedUrl || !hasUploaded || isUploading}
        className="w-full mt-4 px-6 py-3 rounded-xl bg-yellowGold text-greenDark font-bold text-lg hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
      >
        {(!generatedUrl || isUploading) ? "Mengunggah..." : "Selesai"}
      </button>
    </div>
  );
}
