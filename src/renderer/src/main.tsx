import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { App } from './app/App'
import { AppProvider } from './app/AppContext'
// Kanit (display): only the weights the stylesheet uses, Thai + Latin subsets only.
import '@fontsource/kanit/thai-600.css'
import '@fontsource/kanit/latin-600.css'
import '@fontsource/kanit/thai-700.css'
import '@fontsource/kanit/latin-700.css'
import '@fontsource/kanit/thai-800.css'
import '@fontsource/kanit/latin-800.css'
// Anuphan (text): one variable file per script covers every weight.
import '@fontsource-variable/anuphan'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>
)
