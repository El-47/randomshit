import { NextResponse } from 'next/server';

const ANALYZE_API_URL = 'http://localhost:8000/analyze';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid analysis payload' },
        { status: 400 },
      );
    }

    const response = await fetch(ANALYZE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: 'Failed to fetch analysis from agent council service',
          details: errorText,
          status: response.status,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Agent council API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching analysis data' },
      { status: 500 },
    );
  }
}
