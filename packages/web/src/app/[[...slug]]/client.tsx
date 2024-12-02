'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const App = dynamic(() => import('../../components/App'), { ssr: false });

const queryClient = new QueryClient();

export function ClientOnly() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
