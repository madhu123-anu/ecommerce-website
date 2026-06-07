import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            gutter={12}
            containerStyle={{ top: 80 }}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-surface, #ffffff)',
                color: 'var(--color-text, #0f172a)',
                border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                maxWidth: '380px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
                style: {
                  borderLeft: '4px solid #22c55e',
                },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
                style: {
                  borderLeft: '4px solid #ef4444',
                },
              },
              loading: {
                iconTheme: { primary: '#9333ea', secondary: '#fff' },
                style: {
                  borderLeft: '4px solid #9333ea',
                },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
