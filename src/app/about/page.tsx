'use client';

import { Zap, Mail, Globe } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function AboutPage() {
  const { t } = useTranslation();

  const goalItems = [
    t('about.goalItems.0'),
    t('about.goalItems.1'),
    t('about.goalItems.2'),
    t('about.goalItems.3'),
  ];

  const stackItems = [
    t('about.stackItems.0'),
    t('about.stackItems.1'),
    t('about.stackItems.2'),
    t('about.stackItems.3'),
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
          <Zap className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <h1 className="text-3xl font-bold mb-3">{t('about.title')}</h1>
        <p className="text-[var(--text-muted)]">{t('about.sub')}</p>
      </div>

      <div className="prose max-w-none">
        <h2>{t('about.whoTitle')}</h2>
        <p>{t('about.whoDesc')}</p>

        <h2>{t('about.goalTitle')}</h2>
        <p>提供完全免费的 AI 在线工具，让任何人都能：</p>
        <ul>
          {goalItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t('about.philosophyTitle')}</h2>
        <p>
          <strong>{t('about.philosophy.0.label')}</strong> — {t('about.philosophy.0.desc')}<br />
          <strong>{t('about.philosophy.1.label')}</strong> — {t('about.philosophy.1.desc')}<br />
          <strong>{t('about.philosophy.2.label')}</strong> — {t('about.philosophy.2.desc')}
        </p>

        <h2>{t('about.stackTitle')}</h2>
        <p>{t('about.stackDesc')}</p>
        <ul>
          {stackItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t('about.contactTitle')}</h2>
        <p>{t('about.contactDesc')}</p>
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-[var(--primary)]" />
            <a href="mailto:contact@zidongai.com.cn" className="text-[var(--primary)] hover:underline">
              contact@zidongai.com.cn
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Globe className="w-4 h-4 text-[var(--primary)]" />
            <a href="https://github.com/super-zhan" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
              github.com/super-zhan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
