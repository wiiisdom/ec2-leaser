import App from './components/App';
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';

// tailwindcss
import './index.css';
import React from 'react';

Amplify.configure(amplifyConfig);
const queryClient = new QueryClient();
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
