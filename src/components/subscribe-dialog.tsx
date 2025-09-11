'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

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
  apiBase?: string;
  onSubscribed?: (resp: any) => void;
}) {
  const [webhook, setWebhook] = useState('');
  const [freq, setFreq] = useState<Frequency>('weekly');
  const [tz, setTz] = useState(defaultTimezone);
  const [hour, setHour] = useState(defaultHour);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setTz(defaultTimezone);
    setHour(defaultHour);
  }, [defaultTimezone, defaultHour]);

  const valid = isDiscordWebhook(webhook) && hour >= 0 && hour <= 23;

  async function submit() {
    if (!valid) {
      setMsg('請輸入有效的 Webhook 與小時(0–23)');
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
        portfolio_id: portfolioId,
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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscribe Report (Discord)</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="mb-1 text-sm text-neutral-600">Discord Webhook</div>
            <Input
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
            />
            <p className="mt-1 text-xs text-neutral-500">
              僅接受 discord.com / discordapp.com 網域。
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="mb-1 text-sm text-neutral-600">Frequency</div>
              <Select value={freq} onValueChange={(v) => setFreq(v as Frequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="mb-1 text-sm text-neutral-600">Timezone</div>
              <Input value={tz} onChange={(e) => setTz(e.target.value)} placeholder="Asia/Taipei" />
            </div>

            <div>
              <div className="mb-1 text-sm text-neutral-600">Hour (0–23)</div>
              <Input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <div className={`mr-auto text-sm ${valid ? 'text-neutral-600' : 'text-red-600'}`}>
            {msg}
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid || loading} onClick={submit}>
            {loading ? 'Submitting…' : 'Subscribe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
