'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function EditProfilePage() {
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await user.update({
        firstName,
        lastName,
        username,
      });
      setStatus('✅ Profil berhasil diperbarui!');
    } catch (error) {
      console.error(error);
      setStatus('❌ Gagal memperbarui profil.');
    }
  };

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <main className="max-w-md mx-auto mt-10 p-4 border rounded-xl bg-white shadow">
      <h1 className="text-xl font-bold mb-4">Edit Profil</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="First Name"
          className="border px-4 py-2 rounded"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          className="border px-4 py-2 rounded"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          className="border px-4 py-2 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Simpan
        </button>
      </form>
      {status && <p className="mt-4 text-sm text-center">{status}</p>}
    </main>
  );
}
