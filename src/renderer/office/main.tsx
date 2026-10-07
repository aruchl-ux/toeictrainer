import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { AppProvider } from '@renderer/app/AppContext'
// Anuphan carries every Thai glyph; Latin chrome uses the system's Segoe UI like other desktop agents.
import '@fontsource-variable/anuphan'
import { OfficeApp } from './OfficeApp'
import './office.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <OfficeApp />
      </AppProvider>
    </HashRouter>
  </StrictMode>
)
