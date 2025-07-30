// app/(authenticated)/aksi/page.tsx
'use client';

import { useState } from 'react';
import UploadStep from '@/components/aksi/1-UploadStep';
import SelectActivityStep from '@/components/aksi/2-SelectActivityStep';
import LocationPopup from '@/components/aksi/3-LocationPopup';
import ResultStep from '@/components/aksi/4-ResultStep';

type FlowStep = 'UPLOADING' | 'SELECTING_ACTIVITY' | 'SHOWING_RESULT';

export default function AksiPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('UPLOADING');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [confirmedLocation, setConfirmedLocation] = useState<string>('');

  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setCurrentStep('SELECTING_ACTIVITY');
  };

  const handleActivitySelect = (activity: string) => {
    setSelectedActivity(activity);
    setIsLocationPopupOpen(true);
  };

  const handleLocationConfirm = (location: string) => {
    setConfirmedLocation(location);
    setIsLocationPopupOpen(false);
    setCurrentStep('SHOWING_RESULT');
  };


  const handleFinish = () => {
    setCurrentStep('UPLOADING');
    setUploadedFile(null);
    setSelectedActivity('');
    setConfirmedLocation('');
  };

  const handleBackToUpload = () => {
    setCurrentStep('UPLOADING');
    setUploadedFile(null);
  }

  return (
    <div className="w-full p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Unggah Aktivitas Hijau Anda</h1>

      {currentStep === 'UPLOADING' && (
        <UploadStep onFileSelect={handleFileSelect} />
      )}

      {currentStep === 'SELECTING_ACTIVITY' && uploadedFile && (
        <SelectActivityStep
          imagePreviewUrl={URL.createObjectURL(uploadedFile)}
          onActivitySelect={handleActivitySelect}
          onBack={handleBackToUpload}
        />
      )}
      
      <LocationPopup
        isOpen={isLocationPopupOpen}
        onClose={() => setIsLocationPopupOpen(false)}
        onConfirm={handleLocationConfirm}
      />

      {currentStep === 'SHOWING_RESULT' && uploadedFile && (
        <ResultStep
          imageData={{
            file: uploadedFile,
            activity: selectedActivity,
            location: confirmedLocation,
            points: 150, // Poin bisa didapat dari logika lain
          }}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
}