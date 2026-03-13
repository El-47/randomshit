import { NextResponse } from 'next/server';
import { mockApiResponse } from '@/utils/mockApiResponse';

export async function GET() {
  return NextResponse.json(mockApiResponse);
}
