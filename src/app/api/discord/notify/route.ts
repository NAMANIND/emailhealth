import { NextRequest, NextResponse } from 'next/server';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1504093606124847158/2EZdCrTOUG4urfWX0gUpDYU_EBs7enmxulkhNt5vZ2_nGLwFWNwQCmw_Ge1qjn0bUz1Q';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const content = body.content || 'Hi! 👋 This is an automated message from Roger Sheet';
    const username = body.username || 'Roger Sheet Bot';

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        username,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to send Discord notification' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'Hi! 👋 This is an automated message from Roger Sheet',
        username: 'Roger Sheet Bot',
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to send Discord notification' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
