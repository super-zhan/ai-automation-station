// Payment temporarily disabled
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  return new NextResponse('fail', { status: 200 });
}
