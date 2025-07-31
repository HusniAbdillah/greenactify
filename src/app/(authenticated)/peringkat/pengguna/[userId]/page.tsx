'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Trophy, Activity, Leaf, Droplets,  Recycle, BrushCleaning, Lightbulb, Book, Wheat, Bike, Trees } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  points: number | 0;
  level: number | 0;
  province: string | null;
  city: string | null;
  bio: string | "";
  last_activity_upload: string | null;
  total_activities: number | null;
  created_at: string;
  updated_at: string | null;
  clerk_id: string | null;
  pinned_post: string[] | null;
  rank: number | null;
}

interface ActivityCategory {
  id: string;
  name: string;
  group_category: string;
  points: number;
}

interface UserActivity {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description?: string;
  points: number;
  image_url?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  province?: string;
  city?: string;
  status?: 'pending' | 'approved' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  is_shared?: boolean;
  share_count?: number;
  like_count?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  generated_image_url?: string;
  activity_categories: ActivityCategory;
}

interface CategoryStats {
  daur_ulang_count: number;
  bersih_bersih_count: number;
  hemat_energi_count: number;
  edukasi_lingkungan_count: number;
  hemat_air_count: number;
  makanan_organik_count: number;
  transportasi_hijau_count: number;
  penghijauan_count: number;
}

const UserProfilePage = () => {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${userId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const data = await response.json()
        setProfile(data.data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  const [activities, setActivities] = useState<UserActivity[] | null>(null);
  const [lActivitiesoading, setLoadingActivities] = useState(true);
  const [Activitieserror, setActivitiesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserActivities = async () => {
      try {
        setLoadingActivities(true);
        const res = await fetch(`/api/activities/getAll/${userId}`);
        if (!res.ok) throw new Error('Gagal mengambil aktivitas user');

        const data = await res.json();
        setActivities(data); 
      } catch (err) {
        setActivitiesError(err instanceof Error ? err.message : 'Gagal memuat aktivitas');
      } finally {
        setLoadingActivities(false);
      }
    };

    if (userId) fetchUserActivities();
  }, [userId]);

  // Calculate category statistics
  const calculateCategoryStats = (activities: UserActivity[]): CategoryStats => {
    let daur_ulang_count = 0;
    let bersih_bersih_count = 0;
    let hemat_energi_count = 0;
    let edukasi_lingkungan_count = 0;
    let hemat_air_count = 0;
    let makanan_organik_count = 0;
    let transportasi_hijau_count = 0;
    let penghijauan_count = 0;

    for (const activity of activities) {
      if (activity.activity_categories.group_category === 'Daur Ulang')
        daur_ulang_count += 1;
      else if (activity.activity_categories.group_category === 'Bersih-bersih')
        bersih_bersih_count += 1;
      else if (activity.activity_categories.group_category === 'Hemat Energi')
        hemat_energi_count += 1;
      else if (activity.activity_categories.group_category === 'Edukasi Lingkungan')
        edukasi_lingkungan_count += 1;
      else if (activity.activity_categories.group_category === 'Hemat Air')
        hemat_air_count += 1;
      else if (activity.activity_categories.group_category === 'Makanan Organik')
        makanan_organik_count += 1;
      else if (activity.activity_categories.group_category === 'Transportasi Hijau')
        transportasi_hijau_count += 1;
      else if (activity.activity_categories.group_category === 'Penghijauan')
        penghijauan_count += 1;
    }

    return {
      daur_ulang_count,
      bersih_bersih_count,
      hemat_energi_count,
      edukasi_lingkungan_count,
      hemat_air_count,
      makanan_organik_count,
      transportasi_hijau_count,
      penghijauan_count
    };
  };

  const formatPoints = (points: number) => {
    if (points >= 1000000) {
      return (points / 1000000).toFixed(points % 1000000 === 0 ? 0 : 1) + 'M'
    } else if (points >= 1000) {
      return (points / 1000).toFixed(points % 1000 === 0 ? 0 : 1) + 'k'
    } else {
      return points.toString()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'approved': return 'Disetujui';
      case 'pending': return 'Menunggu';
      case 'rejected': return 'Ditolak';
      default: return 'Unknown';
    }
  };

  if (loading || lActivitiesoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Profile not found
        </div>
      </div>
    )
  }

  if (Activitieserror) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {Activitieserror}
        </div>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Profil Pengguna</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {profile.full_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile.full_name}</h2>
              {profile.username && (
                <p className="text-gray-600">@{profile.username}</p>
              )}
              <div className="flex items-center space-x-2 text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.city || 'Unknown City'}, {profile.province || 'Unknown Province'}</span>
              </div>
            </div>

            {/* Rank Badge */}
            {profile.rank && (
              <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold">
                Peringkat #{profile.rank}
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800">{profile.bio}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <p className="text-gray-500 text-lg">User belum punya aktivitas</p>
        </div>
      </div>
    );
  }

  // Calculate statistics and get recent activities
  const categoryStats = calculateCategoryStats(activities);
  const recentActivities = activities.slice(0, 3);

  const categoryData = [
    { name: 'Daur Ulang', count: categoryStats.daur_ulang_count, icon: Recycle, color: 'bg-emerald-500', bgColor: 'bg-green-50' },
    { name: 'Bersih-bersih', count: categoryStats.bersih_bersih_count, icon: BrushCleaning, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { name: 'Hemat Energi', count: categoryStats.hemat_energi_count, icon: Lightbulb, color: 'bg-amber-500', bgColor: 'bg-yellow-50' },
    { name: 'Edukasi Lingkungan', count: categoryStats.edukasi_lingkungan_count, icon: Book, color: 'bg-purple-500', bgColor: 'bg-purple-50' },
    { name: 'Hemat Air', count: categoryStats.hemat_air_count, icon: Droplets, color: 'bg-cyan-500', bgColor: 'bg-cyan-50' },
    { name: 'Makanan Organik', count: categoryStats.makanan_organik_count, icon: Wheat, color: 'bg-lime-500', bgColor: 'bg-emerald-50' },
    { name: 'Transportasi Hijau', count: categoryStats.transportasi_hijau_count, icon: Bike, color: 'bg-indigo-500', bgColor: 'bg-indigo-50' },
    { name: 'Penghijauan', count: categoryStats.penghijauan_count, icon: Trees, color: 'bg-green-500', bgColor: 'bg-teal-50' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Profil Pengguna</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {profile.full_name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profile.full_name}</h2>
            {profile.username && (
              <p className="text-gray-600">@{profile.username}</p>
            )}
            <div className="flex items-center space-x-2 text-gray-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span> {profile.province || 'Unknown Province'}</span>
            </div>
          </div>

          {/* Rank Badge */}
          {profile.rank && (
            <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold">
              Peringkat #{profile.rank}
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{formatPoints(profile.points)}</div>
          <div className="text-sm text-blue-500">Poin</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <Activity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">{profile.total_activities || 0}</div>
          <div className="text-sm text-purple-500">Total Aktivitas</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl text-center">
          <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600">
            {new Date(profile.created_at).getFullYear()}
          </div>
          <div className="text-sm text-orange-500">Bergabung</div>
        </div>
      </div>

      {/* Environmental Impact Statistics */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Leaf className="w-6 h-6 text-green-500 mr-2" />
          Statistik Kontribusi Lingkungan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryData.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.name} className={`${category.bgColor} p-4 rounded-xl text-center`}>
                <IconComponent className={`w-6 h-6 ${category.color.replace('bg-', 'text-')} mx-auto mb-2`} />
                <div className={`text-2xl font-bold ${category.color.replace('bg-', 'text-')}`}>
                  {category.count}
                </div>
                <div className={`text-sm ${category.color.replace('bg-', 'text-').replace('500', '600')}`}>
                  {category.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Activity className="w-6 h-6 text-green-500 mr-2" />
          Aktivitas Terbaru (3 Terakhir)
        </h3>
        
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {/* Activity Image */}
                {(activity.image_url || activity.generated_image_url) && (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={activity.image_url || activity.generated_image_url}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Activity Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 truncate">{activity.title}</h4>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {`${activity.city }, ${activity.province || 'Unknown'}`}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center items-end space-y-2  ">
                      <div className="bg-green-100 text-green-800 px-3 py-1  rounded-full text-sm font-semibold">
                        +{activity.points} poin
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {activity.activity_categories.group_category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage