import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'portal-rafiqui-app',
    environment: (globalThis as any).process?.env?.NODE_ENV || 'unknown',
  });
}
