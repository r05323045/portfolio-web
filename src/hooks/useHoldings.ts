import { apiDel, apiGet, apiPost } from '@/lib/api';
import type { HoldingIn, HoldingsList } from '@/types/api';
import useSWR, { mutate } from 'swr';

export function useHoldings() {
  const { data, error, isLoading } = useSWR<HoldingsList>('/api/holdings', apiGet);
  return { holdings: data?.items ?? [], isLoading, error };
}

export async function createHolding(input: HoldingIn) {
  await apiPost<{ id: string }>('/api/holdings', input);
  await mutate('/api/holdings'); // 重新抓
}

export async function deleteHolding(id: string) {
  await apiDel(`/api/holdings/${id}`);
  await mutate('/api/holdings');
}
