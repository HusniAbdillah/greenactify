'use client';
import Link from 'next/link'; 
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfiles, useActivities } from '@/hooks/useSupabase';
import { useUser, useClerk } from '@clerk/nextjs';
import ProfileActivity from './profileActivity';

export default function ProfileContent() {
  const { profile } = useProfiles();
  const { user } = useUser();
  const clerk = useClerk();
  const router = useRouter();
  const { activities, loading, error, refetch } = useActivities();

  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);
  function getRankInfo(rank: number | null) {
    if (rank === 1) {
      return {
        message: " Kamu berhasil menjadi Juara 1 Nasional. Aksimu adalah inspirasi bagi seluruh Indonesia! ",
        image: "trophy_1.svg",
      };
    }

    if (rank && rank <= 3) {
      return {
        message: " Kamu termasuk 3 Besar Nasional. Terus pertahankan semangat dan dampak positifmu! ",
        image: "trophy_3.svg",
      };
    }

    if (rank && rank <= 10) {
      return {
        message: " Kamu berada di Top 10 Pejuang Lingkungan. Aksimu menciptakan perubahan nyata! ",
        image: "trophy_10.svg",
      };
    }

    if (rank && rank <= 100) {
      return {
        message: "Kamu termasuk 100 Aktivis Terbaik. Setiap langkahmu membawa perubahan! ",
        image: "trophy_100.svg",
      };
    }

    if (rank && rank <= 1000) {
      return {
        message: "Kamu bagian dari 1000 pejuang lingkungan yang berdampak. Lanjutkan perjuanganmu! ",
        image: "trophy_1000.svg",
      };
    }

    return {
      message: "Ayo mulai dan tingkatkan aksi ramah lingkunganmu. Setiap langkah kecil sangat berarti! ",
      image: "trophy_default.png",
    };
  }

  const { message, image } = getRankInfo(profile?.rank ?? null);

  return (
    <div className="min-h-screen bg-mintPastel min-w-full pb-2 px-4 md:px-8">
      <h1 className="py-5 text-center xl:pl-4 font-bold text-2xl">
        Profil
      </h1>

      <section className="flex flex-col md:flex-row justify-center gap-y-5 gap-x-6 md:gap-x-16 lg:gap-x-5 items-center mx-auto">
        <div className="flex flex-row gap-x-3 items-center">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={`${profile?.full_name}'s profile`}
              className="w-30 h-30 md:w-40 md:h-40 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs md:text-sm">
              No Image
            </div>
          )}

          <div className="flex flex-col justify-start items-center gap-2 lg:mr-13">
            <p className="font-bold sm:text-xl text-lg lg:text-3xl text-black">
              @{profile?.username}
            </p>

            <p className="font-bold text-sm lg:text-lg text-black">
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
              className="w-30 h-40 md:h-50 md:w-40"
            />
            <p className="block font-bold text-center md:text-3xl text-xl">
              {profile?.points} poin
            </p>
          </div>
          <div className="font-bold text-center text-[17px] lg:text-[24px] pl-12 max-w-65 lg:max-w-100">
            {profile && profile.rank !== null && profile.rank <= 1000 && (
              <p className="font-extrabold text-yellowGold text-[23px] md:text-[28px]">
                Selamat!
              </p>
            )}
            {message}
          </div>
        </div>
      </section>

      <ProfileActivity
        activities={activities}
        loading={loading}
        error={error}
        refetch={refetch}
      />
    </div>
  );
}
