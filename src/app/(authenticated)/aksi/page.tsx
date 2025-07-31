"use client";

import { useState, useEffect } from "react";
import UploadStep from "@/components/aksi/1-UploadStep";
import SelectActivityStep from "@/components/aksi/2-SelectActivityStep";
import LocationStep from "@/components/aksi/3-LocationStep";
import ResultStep from "@/components/aksi/4-ResultStep";
import { uploadImage } from "@/lib/upload-image";
import type { ActivityCategory } from "@/components/aksi/2-SelectActivityStep";
import { useUser } from "@/hooks/useUser";
import { createActivity } from "@/lib/create-activity";
import { updateUserPoints } from "@/lib/update-user-points";
import { updateProvinceStats } from "@/lib/update-province.stats";
import { createProfileForClerkUser } from "@/lib/create-profile";
import { supabase } from "@/lib/supabase-client";
import { ArrowLeft } from "lucide-react";
import { getProfileIdByClerkId } from "@/lib/get-profile-front";

type FlowStep =
  | "UPLOADING"
  | "SELECTING_ACTIVITY"
  | "CONFIRMING_LOCATION"
  | "SHOWING_RESULT";

const stepTitles: Record<FlowStep, { title: string; subtitle: string }> = {
  UPLOADING: {
    title: "Unggah Aksi Hijaumu",
    subtitle: "Aksi hijau kamu mana nih? Unggah fotonya di sini!",
  },
  SELECTING_ACTIVITY: {
    title: "Pilih Jenis Aksimu",
    subtitle: "Kamu lagi ngapain? Pilih jenis aksinya, ya!",
  },
  CONFIRMING_LOCATION: {
    title: "Konfirmasi Lokasi",
    subtitle: "Di mana kamu melakukan aksi ini? Biar kami tahu!",
  },
  SHOWING_RESULT: {
    title: "Bagikan Aksimu",
    subtitle: "Semangat! Sekarang tinggal bagikan biar makin menginspirasi!",
  },
};

export default function AksiPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("UPLOADING");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityCategory | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isActivityInserted, setIsActivityInserted] = useState(false);

  const { user } = useUser();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileId() {
      if (!user) return;
      // Ambil profileId langsung dari Supabase berdasarkan clerkId (client-side)
      const id = await getProfileIdByClerkId(user.id);
      if (id) {
        setProfileId(id);
      } else {
        // Jika belum ada profile, buat profile baru
        const newId = await createProfileForClerkUser(
          user.id,
          user.username || user.fullName || user.firstName || ""
        );
        setProfileId(newId);
      }
    }
    fetchProfileId();
  }, [user]);

  const handleFileSelect = async (file: File) => {
    const path = `user-uploads/${Date.now()}-${file.name}`;
    try {
      const url = await uploadImage(file, path);
      setUploadedImageUrl(url);
      setUploadedFile(file);
      setCurrentStep("SELECTING_ACTIVITY");
    } catch (err) {
      alert("Gagal upload gambar");
      throw err;
    }
  };

  const handleActivitySelect = (activity: ActivityCategory) => {
    setSelectedActivity(activity);
    setCurrentStep("CONFIRMING_LOCATION");
  };

  const handleLocationConfirm = (location: string) => {
    setConfirmedLocation(location);
    setCurrentStep("SHOWING_RESULT");
  };

  const handleFinish = async () => {
    try {
      const missingFields: string[] = [];
      if (!profileId) missingFields.push("Profile ID");
      if (!selectedActivity) missingFields.push("Jenis Aksi");
      if (!uploadedImageUrl) missingFields.push("Gambar yang diunggah");
      if (!confirmedLocation) missingFields.push("Lokasi");
      if (!generatedImageUrl) missingFields.push("Gambar hasil generate");

      if (missingFields.length > 0) {
        alert(`Data belum lengkap!\n\nMohon lengkapi: ${missingFields.join(", ")}`);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("province")
        .eq("id", profileId)
        .single();

      if (!profileError && (!profile?.province || profile.province === "")) {
        await supabase
          .from("profiles")
          .update({ province: confirmedLocation })
          .eq("id", profileId);
      }

      await createActivity({
        user_id: profileId!,
        category_id: selectedActivity!.id,
        title: selectedActivity!.name,
        description: selectedActivity!.description, // <-- tambahkan ini
        points: selectedActivity!.base_points,
        latitude: 0,
        longitude: 0,
        province: confirmedLocation ?? "",
        city: "",
        is_shared: false,
        image_url: uploadedImageUrl ?? "",
        generated_image_url: generatedImageUrl ?? "",
      });

      await updateUserPoints(profileId!, selectedActivity!.base_points);
      await updateProvinceStats(confirmedLocation, selectedActivity!.base_points);

      setCurrentStep("UPLOADING");
      setUploadedFile(null);
      setUploadedImageUrl(null);
      setSelectedActivity(null);
      setConfirmedLocation("");
      setGeneratedImageUrl("");
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleBackToUpload = () => {
    setCurrentStep("UPLOADING");
    setUploadedFile(null);
    setUploadedImageUrl(null);
  };

  const handleBackToSelectActivity = () => {
    setCurrentStep("SELECTING_ACTIVITY");
  };

  useEffect(() => {
    // Insert otomatis jika semua data sudah lengkap dan belum pernah insert
    if (
      profileId &&
      selectedActivity &&
      confirmedLocation &&
      generatedImageUrl &&
      !isActivityInserted
    ) {
      setIsActivityInserted(true); // Mencegah insert ganda
      createActivity({
        user_id: profileId,
        category_id: selectedActivity.id,
        title: selectedActivity.name,
        description: selectedActivity.description, // <-- tambahkan ini
        points: selectedActivity.base_points,
        latitude: 0,
        longitude: 0,
        province: confirmedLocation,
        city: "",
        is_shared: false,
        image_url: uploadedImageUrl ?? "",
        generated_image_url: generatedImageUrl,
      })
        .then(() => {
          // Optional: update user points, province stats, dsb
          updateUserPoints(profileId, selectedActivity.base_points);
          updateProvinceStats(confirmedLocation, selectedActivity.base_points);
        })
        .catch((err) => {
          // Optional: handle error
          setIsActivityInserted(false); // Boleh retry jika gagal
        });
    }
  }, [profileId, selectedActivity, confirmedLocation, generatedImageUrl, isActivityInserted]);

  return (
    <div className="w-full p-4 md:p-8">
      <div className="bg-tealLight rounded-lg p-3 md:p-6 mb-4 md:mb-6 flex items-center">
        <div className="w-1/5">
          {(currentStep === "SELECTING_ACTIVITY" || currentStep === "CONFIRMING_LOCATION") && (
            <button
              onClick={currentStep === "SELECTING_ACTIVITY" ? handleBackToUpload : handleBackToSelectActivity}
              className="flex items-center gap-2 text-black font-semibold hover:bg-black/10 p-2 rounded-lg transition-colors -ml-2"
            >
              <ArrowLeft size={22} />
              <span className="hidden md:inline">Kembali</span>
            </button>
          )}
        </div>
        <div className="w-3/5 text-center">
          <h1 className="text-base md:text-2xl font-bold text-black">
            {stepTitles[currentStep].title}
          </h1>
          <p className="text-center text-black text-xs md:text-lg mt-1">
            {stepTitles[currentStep].subtitle}
          </p>
        </div>
        <div className="w-1/5"></div>
      </div>

      {currentStep === "UPLOADING" && (
        <UploadStep onFileSelect={handleFileSelect} />
      )}

      {currentStep === "SELECTING_ACTIVITY" && uploadedFile && (
        <SelectActivityStep
          onActivitySelect={handleActivitySelect}
          onBack={handleBackToUpload}
        />
      )}

      {currentStep === "CONFIRMING_LOCATION" && (
        <LocationStep
          onConfirm={handleLocationConfirm}
          onBack={handleBackToSelectActivity}
        />
      )}

      {currentStep === "SHOWING_RESULT" && uploadedFile && selectedActivity && (
        <ResultStep
          imageData={{
            file: uploadedFile,
            activity: selectedActivity,
            location: confirmedLocation,
            points: selectedActivity.base_points,
            username: user?.username || user?.fullName || user?.firstName || "",
          }}
          onFinish={handleFinish}
          onGeneratedImageReady={setGeneratedImageUrl}
        />
      )}
    </div>
  );
}
