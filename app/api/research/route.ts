import { NextResponse } from 'next/server';

const CRAWL_API_URL = 'http://164.52.193.157/crawl';

interface ResearchRequestBody {
  question?: string;
  topic_count?: number;
  max_papers?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as ResearchRequestBody;

    const payload = {
      question: (body.question ?? '').trim(),
      topic_count: typeof body.topic_count === 'number' ? body.topic_count : 4,
      max_papers: typeof body.max_papers === 'number' ? body.max_papers : 3,
    };

    if (!payload.question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 },
      );
    }

    const response = await fetch(CRAWL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: 'Failed to fetch research data from crawler service',
          details: errorText,
          status: response.status,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Research API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching research data' },
      { status: 500 },
    );
  }
}
