// src/hooks/useDashboard.ts
import { apiGet } from '@/lib/api';
import type { Dashboard } from '@/types/api';
import useSWR, { mutate } from 'swr';

export const dashboardKey = (base_ccy: 'USD' | 'TWD', window = '1M') =>
  `/api/dashboard?base_ccy=${base_ccy}&window=${window}`;

export function useDashboard(base_ccy: 'USD' | 'TWD' = 'TWD', window = '1M') {
  const key = dashboardKey(base_ccy, window);
  const { data, error, isLoading } = useSWR<Dashboard>(key, apiGet, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  return { dashboard: data, isLoading, error, key };
}

export async function refreshDashboard(base_ccy: 'USD' | 'TWD', window = '1M') {
  await mutate(dashboardKey(base_ccy, window));
}
