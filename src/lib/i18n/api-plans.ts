// API token plans for resale
// All prices in USD (target: overseas users)
export interface ApiPlan {
  id: string;
  name: string;
  nameEn: string;
  price: number;        // USD
  priceCny: number;     // CNY (for QR code reference)
  tokens: number;       // token quota
  desc: string;
  descEn: string;
  features: string[];
  featuresEn: string[];
  popular?: boolean;
}

export const API_PLANS: ApiPlan[] = [
  {
    id: 'starter',
    name: '入门版',
    nameEn: 'Starter',
    price: 4.99,
    priceCny: 35,
    tokens: 5_000_000,
    desc: '适合个人测试和小项目',
    descEn: 'For personal testing and small projects',
    features: [
      '5,000,000 tokens 配额',
      'OpenAI 兼容 API 接口',
      'DeepSeek V4 Flash 模型',
      '7天有效，可续费',
    ],
    featuresEn: [
      '5,000,000 token quota',
      'OpenAI-compatible API',
      'DeepSeek V4 Flash model',
      'Valid for 7 days, renewable',
    ],
  },
  {
    id: 'popular',
    name: '标准版',
    nameEn: 'Standard',
    price: 19.99,
    priceCny: 140,
    tokens: 30_000_000,
    desc: '适合个人开发者和中度使用',
    descEn: 'For individual developers and moderate usage',
    features: [
      '30,000,000 tokens 配额',
      'OpenAI 兼容 API 接口',
      'DeepSeek V4 Flash + Pro 模型',
      '30天有效，可续费',
      '邮件技术支持',
    ],
    featuresEn: [
      '30,000,000 token quota',
      'OpenAI-compatible API',
      'DeepSeek V4 Flash + Pro models',
      'Valid for 30 days, renewable',
      'Email support',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: '专业版',
    nameEn: 'Pro',
    price: 49.99,
    priceCny: 350,
    tokens: 100_000_000,
    desc: '适合团队和重量级使用',
    descEn: 'For teams and heavy usage',
    features: [
      '100,000,000 tokens 配额',
      'OpenAI 兼容 API 接口',
      '所有可用模型',
      '90天有效，可续费',
      '优先技术支持',
    ],
    featuresEn: [
      '100,000,000 token quota',
      'OpenAI-compatible API',
      'All available models',
      'Valid for 90 days, renewable',
      'Priority support',
    ],
  },
  {
    id: 'ultra',
    name: '旗舰版',
    nameEn: 'Ultra',
    price: 199.99,
    priceCny: 1400,
    tokens: 500_000_000,
    desc: '适合企业和批量调用',
    descEn: 'For enterprise and high-volume usage',
    features: [
      '500,000,000 tokens 配额',
      'OpenAI 兼容 API 接口',
      '所有模型 + 优先调用',
      '365天有效，可续费',
      '专属技术支持',
    ],
    featuresEn: [
      '500,000,000 token quota',
      'OpenAI-compatible API',
      'All models + priority routing',
      'Valid for 365 days, renewable',
      'Dedicated support',
    ],
  },
];
