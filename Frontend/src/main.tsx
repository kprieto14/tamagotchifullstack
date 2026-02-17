import React from 'react'
import './index.scss'
import  { App } from './App'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client';
import { Auth0ProviderWithNavigate } from './components/auth0ProviderWithNavigate';

const queryClient = new QueryClient()

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <Router>
            <QueryClientProvider client={queryClient}>
                <Auth0ProviderWithNavigate>
                    <App />
                </Auth0ProviderWithNavigate>
            </QueryClientProvider>
        </Router>
    </React.StrictMode>
);