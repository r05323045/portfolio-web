'use client';

import React from 'react';
import SubscribeDialog from '@/components/subscribe-dialog';

export default function ActionsBar({
  portfolioId,
  defaultTimezone = 'Asia/Taipei',
  apiBase = '',
}:{
  portfolioId?: number;
  defaultTimezone?: string;
  apiBase?: string; // 例如 '' (同網域) 或 'http://localhost:8000'
}) {
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string>('');

  return (
    <div className="flex gap-2 justify-end">
      <button className="rounded-lg px-4 py-2 border" onClick={() => setToast('💾（示範）這裡接 Save Portfolio API')}>
        Save Portfolio
      </button>
      <button className="rounded-lg px-4 py-2 border" onClick={() => setToast('🧾（示範）這裡接 Generate Report API')}>
        Generate Report
      </button>
      <button onClick={()=>setOpen(true)} className="rounded-lg px-4 py-2 bg-black text-white">
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
        <div className="fixed bottom-4 right-4 bg-black text-white text-sm rounded-lg px-3 py-2 shadow" onAnimationEnd={()=>setToast('')}>
          {toast}
        </div>
      )}
    </div>
  );
}
