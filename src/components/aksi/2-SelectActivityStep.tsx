'use client';

// Mock data untuk daftar aktivitas
const activities = [
  'Menanam Pohon Mangga',
  'Membuat Kompos dari Sampah Organik',
  'Membersihkan Pantai',
  'Menggunakan Transportasi Umum',
  'Memilah Sampah Plastik',
  'Mematikan Lampu Saat Tidak Dipakai',
];

interface SelectActivityStepProps {
  imagePreviewUrl: string;
  onActivitySelect: (activity: string) => void;
  onBack: () => void;
}

export default function SelectActivityStep({ imagePreviewUrl, onActivitySelect, onBack }: SelectActivityStepProps) {
  return (
    <div className="flex flex-col items-center">
        <button onClick={onBack} className="self-start mb-4 text-sm text-blue-600 hover:underline">{'<'} Kembali & Ganti Foto</button>
        <img src={imagePreviewUrl} alt="Preview" className="w-full max-w-md h-auto object-cover rounded-lg mb-6 shadow-md" />
        <h2 className="text-xl font-semibold mb-4">Pilih Aktivitas yang Sesuai</h2>
        <div className="w-full max-w-md">
            {activities.map((activity) => (
            <button
                key={activity}
                onClick={() => onActivitySelect(activity)}
                className="w-full text-left p-3 mb-2 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all"
            >
                {activity}
            </button>
            ))}
        </div>
    </div>
  );
}