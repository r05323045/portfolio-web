'use client';

import React, { useEffect, useState } from 'react';

type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

function isDiscordWebhook(url: string) {
  try {
    const u = new URL(url);
    return (
      (u.hostname === 'discord.com' || u.hostname === 'discordapp.com') &&
      u.pathname.startsWith('/api/webhooks/')
    );
  } catch {
    return false;
  }
}

async function postJSON(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}

export default function SubscribeDialog({
  open,
  onClose,
  portfolioId,
  defaultTimezone = 'Asia/Taipei',
  defaultHour = 9,
  apiBase = '',
  onSubscribed,
}: {
  open: boolean;
  onClose: () => void;
  portfolioId?: number;
  defaultTimezone?: string;
  defaultHour?: number;
  apiBase?: string; // 例如 '' (同網域) 或 'http://localhost:8000'
  onSubscribed?: (resp: any) => void;
}) {
  const [webhook, setWebhook] = useState('');
  const [freq, setFreq] = useState<Frequency>('weekly');
  const [tz, setTz] = useState(defaultTimezone);
  const [hour, setHour] = useState(defaultHour);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    setTz(defaultTimezone);
    setHour(defaultHour);
  }, [defaultTimezone, defaultHour]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const valid = isDiscordWebhook(webhook) && hour >= 0 && hour <= 23;

  async function submit() {
    if (!valid) {
      setMsg('請輸入有效的 Discord Webhook 與送達小時 (0–23)。');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const payload = {
        webhook,
        frequency: freq,
        timezone: tz,
        send_hour_local: hour,
        portfolio_id: portfolioId, // 可為 undefined，後端可選擇忽略或驗證
      };
      const resp = await postJSON(`${apiBase}/api/subscriptions`, payload);
      setMsg('✅ 訂閱建立成功');
      onSubscribed?.(resp);
    } catch (e: any) {
      setMsg(`❌ 失敗：${e.message || 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[520px] bg-white rounded-2xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Subscribe Report (Discord)</h3>
          <button onClick={onClose} className="text-neutral-500" aria-label="Close">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Discord Webhook</label>
            <input
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="https://discord.com/api/webhooks/..."
            />
            <p className="text-xs text-neutral-500 mt-1">
              只接受 discord.com / discordapp.com 網域。正式環境建議後端加密儲存。
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Frequency</label>
              <select
                value={freq}
                onChange={(e) => setFreq(e.target.value as Frequency)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-600 mb-1">Timezone</label>
              <input
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Asia/Taipei"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-600 mb-1">Hour (0–23)</label>
              <input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value) || 0)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className={`text-sm ${valid ? 'text-neutral-600' : 'text-red-600'}`}>{msg}</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button
              disabled={!valid || loading}
              onClick={submit}
              className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Subscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
