'use client';

import SubscribeDialog from '@/components/subscribe-dialog';
import { Button } from '@/components/ui/button';
import React from 'react';
import { toast } from 'sonner';

export default function ActionsBar({
  portfolioId,
  defaultTimezone = 'Asia/Taipei',
  apiBase = '',
}: {
  portfolioId?: number;
  defaultTimezone?: string;
  apiBase?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => toast.info('（示範）Save Portfolio API')}>
        Save Portfolio
      </Button>
      <Button variant="outline" onClick={() => toast.info('（示範）Generate Report API')}>
        Generate Report
      </Button>
      <Button onClick={() => setOpen(true)}>Subscribe (Discord)</Button>

      <SubscribeDialog
        open={open}
        onClose={() => setOpen(false)}
        portfolioId={portfolioId}
        defaultTimezone={defaultTimezone}
        apiBase={apiBase}
        onSubscribed={() => toast.success('訂閱已建立')}
      />
    </div>
  );
}
