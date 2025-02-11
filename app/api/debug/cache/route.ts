import { NextResponse } from 'next/server';
import { getCacheStats, invalidateCache } from '@/lib/cache';

export async function GET() {
  try {
    const stats = getCacheStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Cache key is required' },
        { status: 400 }
      );
    }

    invalidateCache(key);
    return NextResponse.json({ message: `Cache invalidated for key: ${key}` });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
} 