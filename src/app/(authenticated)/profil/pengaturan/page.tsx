'use client';
import { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import { useProfiles } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
const provinces = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Bengkulu", "Sumatera Selatan", "Bangka Belitung",
  "Lampung", "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur",
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
  "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Pegunungan", "Papua Tengah", "Papua Selatan"
];

export default function EditProfilePage() {
  const { profile } = useProfiles();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [province, setProvince] = useState('');
  const [search, setSearch] = useState('');
  const { isLoaded, isSignedIn, user } = useUser();
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setUsername(profile.username ?? '');
      setProvince(profile.province ?? '');
    }
  }, [profile]);
  

  const clerk_id = user?.id
  console.log('🧾 Clerk ID dari frontend:', clerk_id);
const handleUpdate = async () => {
  if (!fullName || !username || !province) {
    toast.error('Semua kolom harus diisi!');
    return;
  }

  // CEK CLERK_ID DULU
  if (!clerk_id) {
    alert('ERROR: clerk_id kosong! User belum login?');
    return;
  }


  const res = await fetch('/api/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: fullName, username, province, clerk_id }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(`ERROR: ${data.error}`); // Tampilkan error dengan alert
    toast.error(data.error || 'Gagal memperbarui profil');
  } else {
    toast.success('Profil berhasil diperbarui!');
  }
};

  const filteredProvinces = provinces.filter((prov) =>
    prov.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-mintPastel text-black flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-whiteGreen flex flex-col md:flex-row gap-8">
        {/* Kolom Kiri: Form */}
        <div className="flex-1 space-y-5">
          <h1 className="text-3xl font-extrabold text-greenDark mb-6">Edit Profil</h1>
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-black mb-1">Nama Lengkap</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-oliveSoft rounded-lg bg-white text-black placeholder-oliveDark focus:outline-none focus:ring-2 focus:ring-greenDark transition duration-200"
              placeholder="Nama lengkap Anda"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-black mb-1">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-oliveSoft rounded-lg bg-white text-black placeholder-oliveDark focus:outline-none focus:ring-2 focus:ring-greenDark transition duration-200"
              placeholder="Username unik Anda"
            />
          </div>

          <div>
            <label htmlFor="provinceSearch" className="block text-sm font-semibold text-black mb-1">Provinsi</label>
            <input
              id="provinceSearch"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 mb-2 border border-oliveSoft rounded-lg bg-white text-black placeholder-oliveDark focus:outline-none focus:ring-2 focus:ring-greenDark transition duration-200"
              placeholder="Cari provinsi..."
            />
            <select
              id="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-4 py-2 border border-oliveSoft rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-greenDark transition duration-200"
            >
              <option value="">Pilih provinsi</option>
              {filteredProvinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleUpdate}
            className="w-full bg-greenDark text-whiteMint py-3 rounded-lg hover:bg-oliveDark transition duration-200 font-bold text-lg shadow-md hover:shadow-lg mt-6"
          >
            Simpan Perubahan
          </button>
        </div>

        {/* Kolom Kanan: UserButton & Info Tambahan */}
        <div className="md:w-1/3 flex flex-col items-center justify-center p-4 bg-whiteGreen rounded-lg shadow-inner border border-mintPastel">
          <h2 className="text-xl font-bold text-greenDark mb-4 text-center">Pengaturan Akun</h2>
          {/* Mengubah ukuran UserButton dengan kelas Tailwind CSS */}
          <div className="p-2  rounded-full  mb-4 transform scale-200">
            <UserButton />          </div>
          <p className="text-sm text-center text-oliveDark">
            Klik ikon di atas untuk mengubah foto profil, email, atau password melalui pengaturan akun Clerk Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
