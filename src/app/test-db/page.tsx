'use client'

import { useProfile, useLeaderboard, useActivityCategories } from '@/hooks/useSupabase'
import { useEffect, useState } from 'react'

interface DiagnosticData {
  supabaseUrl?: string
  hasSupabaseKey: boolean
  supabaseKeyLength?: number
  nodeEnv?: string
  connectionTest?: {
    status: number
    ok: boolean
    statusText: string
  }
}

export default function TestDB() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticData>({
    hasSupabaseKey: false
  })
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  
  const { profile, loading: profileLoading, error: profileError } = useProfile()
  const { users, provinces, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard()
  const { categories, loading: categoriesLoading, error: categoriesError } = useActivityCategories()

  useEffect(() => {
    const runDiagnostics = async () => {
      // Environment diagnostics
      const envDiagnostics: DiagnosticData = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
        nodeEnv: process.env.NODE_ENV,
      }
      
      console.log('🔧 Environment Diagnostics:', envDiagnostics)
      setDiagnostics(envDiagnostics)

      // Test manual connection
      if (envDiagnostics.supabaseUrl && envDiagnostics.hasSupabaseKey) {
        setIsTestingConnection(true)
        try {
          const response = await fetch(`${envDiagnostics.supabaseUrl}/rest/v1/`, {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Content-Type': 'application/json'
            }
          })
          
          const connectionResult = {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          }
          
          console.log('🌐 Manual connection test:', connectionResult)
          setDiagnostics(prev => ({ ...prev, connectionTest: connectionResult }))
        } catch (err) {
          console.error('❌ Manual connection failed:', err)
          setDiagnostics(prev => ({ 
            ...prev, 
            connectionTest: { status: 0, ok: false, statusText: 'Network Error' }
          }))
        }
        setIsTestingConnection(false)
      }
    }

    runDiagnostics()
  }, [])

  const StatusCard = ({ title, status, count, data, error }: {
    title: string
    status: 'success' | 'failed' | 'loading'
    count?: number
    data: unknown
    error?: string | null
  }) => (
    <div className="border rounded-lg shadow-sm bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'success' ? 'bg-green-100 text-green-800' :
            status === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status === 'success' ? `✅ Success${count !== undefined ? ` (${count})` : ''}` :
             status === 'failed' ? '❌ Failed' :
             '⏳ Loading...'}
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
      <div className="p-4">
        <pre className="text-xs bg-black-100 p-3 rounded overflow-auto max-h-40">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )

  const isLoading = profileLoading || leaderboardLoading || categoriesLoading

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Connection Test</h1>
          <p className="text-gray-600">Testing Supabase integration and data fetching</p>
        </div>

        {/* Environment Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🔧 Environment Variables
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Supabase URL:</span>
                <span className={diagnostics.supabaseUrl ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.supabaseUrl ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">API Key:</span>
                <span className={diagnostics.hasSupabaseKey ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.hasSupabaseKey ? `✅ Set (${diagnostics.supabaseKeyLength} chars)` : '❌ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Environment:</span>
                <span className="text-blue-600">{diagnostics.nodeEnv || 'Unknown'}</span>
              </div>
            </div>
            {diagnostics.supabaseUrl && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                <strong>URL:</strong> {diagnostics.supabaseUrl}
              </div>
            )}
          </div>

          <div className="bg-black rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🌐 Connection Status
            </h2>
            {isTestingConnection ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Testing connection...</span>
              </div>
            ) : diagnostics.connectionTest ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={diagnostics.connectionTest.ok ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.connectionTest.ok ? '✅ Connected' : '❌ Failed'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">HTTP Status:</span>
                  <span>{diagnostics.connectionTest.status} - {diagnostics.connectionTest.statusText}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No connection test performed</p>
            )}
          </div>
        </div>

        {/* Data Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data from database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusCard
              title="User Profile"
              status={profile ? 'success' : 'failed'}
              data={profile || 'No profile data'}
              error={profileError}
            />
            
            <StatusCard
              title="Top Users Leaderboard"
              status={users.length > 0 ? 'success' : 'failed'}
              count={users.length}
              data={users.length > 0 ? users.slice(0, 3) : 'No users found'}
              error={leaderboardError}
            />
            
            <StatusCard
              title="Province Leaderboard"
              status={provinces.length > 0 ? 'success' : 'failed'}
              count={provinces.length}
              data={provinces.length > 0 ? provinces.slice(0, 3) : 'No provinces found'}
              error={leaderboardError}
            />
            
            <StatusCard
              title="Activity Categories"
              status={categories.length > 0 ? 'success' : 'failed'}
              count={categories.length}
              data={categories.length > 0 ? categories.slice(0, 3) : 'No categories found'}
              error={categoriesError}
            />
          </div>
        )}

        {/* Summary */}
        <div className="bg-black rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Test Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {diagnostics.connectionTest?.ok ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Connection</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {profile ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Profile</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {users.length + provinces.length}
              </div>
              <div className="text-sm text-gray-600">Leaderboard Items</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}