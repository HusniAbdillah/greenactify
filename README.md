# GreenActify

GreenActify adalah Progressive Web App (_PWA_) berbasis _mobile-first_ yang membangun ekosistem digital untuk mendorong, mencatat, dan menggamifikasi partisipasi masyarakat dalam aksi hijau. Platform ini dapat diakses universal lewat browser, baik di perangkat mobile maupun desktop, dengan antarmuka responsif dan performa setara aplikasi native.

## Fitur Utama dan Teknologi

- **Sistem Gamifikasi**
  - Pencatatan aksi lingkungan, validasi lokasi otomatis (geotagging).
  - Poin dan tantangan harian (Daily Challenge) untuk mendorong partisipasi rutin.
  - Papan peringkat (Leaderboard) baik individu maupun provinsi.
  - Backend: Supabase (PostgreSQL) untuk penyimpanan data, Next.js API Routes untuk logika dan validasi, frontend dengan Next.js (React).

- **Profil & Riwayat Aktivitas**
  - Setiap pengguna memiliki profil digital dengan total poin, jejak aktivitas, dan ranking.
  - Fitur kunjungi profil pengguna lain untuk transparansi dan inspirasi.
  - Data terintegrasi melalui Supabase.

- **Berbagi ke Media Sosial**
  - Sistem secara otomatis menghasilkan gambar vertikal (rasio 9:16) yang memuat ringkasan aksi dan siap dibagikan.
  - Implementasi: pembuatan gambar dilakukan di server dengan integrasi Next.js dan Supabase Storage.

- **Chatbot AI "Greena"**
  - Asisten virtual edukatif berbasis Google Gemini 1.5 Flash.
  - Percakapan real-time diproses melalui Vercel AI SDK dan endpoint API khusus.

- **Heatmap & Laporan Dampak**
  - Peta interaktif yang memvisualisasikan akumulasi aksi per provinsi.
  - Fitur unduh laporan rekap data dalam format PDF atau CSV untuk kebutuhan analisis dan kebijakan.
  - Data aggregasi dan visualisasi dijalankan melalui query ke Supabase dan proses frontend dengan Next.js.

- **Registrasi dan Login Aman**
  - Sistem otentikasi menggunakan Clerk untuk registrasi, login, dan manajemen sesi pengguna.
  - Integrasi dengan database internal untuk sinkronisasi identitas dan data pengguna.

## Tech Stack

- **Bahasa Pemrograman:** TypeScript
- **Framework Frontend & Backend:** Next.js (React)  
- **Styling:** Tailwind CSS
- **Database & Storage:** Supabase (PostgreSQL, Storage, Realtime)
- **Otentikasi:** Clerk
- **AI Chatbot & Integrasi:** Google Gemini 1.5 Flash (melalui Vercel AI SDK)
- **Deployment:** Vercel
- **Source Control:** GitHub

## Lisensi

Dikembangkan oleh tim RPL Season 2.  
Lisensi: [MIT](./LICENSE)

GreenActify membantu mengubah aksi hijau menjadi gaya hidup dan komunitas digital.
