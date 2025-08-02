"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { uploadGeneratedImage } from "@/lib/upload-generated-image";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Share2, Download, CheckCircle2, LoaderCircle } from "lucide-react";

interface ResultStepProps {
  imageData: {
    file: File;
    activity: { id: string; name: string; base_points: number };
    location: string;
    points: number;
    username?: string;
  };
  totalActivities: number;
  totalPoints: number;
  onFinish: () => void;
  onGeneratedImageReady?: (url: string) => void;
  challengeId?: string;
}

const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number => {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, currentY);
  return currentY;
};

function countWrappedLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const words = text.split(" ");
  let line = "";
  let lines = 1;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      line = words[n] + " ";
      lines++;
    } else {
      line = testLine;
    }
  }
  return lines;
}

export default function ResultStep({
  imageData,
  totalActivities,
  totalPoints,
  onFinish,
  onGeneratedImageReady,
  challengeId,
}: ResultStepProps) {
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileId] = useState(() => uuidv4());
  const uploadRef = useRef(false);
  const router = useRouter();
  const newTotalActivities = totalActivities + 1;
  const newTotalPoints = totalPoints + imageData.points;

  const now = new Date();
  const formattedDate = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    if (uploadRef.current) return;

    const logoImage = new window.Image();
    logoImage.src = "/logo-greenactify.png";
    logoImage.crossOrigin = "anonymous";

    const userImage = new window.Image();
    userImage.src = URL.createObjectURL(imageData.file);
    userImage.crossOrigin = "anonymous";

    Promise.all([
      new Promise((resolve) => (logoImage.onload = resolve)),
      new Promise((resolve) => (userImage.onload = resolve)),
    ]).then(async () => {
      const canvas = document.createElement("canvas");
      const cardWidth = 1080;
      const cardHeight = 1920;
      const padding = 60;
      canvas.width = cardWidth;
      canvas.height = cardHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#D2E8BB"; // bg-mintPastel
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      const logoHeight = 180;
      const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
      ctx.drawImage(
        logoImage,
        cardWidth / 2 - logoWidth / 2,
        padding,
        logoWidth,
        logoHeight
      );

      let currentY = padding + logoHeight + 80;
      ctx.fillStyle = "#008373"; // bg-greenDark
      ctx.font = "italic bold 52px 'Poppins', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`@${imageData.username || "User"}`, cardWidth / 2, currentY);

      currentY += 120;
      ctx.fillStyle = "#0C3B2E"; // bg-yellowAmber
      ctx.font = "bold 62px 'Poppins', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${newTotalActivities} Aktivitas`, padding, currentY);
      ctx.fillStyle = "#A56D00"; // bg-yellowAmber
      ctx.textAlign = "right";
      ctx.fillText(`${newTotalPoints} Poin`, cardWidth - padding, currentY);

      currentY += 50;
      const imageContainerX = padding;
      const imageContainerY = currentY;
      const imageContainerWidth = cardWidth - padding * 2;
      const imageContainerHeight = imageContainerWidth * (1 / 1);

      const imgAspectRatio = userImage.width / userImage.height;
      const containerAspectRatio = imageContainerWidth / imageContainerHeight;
      let drawWidth, drawHeight, imgX, imgY;

      if (imgAspectRatio > containerAspectRatio) {
        drawWidth = imageContainerWidth;
        drawHeight = drawWidth / imgAspectRatio;
        imgX = imageContainerX;
        imgY = imageContainerY + (imageContainerHeight - drawHeight) / 2;
      } else {
        drawHeight = imageContainerHeight;
        drawWidth = drawHeight * imgAspectRatio;
        imgX = imageContainerX + (imageContainerWidth - drawWidth) / 2;
        imgY = imageContainerY;
      }
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, drawWidth, drawHeight, 30);
      ctx.clip();
      ctx.drawImage(userImage, imgX, imgY, drawWidth, drawHeight);
      ctx.restore();

      currentY += imageContainerHeight + 90;

      const activityText = imageData.activity.name;
      const lineHeightDefault = 85;
      const maxWidth = cardWidth - padding * 2;

      const wordsCount = activityText.trim().split(/\s+/).length;
      const lines = countWrappedLines(ctx, activityText, maxWidth);
      const footerFont = "bold 45px 'Poppins', sans-serif";

      let activityFont = "bold 72px 'Poppins', sans-serif";
      let poinFont = "bold 72px 'Poppins', sans-serif";
      let lineHeight = lineHeightDefault;
      let areaHeight = 230;
      let poinYOffset = 90;

      if (wordsCount <= 2 && lines === 1) {
        activityFont = "bold 90px 'Poppins', sans-serif";
        poinFont = "bold 90px 'Poppins', sans-serif";
        lineHeight = 100;
        areaHeight = 200;
        poinYOffset = 120;
      }

      const totalTextHeight = lines * lineHeight;

      const areaTop = currentY;
      const startY = areaTop + (areaHeight - totalTextHeight) / 2;

      ctx.font = activityFont;
      ctx.fillStyle = "#0C3B2E";
      ctx.textAlign = "center";
      const lastLineY = wrapText(
        ctx,
        activityText,
        cardWidth / 2,
        startY,
        maxWidth,
        lineHeight
      );

      const footerY = cardHeight - padding;
      const poinY = footerY - poinYOffset;
      ctx.fillStyle = "#A56D00";
      ctx.font = poinFont;
      ctx.textAlign = "center";
      ctx.fillText(`+${imageData.points} Poin`, cardWidth / 2, poinY);

      ctx.fillStyle = "#003123";
      ctx.font = footerFont;
      ctx.textAlign = "left";
      ctx.fillText(imageData.location, padding, footerY);
      ctx.textAlign = "right";
      ctx.fillText(
        `${formattedDate}, ${formattedTime}`,
        cardWidth - padding,
        footerY
      );

      // Jika ini adalah challenge, tambahkan badge di kartu
      // const { challengeId } = imageData.challengeId;
      if (challengeId) {
        ctx.fillStyle = "#FFD700"; // Gold color
        ctx.font = "bold 40px 'Poppins', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎯 DAILY CHALLENGE", cardWidth / 2, currentY - 50);
        currentY += 50;
      }

      const generatedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setGeneratedUrl(generatedDataUrl);

      if (onGeneratedImageReady && generatedDataUrl && !hasUploaded) {
        setIsUploading(true);
        uploadRef.current = true;
        const path = `generated-images/${fileId}-${imageData.activity.id}.jpg`;
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
    });
  }, [
    fileId,
    formattedDate,
    formattedTime,
    hasUploaded,
    imageData.activity.id,
    imageData.activity.name,
    imageData.file,
    imageData.location,
    imageData.points,
    imageData.username,
    onGeneratedImageReady,
    newTotalActivities,
    newTotalPoints,
  ]);

  const handleDownload = () => {
    if (!generatedUrl) return;
    const link = document.createElement("a");
    link.href = generatedUrl;
    link.download = "greenactify-card.png";
    link.click();
  };

  const handleShare = async () => {
    if (!generatedUrl) return;
    try {
      const res = await fetch(generatedUrl);
      const blob = await res.blob();
      const file = new File([blob], "greenactify-card.png", {
        type: "image/png",
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Aksi Hijauku!",
          text: `${imageData.activity.name} bareng GreenActify ✔️
Aksi kecil, dampak besar.
Yuk ikutan juga 😎🌱`,
          files: [file],
        });
      } else {
        alert(
          "Belum bisa share langsung. Tenang, tinggal unduh terus bagikan manual ya!"
        );
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Gagal membagikan gambar.");
    }
  };

  const handleFinish = () => {
    router.push("/");
  };

  const handleGeneratedImageReady = useCallback((url: string) => {
    setGeneratedUrl(url);
  }, []);

  return (
    <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto py-4 md:items-center md:gap-2 lg:gap-8">
      <div className="w-full md:hidden mb-3 pb-1 text-center">
        <h2 className="text-xl font-bold text-greenDark">
          Satu Aksi, Sejuta Inspirasi!
        </h2>
        <p className="text-black/90 mt-1">
          Bagikan aksimu dan tebarkan semangat hijau ke seluruh dunia.
        </p>
      </div>

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

      <div className="w-full md:w-7/12 flex flex-col justify-center items-center mt-8 md:mt-0">
        <div className="hidden md:block text-center mb-8">
          <h2 className="text-4xl font-bold text-greenDark leading-tight">
            Satu Aksi, <br /> Sejuta Inspirasi!
          </h2>
          <p className="text-oliveSoft mt-2 max-w-md">
            Bagikan aksimu dan tebarkan semangat hijau ke seluruh dunia.
          </p>
        </div>

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
