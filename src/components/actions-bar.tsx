'use client';

import SubscribeDialog from '@/components/subscribe-dialog';
import React from 'react';

export default function ActionsBar({
  portfolioId,
  defaultTimezone = 'Asia/Taipei',
  apiBase = '',
}: {
  portfolioId?: number;
  defaultTimezone?: string;
  apiBase?: string; // 例如 '' (同網域) 或 'http://localhost:8000'
}) {
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string>('');

  return (
    <div className="flex justify-end gap-2">
      <button
        className="rounded-lg border px-4 py-2"
        onClick={() => setToast('💾（示範）這裡接 Save Portfolio API')}
      >
        Save Portfolio
      </button>
      <button
        className="rounded-lg border px-4 py-2"
        onClick={() => setToast('🧾（示範）這裡接 Generate Report API')}
      >
        Generate Report
      </button>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-black px-4 py-2 text-white">
        Subscribe (Discord)
      </button>

      {open && (
        <SubscribeDialog
          open={open}
          onClose={() => setOpen(false)}
          portfolioId={portfolioId}
          defaultTimezone={defaultTimezone}
          apiBase={apiBase}
          onSubscribed={() => setToast('✅ 訂閱已建立')}
        />
      )}

      {toast && (
        <div
          className="fixed right-4 bottom-4 rounded-lg bg-black px-3 py-2 text-sm text-white shadow"
          onAnimationEnd={() => setToast('')}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
