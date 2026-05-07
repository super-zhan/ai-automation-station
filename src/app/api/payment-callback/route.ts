import { NextRequest, NextResponse } from 'next/server';

const ORDERS_FILE = process.cwd() + '/data/orders.json';
const XH_APPKEY = process.env.XUNHUPAY_APPKEY || '';

async function readOrders(): Promise<any[]> {
  const fs = await import('fs');
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeOrders(orders: any[]): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');
  const dir = path.dirname(ORDERS_FILE);
  if (!(fs as typeof import('fs')).existsSync(dir)) {
    (fs as typeof import('fs')).mkdirSync(dir, { recursive: true });
  }
  (fs as typeof import('fs')).writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      params[key] = value.toString();
    }

    console.log('Payment callback received:', JSON.stringify(params));

    // Verify signature
    const hash = params['hash'] || '';
    delete params['hash'];

    const signStr = Object.entries(params)
      .filter(([_, v]) => v)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&') + `&key=${XH_APPKEY}`;

    const crypto = await import('crypto');
    const expectedHash = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();

    if (hash !== expectedHash) {
      console.error('Payment callback: invalid signature');
      return new NextResponse('fail', { status: 200 });
    }

    // Check if payment was successful
    if (params['status'] === 'OD') {
      const tradeOrderId = params['trade_order_id'];
      const orders = await readOrders();
      const orderIndex = orders.findIndex((o: any) => o.order_id === tradeOrderId);

      if (orderIndex !== -1 && orders[orderIndex].status !== 'paid') {
        orders[orderIndex].status = 'paid';
        orders[orderIndex].paid_at = new Date().toISOString();
        orders[orderIndex].transaction_id = params['transaction_id'];
        await writeOrders(orders);
        console.log(`Order ${tradeOrderId} marked as paid`);
      }
    }

    // xunhupay expects "success" response
    return new NextResponse('success', { status: 200 });
  } catch (err) {
    console.error('Payment callback error:', err);
    return new NextResponse('fail', { status: 200 });
  }
}
