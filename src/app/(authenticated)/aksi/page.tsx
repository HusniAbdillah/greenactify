// app/(authenticated)/aksi/page.tsx
'use client';

import { useState, useEffect } from 'react';
import UploadStep from '@/components/aksi/1-UploadStep';
import SelectActivityStep from '@/components/aksi/2-SelectActivityStep';
import LocationPopup from '@/components/aksi/3-LocationPopup';
import ResultStep from '@/components/aksi/4-ResultStep';
import { uploadImage } from '@/lib/upload-image';
import type { ActivityCategory } from '@/components/aksi/2-SelectActivityStep'; // atau definisikan sendiri
import { useUser } from '@/hooks/useUser';
import { createActivity } from '@/lib/create-activity'
import { updateUserPoints } from '@/lib/update-user-points'
import { updateProvinceStats } from '@/lib/update-province.stats'
import { getProfileIdByClerkId } from '@/lib/get-profile-front';
import { createProfileForClerkUser } from '@/lib/create-profile';
import { supabase } from '@/lib/supabase-client';

type FlowStep = 'UPLOADING' | 'SELECTING_ACTIVITY' | 'SHOWING_RESULT';

const stepTitles: Record<FlowStep, { title: string; subtitle: string }> = {
  UPLOADING: {
    title: 'Unggah Aksi Hijaumu',
    subtitle: 'Aksi hijau kamu mana nih? Unggah fotonya di sini!',
  },
  SELECTING_ACTIVITY: {
    title: 'Pilih Jenis Aksimu',
    subtitle: 'Kamu lagi ngapain? Pilih jenis aksinya, ya!',
  },
  SHOWING_RESULT: {
    title: 'Bagikan Aksimu',
    subtitle: 'Semangat! Sekarang tinggal bagikan biar makin menginspirasi!',
  },
};

const getLocationStep = () => ({
  title: 'Konfirmasi Lokasi',
  subtitle: 'Di mana kamu melakukan aksi ini? Biar kami tahu!',
});

export default function AksiPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('UPLOADING');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityCategory | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');

  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);

  const { user } = useUser();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileId() {
      if (!user) return; // Guard: don't run if user is not loaded

      const res = await fetch('/api/profile');
      const json = await res.json();
      if (json.profileId) {
        setProfileId(json.profileId);
      } else if (json.error === 'Profile not found') {
        // Create new profile
        const newId = await createProfileForClerkUser(
          user.id,
          user.username || user.fullName || user.firstName || ''
        );
        setProfileId(newId);
      }
    }
    fetchProfileId();
  }, [user]);

  const handleFileSelect = async (file: File) => {
    // Buat path unik, misal pakai timestamp
    const path = `user-uploads/${Date.now()}-${file.name}`;
    try {
      const url = await uploadImage(file, path);
      setUploadedImageUrl(url);
      setUploadedFile(file);
      setCurrentStep('SELECTING_ACTIVITY');
      // Lanjut ke step berikutnya atau simpan ke database
    } catch (err) {
      alert('Gagal upload gambar');
    }
  };

  const handleActivitySelect = (activity: ActivityCategory) => {
    setSelectedActivity(activity);
    setIsLocationPopupOpen(true);
  };

  const handleLocationConfirm = (location: string) => {
    setConfirmedLocation(location);
    setIsLocationPopupOpen(false);
    setCurrentStep('SHOWING_RESULT');
  };


  const handleFinish = async () => {
    console.log({
      profileId,
      selectedActivity,
      uploadedImageUrl,
      confirmedLocation,
      generatedImageUrl
    });
    try {
      if (!profileId || !selectedActivity || !uploadedImageUrl || !confirmedLocation || !generatedImageUrl) {
        alert('Data belum lengkap!');
        return;
      }

      // 0. Update province di profiles jika belum ada
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('province')
        .eq('id', profileId)
        .single();

      if (!profileError && (!profile?.province || profile.province === '')) {
        await supabase
          .from('profiles')
          .update({ province: confirmedLocation })
          .eq('id', profileId);
      }

      // 1. Simpan aktivitas
      const activity = await createActivity({
        user_id: profileId,
        category_id: selectedActivity.id,
        title: selectedActivity.name,
        points: selectedActivity.base_points,
        image_url: uploadedImageUrl,
        generated_image_url: generatedImageUrl,
        latitude: 0,
        longitude: 0,
        province: confirmedLocation,
        city: '',
        is_shared: false
      });

      // 2. Update poin user
      await updateUserPoints(profileId, selectedActivity.base_points);

      // 3. Update statistik provinsi
      await updateProvinceStats(confirmedLocation, selectedActivity.base_points);

      // Reset state
      setCurrentStep('UPLOADING');
      setUploadedFile(null);
      setUploadedImageUrl(null);
      setSelectedActivity(null);
      setConfirmedLocation('');
      setGeneratedImageUrl('');
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleBackToUpload = () => {
    setCurrentStep('UPLOADING');
    setUploadedFile(null);
  }

  return (
    <div className="w-full p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-2 text-gray-800 text-center">
        {isLocationPopupOpen
          ? getLocationStep().title
          : stepTitles[currentStep].title}
      </h1>
      <p className="text-center text-gray-500 mb-6">
        {isLocationPopupOpen
          ? getLocationStep().subtitle
          : stepTitles[currentStep].subtitle}
      </p>

      {currentStep === 'UPLOADING' && (
        <UploadStep onFileSelect={handleFileSelect} />
      )}

      {currentStep === 'SELECTING_ACTIVITY' && uploadedFile && (
        <SelectActivityStep
          onActivitySelect={handleActivitySelect}
          onBack={handleBackToUpload}
        />
      )}
      
      <LocationPopup
        isOpen={isLocationPopupOpen}
        onClose={() => setIsLocationPopupOpen(false)}
        onConfirm={handleLocationConfirm}
        title={getLocationStep().title}
        subtitle={getLocationStep().subtitle}
      />

      {currentStep === 'SHOWING_RESULT' && uploadedFile && selectedActivity && (
        <ResultStep
          imageData={{
            file: uploadedFile,
            activity: selectedActivity,
            location: confirmedLocation,
            points: selectedActivity.base_points,
            username: user?.username || user?.fullName || user?.firstName || ''
          }}
          onFinish={handleFinish}
          onGeneratedImageReady={setGeneratedImageUrl}
        />
      )}
    </div>
  );
}