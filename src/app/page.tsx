import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default async function HomePage() {
  const { userId } = await auth()

  if (userId) {
    redirect('/beranda')
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-3xl font-bold">Selamat Datang di GreenActify 👋</h1>
        <p className="text-gray-500 mt-2">
          Silakan login atau daftar untuk mulai menyelamatkan bumi.
        </p>
      </main>
    </div>
  )
}
