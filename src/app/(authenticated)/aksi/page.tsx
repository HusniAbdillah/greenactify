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
    subtitle: "Yuk, unggah foto aksi hijaumu biar makin banyak yang terinspirasi!",
  },
  SELECTING_ACTIVITY: {
    title: "Pilih Jenis Aksimu",
    subtitle: "Kamu lagi ngapain? Pilih jenis aksinya dulu, ya!",
  },
  CONFIRMING_LOCATION: {
    title: "Konfirmasi Lokasi",
    subtitle: "Kasih tahu kami di mana aksi ini kamu lakukan!",
  },
  SHOWING_RESULT: {
    title: "Bagikan Aksimu",
    subtitle: "Aksimu siap dibagikan, yuk kasih tahu yang lain!",
  },
};


export default function AksiPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("UPLOADING");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityCategory | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<string>("");
  const [confirmedLatitude, setConfirmedLatitude] = useState<number | null>(null);
  const [confirmedLongitude, setConfirmedLongitude] = useState<number | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [isActivityInserted, setIsActivityInserted] = useState(false);
  const [totalActivities, setTotalActivities] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [lastUploadTime, setLastUploadTime] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const { user } = useUser();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileId() {
      if (!user) return;
      const id = await getProfileIdByClerkId(user.id);
      if (id) {
        setProfileId(id);
      } else {
        const newId = await createProfileForClerkUser(
          user.id,
          user.username || user.fullName || user.firstName || ""
        );
        setProfileId(newId);
      }
    }
    fetchProfileId();
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('lastActivityUpload');
    if (saved) {
      const timestamp = parseInt(saved);
      setLastUploadTime(timestamp);
      
      const now = Date.now();
      const timeDiff = now - timestamp;
      const cooldownMs = 45 * 1000;
      
      if (timeDiff < cooldownMs) {
        setCooldownRemaining(Math.ceil((cooldownMs - timeDiff) / 1000));
      }
    }
  }, []);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

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

  const handleLocationConfirm = (location: string, latitude?: number, longitude?: number) => {
    setConfirmedLocation(location);
    setConfirmedLatitude(latitude ?? null);
    setConfirmedLongitude(longitude ?? null);
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
        description: selectedActivity!.description,
        points: selectedActivity!.base_points,
        latitude: confirmedLatitude ?? 0,
        longitude: confirmedLongitude ?? 0,
        province: confirmedLocation ?? "",
        city: "",
        is_shared: false,
        image_url: uploadedImageUrl ?? "",
        generated_image_url: generatedImageUrl ?? "",
      });

      await updateUserPoints(profileId!, selectedActivity!.base_points);
      await updateProvinceStats(confirmedLocation, selectedActivity!.base_points);

      const now = Date.now();
      setLastUploadTime(now);
      localStorage.setItem('lastActivityUpload', now.toString());
      setCooldownRemaining(45);

      setCurrentStep("UPLOADING");
      setUploadedFile(null);
      setUploadedImageUrl(null);
      setSelectedActivity(null);
      setConfirmedLocation("");
      setGeneratedImageUrl("");
      setIsActivityInserted(false);
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
    if (
      profileId &&
      selectedActivity &&
      confirmedLocation &&
      generatedImageUrl &&
      !isActivityInserted
    ) {
      createActivity({
        user_id: profileId,
        category_id: selectedActivity.id,
        title: selectedActivity.name,
        description: selectedActivity.description,
        points: selectedActivity.base_points,
        latitude: confirmedLatitude ?? 0,
        longitude: confirmedLongitude ?? 0,
        province: confirmedLocation,
        city: "",
        is_shared: false,
        image_url: uploadedImageUrl ?? "",
        generated_image_url: generatedImageUrl,
      })
        .then(() => { /* ... */ })
        .catch((err) => { /* ... */ });
    }
  }, [
    profileId,
    selectedActivity,
    confirmedLocation,
    generatedImageUrl,
    isActivityInserted,
    confirmedLatitude,
    confirmedLongitude,
    uploadedImageUrl,
  ]);

  useEffect(() => {
    if (!profileId) return;
    async function fetchProfileStats() {
      try {
        const res = await fetch(`/api/profile-stats?id=${profileId}`);
        const data = await res.json();
        setTotalActivities(data.total_activities ?? 0);
        setTotalPoints(data.points ?? 0);
      } catch (err) {
        setTotalActivities(0);
        setTotalPoints(0);
      }
    }
    fetchProfileStats();
  }, [profileId]);

  return (
    <div className="w-full p-4 md:p-8">
      {currentStep !== "SHOWING_RESULT" && (
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
      )}

      {currentStep === "UPLOADING" && (
        <UploadStep 
          onFileSelect={handleFileSelect} 
          cooldownRemaining={cooldownRemaining}
        />
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
          totalActivities={totalActivities} 
          totalPoints={totalPoints}         
          onFinish={handleFinish}
          onGeneratedImageReady={setGeneratedImageUrl}
        />
      )}
    </div>
  );
}
