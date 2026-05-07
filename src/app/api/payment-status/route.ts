import { NextRequest, NextResponse } from 'next/server';

const ORDERS_FILE = process.cwd() + '/data/orders.json';

async function readOrders(): Promise<any[]> {
  const fs = await import('fs');
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('order_id');

  if (!orderId) {
    return NextResponse.json({ success: false, message: '缺少订单号' });
  }

  const orders = await readOrders();
  const order = orders.find((o: any) => o.order_id === orderId);

  if (!order) {
    return NextResponse.json({ success: false, paid: false, message: '订单不存在' });
  }

  return NextResponse.json({
    success: true,
    paid: order.status === 'paid',
    status: order.status,
    order_id: orderId,
  });
}
