import { NextResponse } from 'next/server';

const RAG_QUERY_URL = 'http://164.52.193.157/query';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid query payload' },
        { status: 400 },
      );
    }

    const response = await fetch(RAG_QUERY_URL, {
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
          error: 'Failed to query RAG service',
          details: errorText,
          status: response.status,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('RAG query API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error while querying RAG' },
      { status: 500 },
    );
  }
}
