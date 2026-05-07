import { NextRequest, NextResponse } from 'next/server';

const ORDERS_FILE = process.cwd() + '/data/orders.json';

// 虎皮椒 (xunhupay) config
const XH_APPID = process.env.XUNHUPAY_APPID || '';
const XH_APPKEY = process.env.XUNHUPAY_APPKEY || '';
const XH_API = 'https://api.xunhupay.com/payment/do.html';

interface Order {
  order_id: string;
  plan: string;
  email: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'paid' | 'expired';
  created_at: string;
  paid_at?: string;
}

// Simple ID generator
function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ZD${ts}${rand}`;
}

// Read orders from file
async function readOrders(): Promise<Order[]> {
  const fs = await import('fs');
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write orders to file
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

// Call xunhupay API to create payment
async function createXunhupayPayment(order: Order): Promise<{ success: boolean; pay_url?: string; qr_url?: string; message?: string }> {
  const params: Record<string, string> = {
    version: '1.1',
    appid: XH_APPID,
    trade_order_id: order.order_id,
    total_fee: order.amount.toString(),
    title: `AI自动化工作站 - ${order.plan === 'pro' ? '专业版' : order.plan}`,
    time: Math.floor(Date.now() / 1000).toString(),
    notify_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://8.210.65.231'}/api/payment-callback`,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://8.210.65.231'}/pricing/checkout?plan=${order.plan}&status=success`,
    callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://8.210.65.231'}/pricing/checkout?plan=${order.plan}&status=callback`,
    nonce_str: Math.random().toString(36).substring(2, 10),
    type: order.payment_method === 'wechat' ? 'WXPay' : 'AliPay',
  };

  // Generate hash signature
  const signStr = Object.entries(params)
    .filter(([_, v]) => v)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&') + `&key=${XH_APPKEY}`;

  const crypto = await import('crypto');
  params['hash'] = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();

  // Call xunhupay API
  try {
    const formBody = new URLSearchParams(params).toString();
    const response = await fetch(XH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formBody,
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Xunhupay response parse failed:', text);
      return { success: false, message: '支付网关返回异常' };
    }

    if (data.errcode === 0) {
      // Return QR code URL
      return { success: true, pay_url: data.url_qr || data.url, qr_url: data.url_qr };
    } else {
      return { success: false, message: data.errmsg || '支付接口请求失败' };
    }
  } catch (err) {
    console.error('Xunhupay API error:', err);
    return { success: false, message: '支付网关连接失败' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, email, payment_method } = body;

    // Validate
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: '请输入有效的邮箱地址' });
    }

    if (plan !== 'pro') {
      return NextResponse.json({ success: false, message: '仅支持专业版（pro）订阅，当前值: ' + plan });
    }

    const amount = plan === 'pro' ? 29 : 0;
    const orderId = generateOrderId();

    const order: Order = {
      order_id: orderId,
      plan,
      email,
      amount,
      payment_method: payment_method || 'alipay',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Save order
    const orders = await readOrders();
    orders.push(order);
    await writeOrders(orders);

    // Try to create payment via xunhupay
    if (XH_APPID && XH_APPKEY) {
      const payResult = await createXunhupayPayment(order);
      if (payResult.success) {
        return NextResponse.json({
          success: true,
          order_id: orderId,
          pay_url: payResult.pay_url,
          amount,
          message: '支付二维码已生成',
        });
      } else {
        // Payment creation failed but order is saved
        return NextResponse.json({
          success: true,
          order_id: orderId,
          pay_url: '',
          amount,
          message: payResult.message || '支付网关暂不可用，请联系客服手动开通',
          manual_mode: true,
        });
      }
    } else {
      // No payment gateway configured - manual mode
      return NextResponse.json({
        success: true,
        order_id: orderId,
        pay_url: '',
        amount,
        message: '支付系统配置中，请联系客服手动开通',
        manual_mode: true,
      });
    }
  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json({ success: false, message: '服务器内部错误' }, { status: 500 });
  }
}
