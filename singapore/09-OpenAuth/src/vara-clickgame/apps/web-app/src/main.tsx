import { OpenAuthProvider } from '@open-auth/sdk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'

import '@unocss/reset/tailwind.css'
import 'uno.css'
import './assets/styles/index.css'

const queryClient = new QueryClient()

const root = createRoot(document.getElementById('root')!)
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <OpenAuthProvider
        config={{
          appId: import.meta.env.VITE_OPENAUTH_APPID,
          endpoint: import.meta.env.VITE_OPENAUTH_ENDPOINT,
        }}
      >
        <App />
      </OpenAuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)
