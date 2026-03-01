import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.z.ai/api/paas/v4';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, action, ...params } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: 1001, message: 'API key is required' } },
        { status: 401 }
      );
    }

    let url = API_BASE;
    let method = 'POST';

    if (action === 'generate') {
      url = `${API_BASE}/videos/generations`;
    } else if (action === 'status') {
      url = `${API_BASE}/async-result/${params.taskId}`;
      method = 'GET';
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Accept-Language': 'en-US,en',
    };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(params.body || {}) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Video API error:', error);
    return NextResponse.json(
      { error: { code: 500, message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
