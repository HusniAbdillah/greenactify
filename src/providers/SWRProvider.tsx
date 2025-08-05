'use client';

import { SWRConfig } from 'swr';
import React from 'react';

interface SWRProviderProps {
  children: React.ReactNode;
}

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  return res.json();
};

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        dedupingInterval: 10000,
        errorRetryCount: 1,
        shouldRetryOnError: false,
        provider: () => {
          return new Map();
        }
      }}
    >
      {children}
    </SWRConfig>
  );
}