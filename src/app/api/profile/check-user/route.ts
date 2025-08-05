import { NextResponse } from 'next/server';
import { checkUser } from '@/lib/check-user';

export async function POST() {
  try {
    const user = await checkUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,

      created: false 
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}