import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'

async function init() {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Root element not found')
  
  const root = createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </React.StrictMode>
  )
}

init().catch(console.error)