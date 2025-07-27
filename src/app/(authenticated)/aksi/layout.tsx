import { ReactNode } from 'react'

interface AksiLayoutProps {
  children: ReactNode
}

export default function AksiLayout({ children }: AksiLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/beranda" className="hover:text-green-600">
                Beranda
              </a>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">
              Aksi Hijau
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        {children}
      </div>
    </div>
  )
}