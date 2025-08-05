import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function useProvinces() {
  return useSWR('/api/provinces', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour
    focusThrottleInterval: 60000, // 1 minute
  });
}

export function useStats() {
  return useSWR('/api/stats', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
  });
}

export function useProvinceStats() {
  return useSWR('/api/province-bare', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 minutes
  });
}