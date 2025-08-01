import { NextRequest, NextResponse } from 'next/server';
import { getTodayChallenge, getRandomChallenges, updateChallengeDate, supabase } from '@/lib/supabase-client';
import { DailyChallenge } from '@/lib/types/supabase';

// Function to transform database challenge to expected format
function transformChallenge(dbChallenge: DailyChallenge | null) {
  if (!dbChallenge) return null;

  // Calculate hours remaining until end of day
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const hoursRemaining = Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60)));

  // Parse instructions from string to array if it's a string
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
    id: parseInt(dbChallenge.id) || 0,
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
    // Get today's challenge from database
    let dbChallenges = [];
    const today = new Date().toISOString().split('T')[0];

    // Check if there are already challenges for today
    const { data: existingChallenges, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('date', today);

    if (!error && existingChallenges && existingChallenges.length > 0) {
      dbChallenges = existingChallenges;
      console.log(`Found ${dbChallenges.length} existing challenges for today`);
    } else {
      console.log('No challenges found for today, selecting 3 random challenges...');

      // Get 3 random challenges that don't have today's date
      const randomChallenges = await getRandomChallenges(3);

      if (randomChallenges.length > 0) {
        // Update all challenges to today's date
        const updatePromises = randomChallenges.map(async (challenge: any, index: number) => {
          console.log(`Attempting to set challenge ${challenge.id} (${challenge.title}) as today's challenge #${index + 1}`);

          const updateSuccess = await updateChallengeDate(challenge.id, today);

          if (updateSuccess) {
            console.log(`Successfully updated challenge ${challenge.id} to today's date`);
            return {
              ...challenge,
              date: today
            };
          } else {
            console.error(`Failed to update challenge ${challenge.id} date`);
            return null;
          }
        });

        const results = await Promise.all(updatePromises);
        dbChallenges = results.filter((challenge: any) => challenge !== null);

        console.log(`Successfully assigned ${dbChallenges.length} challenges to today`);
      } else {
        console.log('No random challenges available in database');
      }
    }

    if (dbChallenges.length === 0) {
      // Return a default challenge if no challenge found and no random challenges available
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
        hoursRemaining: Math.max(0, Math.floor((new Date(new Date().setHours(23, 59, 59, 999)).getTime() - new Date().getTime()) / (1000 * 60 * 60))),
        isActive: true
      };

      return NextResponse.json({
        success: true,
        data: [defaultChallenge]
      });
    }

    // Transform all challenges
    const transformedChallenges = dbChallenges.map((challenge: any) => transformChallenge(challenge)).filter(Boolean);

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
