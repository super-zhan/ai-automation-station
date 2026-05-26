// Confirm payment and create OneAPI user + token
// Called when user clicks "我已付款" in the checkout page

import { NextRequest, NextResponse } from 'next/server';
import { API_PLANS } from '@/lib/i18n/api-plans';

// OneAPI admin endpoint
const ONEAPI_BASE = 'http://127.0.0.1:3001';
const ADMIN_USER = 'root';
const ADMIN_PASS = 'zidongAI2026!'; // IMPORTANT: keep in sync with actual password

const ORDERS_FILE = process.cwd() + '/data/orders.json';

interface Order {
  order_id: string;
  plan: string;
  email: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'paid' | 'expired';
  created_at: string;
  paid_at?: string;
  is_api_plan?: boolean;
  api_key?: string;
  oneapi_user_id?: number;
}

async function readOrders(): Promise<Order[]> {
  const fs = await import('fs');
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');
  const dir = path.dirname(ORDERS_FILE);
  const fsMod = fs as typeof import('fs');
  if (!fsMod.existsSync(dir)) {
    fsMod.mkdirSync(dir, { recursive: true });
  }
  fsMod.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// Get OneAPI admin session cookie
async function getOneApiSession(): Promise<string> {
  const res = await fetch(`${ONEAPI_BASE}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  const cookies = res.headers.getSetCookie();
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  if (!sessionCookie) throw new Error('Failed to get OneAPI session');
  return sessionCookie.split(';')[0].replace('session=', '');
}

// Create OneAPI user and token, return the API key
async function createOneApiUser(email: string, quota: number, planId: string): Promise<{ userId: number; apiKey: string }> {
  const session = await getOneApiSession();
  const username = `u${Math.random().toString(36).substring(2, 10)}`; // 8 chars, well under 11 limit
  const password = Math.random().toString(36).substring(2, 14); // 12 chars, well under 19 limit

  // 1. Create user
  const createRes = await fetch(`${ONEAPI_BASE}/api/user/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `session=${session}`,
    },
    body: JSON.stringify({
      username,
      display_name: email,
      password,
      quota, // in OneAPI credit units
      group: 'default',
    }),
  });
  const createData = await createRes.json();
  if (!createData.success) throw new Error('Failed to create user: ' + (createData.message || 'unknown'));

  // 2. Find the created user's ID
  const listRes = await fetch(`${ONEAPI_BASE}/api/user/`, {
    headers: { Cookie: `session=${session}` },
  });
  const listData = await listRes.json();
  if (!listData.success) throw new Error('Failed to list users');

  const newUser = listData.data.find((u: any) => u.username === username);
  if (!newUser) throw new Error('Created user not found');

  const userId = newUser.id;

  // 3. Create a token for this user
  const tokenRes = await fetch(`${ONEAPI_BASE}/api/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `session=${session}`,
    },
    body: JSON.stringify({
      user_id: userId,
      name: `${planId} plan - ${email}`,
      remain_quota: quota,
      unlimited_quota: false,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.success) throw new Error('Failed to create token: ' + (tokenData.message || 'unknown'));

  return { userId, apiKey: tokenData.data.key };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, plan: planId, email, is_api_plan } = body;

    if (!order_id || !email) {
      return NextResponse.json({ success: false, message: '参数不完整' });
    }

    // Read and update order
    const orders = await readOrders();
    const orderIndex = orders.findIndex(o => o.order_id === order_id);
    if (orderIndex === -1) {
      return NextResponse.json({ success: false, message: '订单不存在' });
    }

    const order = orders[orderIndex];
    if (order.status === 'paid') {
      // Already activated - return the existing API key if available
      return NextResponse.json({
        success: true,
        api_key: order.api_key || null,
        already_paid: true,
        message: '该订单已激活',
      });
    }

    // For API plans: create OneAPI user + token
    if (is_api_plan) {
      const apiPlan = API_PLANS.find(p => p.id === planId);
      if (!apiPlan) {
        return NextResponse.json({ success: false, message: '无效的套餐' });
      }

      // The quota in OneAPI is token count (1 quota = 1 token for most models)
      const quota = apiPlan.tokens;

      try {
        const result = await createOneApiUser(email, quota, planId);

        // Update order status
        orders[orderIndex].status = 'paid';
        orders[orderIndex].paid_at = new Date().toISOString();
        orders[orderIndex].api_key = result.apiKey;
        orders[orderIndex].oneapi_user_id = result.userId;
        await writeOrders(orders);

        return NextResponse.json({
          success: true,
          api_key: result.apiKey,
          user_id: result.userId,
          tokens: quota,
          endpoint: `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost'}/v1/chat/completions`,
        });
      } catch (err: any) {
        console.error('OneAPI user creation failed:', err);
        return NextResponse.json({
          success: false,
          message: '系统激活失败，请联系客服手动处理（订单号: ' + order_id + '）',
        });
      }
    }

    // For subscription plans - just mark as paid
    orders[orderIndex].status = 'paid';
    orders[orderIndex].paid_at = new Date().toISOString();
    await writeOrders(orders);

    return NextResponse.json({
      success: true,
      message: '订阅已激活',
    });
  } catch (err) {
    console.error('Confirm payment error:', err);
    return NextResponse.json({ success: false, message: '服务器内部错误' }, { status: 500 });
  }
}
