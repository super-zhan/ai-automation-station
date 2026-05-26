// Payment temporarily disabled
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { success: false, message: '支付系统维护中，暂不可用' },
    { status: 503 }
  );
}
