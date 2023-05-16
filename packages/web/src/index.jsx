import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './utils';
import { QueryClient, QueryClientProvider } from 'react-query';

// tailwindcss
import './index.css';

Amplify.configure(amplifyConfig);

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
