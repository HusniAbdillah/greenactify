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
  province: string | null;
  last_activity_upload: string | null;
  total_activities: number | null;
  created_at: string;
  updated_at: string | null;
  clerk_id: string | null;
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
  latitude?: number;
  longitude?: number;
  province?: string;
  status?: 'pending' | 'approved' | 'rejected';
  verified_by?: string;
  verified_at?: string;
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
  const userId = params?.userId as string

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
        const res = await fetch(`/api/activities/getById/${userId}`);
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
      case 'approved': return 'bg-oliveSoft text-greenDark';
      case 'pending': return 'bg-yellowAmber text-black';
      case 'rejected': return 'bg-red text-whiteMint';
      default: return 'bg-oliveSoft text-greenDark';
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
      <div className="p-6 bg-mintPastel min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oliveDark mx-auto mb-2"></div>
          <p className="text-greenDark">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-6 bg-mintPastel min-h-screen">
        <div className="bg-red/20 border border-red text-red px-4 py-3 rounded-xl">
          Profile not found
        </div>
      </div>
    )
  }

  if (Activitieserror) {
    return (
      <div className="p-6 bg-mintPastel min-h-screen">
        <div className="bg-red/20 border border-red text-red px-4 py-3 rounded-xl">
          {Activitieserror}
        </div>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto bg-mintPastel min-h-screen">

        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-full bg-whiteGreen hover:bg-oliveSoft transition-colors shadow-md"
          >
            <ArrowLeft className="w-5 h-5 text-greenDark" />
          </button>
          <h1 className="text-2xl font-bold text-greenDark">Profil Pengguna</h1>
        </div>


        <div className="bg-whiteMint rounded-3xl p-8 shadow-xl border border-whiteGreen">
          <div className="flex items-center space-x-6">

            <div className="w-24 h-24 bg-oliveSoft rounded-full overflow-hidden shadow-lg">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-oliveSoft to-greenDark flex items-center justify-center">
                  <span className="text-whiteMint text-2xl font-bold">
                    {profile.full_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-greenDark">{profile.full_name}</h2>
              {profile.username && (
                <p className="text-oliveDark">@{profile.username}</p>
              )}
              <div className="flex items-center space-x-2 text-oliveDark mt-2">
                <MapPin className="w-4 h-4" />
                <span>{profile.province || 'Provinsi tidak diketahui'}</span>
              </div>
            </div>

 
            {profile.rank && (
              <div className="bg-yellowGold text-black px-6 py-3 rounded-full font-bold shadow-md">
                Peringkat #{profile.rank}
              </div>
            )}
          </div>
        </div>

        <div className="bg-whiteMint rounded-3xl p-8 shadow-xl text-center border border-whiteGreen">
          <p className="text-oliveDark text-lg">Pengguna belum punya aktivitas</p>
        </div>
      </div>
    );
  }

  const categoryStats = calculateCategoryStats(activities);
  const recentActivities = activities.slice(0, 3);

  const categoryData = [
    { name: 'Daur Ulang', count: categoryStats.daur_ulang_count, icon: Recycle, color: 'bg-oliveSoft', bgColor: 'bg-whiteGreen' },
    { name: 'Bersih-bersih', count: categoryStats.bersih_bersih_count, icon: BrushCleaning, color: 'bg-tealLight', bgColor: 'bg-mintPastel' },
    { name: 'Hemat Energi', count: categoryStats.hemat_energi_count, icon: Lightbulb, color: 'bg-yellowAmber', bgColor: 'bg-yellowGold/20' },
    { name: 'Edukasi Lingkungan', count: categoryStats.edukasi_lingkungan_count, icon: Book, color: 'bg-oliveDark', bgColor: 'bg-whiteGreen' },
    { name: 'Hemat Air', count: categoryStats.hemat_air_count, icon: Droplets, color: 'bg-tealLight', bgColor: 'bg-mintPastel' },
    { name: 'Makanan Organik', count: categoryStats.makanan_organik_count, icon: Wheat, color: 'bg-oliveSoft', bgColor: 'bg-whiteGreen' },
    { name: 'Transportasi Hijau', count: categoryStats.transportasi_hijau_count, icon: Bike, color: 'bg-darkGreen', bgColor: 'bg-whiteGreen' },
    { name: 'Penghijauan', count: categoryStats.penghijauan_count, icon: Trees, color: 'bg-oliveDark', bgColor: 'bg-mintPastel' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto bg-mintPastel min-h-screen">

      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full bg-whiteGreen hover:bg-oliveSoft transition-colors shadow-md"
        >
          <ArrowLeft className="w-5 h-5 text-greenDark" />
        </button>
        <h1 className="text-2xl font-bold text-greenDark">Profil Pengguna</h1>
      </div>

      

      <div className="bg-whiteMint rounded-3xl p-4 shadow-xl border border-whiteGreen xs:p-6 md:p-8">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-6">

          <div className="w-20 h-20 bg-oliveSoft rounded-full overflow-hidden shadow-lg md:w-24 md:h-24">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-oliveSoft to-greenDark flex items-center justify-center">
                <span className="text-whiteMint text-xl font-bold md:text-2xl">
                  {profile.full_name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-greenDark md:text-2xl">
              {profile.full_name}
            </h2>
            {profile.username && (
              <p className="text-oliveDark text-sm md:text-base">@{profile.username}</p>
            )}
            <div className="flex items-center justify-center space-x-1 text-oliveDark text-sm mt-2 md:justify-start md:space-x-2 md:text-base">
              <MapPin className="w-3 h-3 md:w-4 md:h-4" />
              <span> {profile.province || 'Unknown Province'}</span>
            </div>
          </div>

          {profile.rank && (
            <div className="bg-yellowGold text-black px-4 py-2 rounded-full font-bold text-sm shadow-md md:px-6 md:py-3">
              Peringkat #{profile.rank}
            </div>
          )}
        </div>

      </div>


      
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 md:gap-y-6 md:gap-x-6 justify-center ">
        <div className="bg-tealLight/20 py-6  sm:p-6 rounded-2xl text-center shadow-lg border border-tealLight/30">
          <Trophy className="w-10 h-10 text-tealLight mx-auto mb-3" />
          <div className="text-xl md:text-2xl lg:text-3xl font-bold text-greenDark">{formatPoints(profile.points)}</div>
          <div className="text-xs md:text-sm text-oliveDark">Poin</div>
        </div>

        <div className="bg-oliveSoft/20 py-6  sm:p-6 rounded-2xl text-center shadow-lg border border-oliveSoft/30">
          <Activity className="w-10 h-10 text-oliveDark mx-auto mb-3" />
          <div className="text-xl md:text-2xl lg:text-3xl font-bold text-greenDark">{profile.total_activities || 0}</div>
          <div className="text-xs md:text-sm text-oliveDark">Total Aktivitas</div>
        </div>

        <div className="bg-yellowAmber/20 py-6  sm:p-6 rounded-2xl text-center shadow-lg border border-yellowAmber/30 ">
          <Calendar className="w-10 h-10 text-yellowAmber mx-auto mb-3" />
          <div className="text-xl md:text-2xl lg:text-3xl font-bold text-greenDark">
            {new Date(profile.created_at).getFullYear()}
          </div>
          <div className="text-xs md:text-sm text-oliveDark">Bergabung</div>
        </div>
      </div>

      <div className="bg-whiteMint rounded-3xl p-8 shadow-xl border border-whiteGreen">
        <h3 className="text-2xl font-bold mb-6 flex items-center text-greenDark">
          <Leaf className="w-7 h-7 text-oliveSoft mr-3" />
          Statistik Kontribusi Lingkungan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
          {categoryData.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.name} className={`${category.bgColor} p-3 sm:p-5 rounded-2xl text-center shadow-md border border-${category.color.replace('bg-', '')}/20`}>
                <IconComponent className={`w-8 h-8 ${category.color.replace('bg-', 'text-')} mx-auto mb-3`} />
                <div className={`text-2xl font-bold ${category.color.replace('bg-', 'text-')}`}>
                  {category.count}
                </div>
                <div className="text-xs text-center sm:text-sm text-greenDark font-medium">
                  {category.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-whiteMint rounded-3xl p-8 shadow-xl border border-whiteGreen">
        <h3 className="text-2xl font-bold mb-6 flex items-center text-greenDark">
          <Activity className="w-7 h-7 text-oliveSoft mr-3" />
          Aktivitas Terbaru (3 Terakhir)
        </h3>

        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="group bg-white/80 backdrop-blur-sm border border-whiteGreen/50 rounded-3xl p-4 md:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:bg-white/90"
            >
              <div className="flex flex-col md:flex-row gap-4">
                
                {(activity.image_url || activity.generated_image_url) && (
                  <div className="relative">
                    <div className="w-full md:w-24 h-20 md:h-24 bg-gradient-to-br from-oliveSoft/20 to-tealLight/20 rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={activity.image_url || activity.generated_image_url}
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="absolute -top-2 -right-2 md:hidden">
                      <div className="bg-gradient-to-r from-oliveSoft to-tealLight text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        +{activity.points}
                      </div>
                    </div>
                  </div>
                )}
                
    
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      
                    <div className="flex-1 min-w-0">

                      <div className="mb-3">
                        <h4 className="font-bold text-greenDark text-base md:text-lg leading-tight line-clamp-2">
                          {activity.title}
                        </h4>
                        {activity.description && (
                          <p className="text-sm md:text-base text-oliveDark mt-2 line-clamp-2 leading-relaxed">
                            {activity.description}
                          </p>
                        )}
                      </div>
                       
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-gradient-to-r from-tealLight/20 to-oliveSoft/20 text-greenDark border border-tealLight/40 shadow-sm">
                          {activity.activity_categories.group_category}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-oliveDark">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-tealLight" />
                          <span className="text-xs md:text-sm font-medium">
                            {`${activity.province || 'Unknown'}`}
                          </span>
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-tealLight" />
                          <span className="text-xs md:text-sm font-medium">
                            {formatDate(activity.created_at)}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex flex-col items-end justify-start">
                      <div className="bg-tealLight text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                        +{activity.points} poin
                      </div>
                    </div>

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