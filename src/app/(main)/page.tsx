'use client';
import StartInstanceContent from '@/components/start/StartInstanceContent';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <StartInstanceContent />
    </QueryClientProvider>
  );
}
