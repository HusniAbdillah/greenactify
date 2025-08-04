import { NextRequest, NextResponse } from 'next/server';
import { getTodayChallenge, getRandomChallenges, updateChallengeDate, supabase } from '@/lib/supabase-client';
import { DailyChallenge } from '@/lib/types/supabase';

function transformChallenge(dbChallenge: DailyChallenge | null) {
  if (!dbChallenge) return null;

  const now = new Date();
  const indonesianTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const endOfDay = new Date(indonesianTime);
  endOfDay.setHours(23, 59, 59, 999);
  const hoursRemaining = Math.max(0, Math.floor((endOfDay.getTime() - indonesianTime.getTime()) / (1000 * 60 * 60)));

  let instructions = [];
  if (dbChallenge.instructions) {
    try {
      instructions = typeof dbChallenge.instructions === 'string'
        ? JSON.parse(dbChallenge.instructions)
        : dbChallenge.instructions;
    } catch {
      instructions = [dbChallenge.instructions];
    }
  }

  return {
    id: dbChallenge.id,
    title: dbChallenge.title || 'Tantangan Harian',
    description: dbChallenge.description || 'Selesaikan tantangan ini untuk mendapatkan poin',
    icon: dbChallenge.icon || '🌱',
    double_points: dbChallenge.double_points || 50,
    category: dbChallenge.category_id || 'general',
    difficulty: dbChallenge.difficulty || 'medium',
    expires_at: endOfDay,
    instructions: Array.isArray(instructions) ? instructions : [
      'Lakukan aktivitas sesuai tantangan',
      'Ambil foto sebagai bukti',
      'Upload ke sistem untuk verifikasi'
    ],
    tips: 'Selesaikan tantangan ini untuk berkontribusi pada lingkungan!',
    hoursRemaining,
    isActive: dbChallenge.is_active !== false && hoursRemaining > 0
  };
}

export async function GET(request: NextRequest) {
  try {
    let dbChallenges = [];

    const now = new Date();
    const indonesianTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const today = indonesianTime.toISOString().split('T')[0];

    const { data: existingChallenges, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('date', today);

    if (!error && existingChallenges && existingChallenges.length > 0) {
      dbChallenges = existingChallenges;
    } else {
      const randomChallenges = await getRandomChallenges(3);

      if (randomChallenges.length > 0) {
        const updatePromises = randomChallenges.map(async (challenge: any) => {
          const updateSuccess = await updateChallengeDate(challenge.id, today);

          if (updateSuccess) {
            return {
              ...challenge,
              date: today
            };
          } else {
            return null;
          }
        });

        const results = await Promise.all(updatePromises);
        dbChallenges = results.filter((challenge: any) => challenge !== null);
      }
    }

    if (dbChallenges.length === 0) {
      const defaultChallenge = {
        id: 0,
        title: '🌱 Kurangi Sampah Plastik',
        description: 'Upload foto aktivitas mengurangi penggunaan plastik sekali pakai',
        icon: '🌱',
        points: 50,
        double_points: 100,
        category: 'reduce_waste',
        difficulty: 'easy' as const,
        expires_at: new Date(new Date().setHours(23, 59, 59, 999)),
        instructions: [
          'Gunakan tumbler atau botol minum sendiri',
          'Bawa tas belanja dari rumah',
          'Hindari penggunaan sedotan plastik',
          'Ambil foto bukti aktivitas Anda'
        ],
        tips: 'Mulai dari hal kecil yang bisa dilakukan sehari-hari!',
        hoursRemaining: (() => {
          const now = new Date();
          const indonesianTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours for WIB
          const endOfDay = new Date(indonesianTime);
          endOfDay.setHours(23, 59, 59, 999);
          return Math.max(0, Math.floor((endOfDay.getTime() - indonesianTime.getTime()) / (1000 * 60 * 60)));
        })(),
        isActive: true
      };

      return NextResponse.json({
        success: true,
        data: [defaultChallenge]
      });
    }

    const transformedChallenges = dbChallenges
      .map((challenge: any) => transformChallenge(challenge))
      .filter((challenge): challenge is NonNullable<typeof challenge> => challenge !== null);

    return NextResponse.json({
      success: true,
      data: transformedChallenges
    });
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch daily challenge'
      },
      { status: 500 }
    );
  }
}

// POST endpoint to complete a challenge (for future implementation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challengeId, userId, proof } = body;

    // TODO: Implement challenge completion logic
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: 'Challenge completed successfully!',
      pointsEarned: 50
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete challenge'
      },
      { status: 500 }
    );
  }
}
