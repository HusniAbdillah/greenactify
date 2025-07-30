'use client';
import Link from 'next/link'; 
import React, { useState } from 'react';
import ActivitiesGrid from '@/components/profil/activityGrid';
import GroupActivityGrid from '@/components/profil/groupActivitiesGrid';
import { useProfiles } from '@/hooks/useSupabase';
import { useUser, useClerk } from '@clerk/nextjs';

type Props = {
  user1: {
    id: string
    username: string | null
    imageUrl: string
    firstName: string | null
    lastName: string | null
  } | null
}

export default function ProfileContent({ user1 }: Props) {
  const [activeTab, setActiveTab] = useState<'activities' | 'overview'>('overview');
  const { profile } = useProfiles();
  const { user } = useUser();
  const clerk = useClerk();

  // 🔍 Fungsi bantu untuk menampilkan pesan dan gambar berdasarkan rank
  function getRankInfo(rank: number | null) {
    if (rank === 1) return { message: "Kamu Juara 1 Nasional! 🌟", image: "trophy_1.svg" };
    if (rank && rank <= 3) return { message: "Masuk 3 Besar Terbaik!", image: "trophy_3.svg" };
    if (rank && rank <= 10) return { message: "Top 10 Terbaik Nasional!", image: "trophy_10.svg" };
    if (rank && rank <= 100) return { message: "Top 100 Terbaik Berkelanjutan!", image: "trophy_100.svg" };
    if (rank && rank <= 1000) return { message: "Top 1000 Pejuang Lingkungan!", image: "trophy_1000.svg" };
    return { message: "Ayo tingkatkan aksimu!", image: "trophy_default.png" };
  }

  const { message, image } = getRankInfo(profile?.rank ?? null);

  return (
    <div className="min-h-screen bg-mintPastel min-w-full pb-2 px-4 md:px-8">
      <h1 className="py-5 text-center xl:pl-12 font-bold text-2xl">
        Profil
      </h1>

      <section className="flex flex-col md:flex-row justify-center gap-y-5 gap-x-6 md:gap-x-16 lg:gap-x-5 items-center mx-auto">
        <div className="flex flex-row gap-x-3 items-center">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={`${profile?.full_name}'s profile`}
              className="w-30 h-30 md:w-40 md:h-40 rounded-full" // kecil di mobile, normal di md+
            />
          ) : (
            <div className="w-20 h-20 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs md:text-sm">
              No Image
            </div>
          )}

          <div className="flex flex-col justify-start items-center gap-2 lg:mr-13">
            <p className="font-bold sm:text-xl text-lg md:text-3xl text-black">
              @{profile?.username}
            </p>

            <p className="font-bold text-sm md:text-lg text-black">
              {profile?.full_name}
            </p>

            <div className="flex flex-col items-center gap-2">
              <Link href="/profil/pengaturan" passHref>
                <button className="bg-oliveSoft px-3 py-1 text-xs md:text-base rounded-3xl font-bold text-black">
                  Ubah Profil
                </button>
              </Link>
            {!profile?.province && (
              <p className="text-red-500 text-xs text-center max-w-[200px]">
                Kamu belum memilih provinsi. Silakan lengkapi di "Ubah Profil".
              </p>
            )}

              <button
                onClick={async () => {
                  const confirmed = window.confirm("Apakah kamu yakin ingin keluar?");
                  if (confirmed) {
                    await clerk.signOut();
                  }
                }}
                className="bg-red-500 text-white px-3 py-1 text-xs md:text-base rounded-3xl font-bold hover:bg-red-600 mt-1"
              >
                Keluar
              </button>
            </div>


          </div>
        </div>


        <div className="flex justify-center items-center">
          <div className="flex flex-col gap-3">
            <img
              src={`/${image}`}
              alt="Trophy"
              className="w-30 h-40 md:h-50 md:w-40 "
            />
            <p className="block font-bold text-center md:text-3xl text-xl">
              {profile?.points} poin
            </p>
          </div>

          <div className="font-bold text-center text-[22px] md:text-[26px] pl-12 max-w-65 md:max-w-full">
            <p className="font-extrabold text-yellowGold text-[23px] md:text-[28px]">
              Selamat!
            </p>
            {message}
          </div>
        </div>
      </section>

      <section className="mx-auto flex bg-oliveSoft rounded-4xl p-1 mt-5 max-w-7xl">
        <button
          className={`flex-1 py-3 px-4 rounded-4xl font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'bg-greenDark text-whiteMint shadow-sm'
              : 'text-greenDark hover:bg-mintPastel hover:shadow-lg'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Jejakku
        </button>

        <button
          className={`flex-1 py-3 px-4 rounded-4xl font-semibold transition-colors ${
            activeTab === 'activities'
              ? 'bg-greenDark text-whiteMint shadow-sm'
              : 'text-greenDark hover:bg-mintPastel hover:shadow-lg'
          }`}
          onClick={() => setActiveTab('activities')}
        >
          Riwayat
        </button>
      </section>

      <section className="w-full bg-greenDark rounded-4xl mb-4 mt-5 md:px-8 md:py-6 px-3 py-1">
        {activeTab === 'activities' && (
          <>
            <h2 className="font-bold text-xl text-whiteMint text-center pb-4">
              Riwayat Aksi
            </h2>
            <ActivitiesGrid />
          </>
        )}

        {activeTab === 'overview' && (
          <>
            <h2 className="font-bold text-xl text-whiteMint text-center pb-4">
              Jumlah Aktivitas
            </h2>
            <GroupActivityGrid />
          </>
        )}
      </section>
    </div>
  );
}
