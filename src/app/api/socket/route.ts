import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'WebSocket server is running. Connect using Socket.IO client.',
  });
}