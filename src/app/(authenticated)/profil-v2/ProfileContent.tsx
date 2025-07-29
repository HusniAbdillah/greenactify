'use client';

import React, { useState } from 'react';
import { User } from "@clerk/nextjs/server";
import ActivitiesGrid from '@/components/ui/activityGrid';
import GroupActivityGrid from '@/components/ui/groupActivitiesGrid';
type Props = {
  user: {
    id: string
    username: string | null
    imageUrl: string
    firstName: string | null
    lastName: string | null
  } | null
}
/*
#6D9773

#0C3B2E

#B46617

#FFBAOO

putih F1FFF3
 */
export default function ProfileContent({ user }: Props) {
  const [activeTab, setActiveTab] = useState<'activities' | 'overview'>('overview');

  return (
    <div className="min-h-screen bg-[#BBE8C3] min-w-10xl ">
      <h1 className="py-5 not-last:mx-auto text-center font-bold text-2xl ">
        Profil
      </h1>

      <section className="flex flex-col md:flex-row justify-center gap-5 items-center mx-auto ">
        <img
          src={user?.imageUrl ?? ''}
          alt={`${user?.firstName}'s profile`}
          className="w-30 h-30 md:h-40 md:w-40 rounded-full"
        />

        <div className="flex flex-col justify-start items-center gap-2 lg:mr-13">
          <p className="font-bold text text-3xl text-[#161716]">
            @{user?.username}
          </p>

          <p className="font-bold text-lg text-[#161716]">
            {`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
          </p>

          <button className="bg-[#6D9773] px-4 py-1 rounded-3xl font-bold text-[#161716]">
            Ubah Profil
          </button>

          <p className="md:block font-bold text-2xl text-center lg:hidden">
            4570 point
          </p>
        </div>

        <div className="flex justify-center items-center">
          <div className="flex flex-col gap-3">
            <img
              src="/Trophy_Cup.svg"
              alt={`${user?.firstName}'s profile`}
              className="w-40 h-40 md:h-50 md:w-50 rounded-full"
            />
            <p className="hidden lg:block font-bold text-3xl text-center">
              4570 point
            </p>
          </div>

          <div className=" font-bold text-center text-[22px] md:text-[26px] pl-12 max-w-65 md:max-w-full">
            <p className='font-extrabold text-[#FFBA00] text-[23px] md:text-[28px]  '>
                Selamat!
            </p>

            Kamu Termasuk {" "}
            <span className='font-extrabold text-[#FFBA00] text-[26px] md:text-[30px]'> 
                 Top 100 
            </span> 
            <br />
            orang paling <br />
            berkelanjutan
          </div>

        </div>
      </section>

      <section className=" mx-auto flex bg-[#6D9773] rounded-4xl p-1 mt-5 max-w-7xl">
        <button
          className={`flex-1 py-3 px-4 rounded-4xl font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'bg-[#0C3B2E] text-[#F1FFF3] shadow-sm'
              : 'text-[#0C3B2E] hover:bg-[#84ab89] hover:shadow-lg'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Jejakku
        </button>

        <button
          className={`flex-1 py-3 px-4 rounded-4xl font-semibold transition-colors ${
            activeTab === 'activities'
            ? 'bg-[#0C3B2E] text-[#F1FFF3] shadow-sm'
              : 'text-[#0C3B2E] hover:bg-[#84ab89] hover:shadow-lg'
          }`}
          onClick={() => setActiveTab('activities')}
        >
          Riwayat
        </button>
        </section>

      <section className="w-full bg-[#0C3B2E] rounded-4xl mb-10 mt-5 px-10 py-6">
            {activeTab === 'activities' && (
                <>
                    <h2 className="font-bold text-xl text-[#F1FFF3] text-center pb-4">
                        Riwayat Aksi
                    </h2>
                    <ActivitiesGrid/>
                </>
            )}

            {activeTab === 'overview' && (
                <>
                    <h2 className="font-bold text-xl text-[#F1FFF3] text-center pb-4">
                        Jumlah Aktivitas
                    </h2>
                    <GroupActivityGrid/>
                </>
            )}
      </section>
    </div>

  );
}