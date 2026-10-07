import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { useApp } from '@renderer/app/AppContext'
import { focusComposer } from './Composer'
import { HomeThread } from './HomeThread'
import { SettingsThread } from './SettingsThread'
import { Sidebar } from './Sidebar'
import { StatusThread } from './StatusThread'
import { TestThread } from './TestThread'
import { ShellCtx, type Shell } from './Thread'
import { DrillThread, MixedThread, ReadThread, ReviewThread } from './threads'
import { useO } from './strings'

const NARROW = '(max-width: 1023px)'

/** Per-viewer layout memory. Storage can be unavailable; the view works without it. */
function remembered(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === '1'
  } catch {
    return fallback
  }
}
function remember(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0')
  } catch {
    // Layout memory is a convenience only.
  }
}

export function OfficeApp() {
  const { settings, saveError } = useApp()
  const { t } = useO()
  const navigate = useNavigate()
  const location = useLocation()
  const narrow = () => window.matchMedia(NARROW).matches
  const [sidebarOpen, setSidebarOpen] = useState(() => !narrow() && remembered('office.sidebar', true))
  const [paneOpen, setPaneOpen] = useState(() => remembered('office.pane', true))

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((v) => {
      if (!narrow()) remember('office.sidebar', !v)
      return !v
    })
  }, [])
  const togglePane = useCallback(() => {
    setPaneOpen((v) => {
      remember('office.pane', !v)
      return !v
    })
  }, [])
  const shell = useMemo<Shell>(() => ({ sidebarOpen, toggleSidebar, paneOpen, togglePane }), [sidebarOpen, toggleSidebar, paneOpen, togglePane])

  useEffect(() => {
    document.documentElement.lang = settings.language
    document.documentElement.dataset.theme = settings.officeTheme ?? 'dark'
  }, [settings.language, settings.officeTheme])

  // On a narrow window the sidebar floats over the thread; close it after picking a thread.
  useEffect(() => {
    const mq = window.matchMedia(NARROW)
    const onChange = () => setSidebarOpen(!mq.matches && remembered('office.sidebar', true))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.altKey || e.metaKey) return
      const k = e.key.toLowerCase()
      if (e.shiftKey && k === 'm') {
        e.preventDefault()
        void window.api.app.setMode('trainer')
      } else if (!e.shiftKey && k === 'n') {
        e.preventDefault()
        navigate('/')
      } else if (!e.shiftKey && k === 'b') {
        e.preventDefault()
        toggleSidebar()
      } else if (!e.shiftKey && k === 'k') {
        e.preventDefault()
        focusComposer()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, toggleSidebar])

  return (
    <ShellCtx.Provider value={shell}>
      <div className={sidebarOpen ? 'office side-open' : 'office'}>
        {sidebarOpen && (
          <div
            className="side-wrap"
            onClick={(e) => {
              if (narrow() && (e.target as Element).closest('a')) setSidebarOpen(false)
            }}
          >
            <Sidebar />
          </div>
        )}
        {sidebarOpen && <div className="scrim" aria-hidden="true" onClick={() => setSidebarOpen(false)} />}
        <main className="stage">
          {saveError && (
            <p className="save-error" role="alert">
              {t('saveError')}
            </p>
          )}
          <Routes>
            <Route path="/" element={<HomeThread />} />
            <Route path="/review" element={<ReviewThread />} />
            <Route path="/drill/:topic" element={<DrillThread />} />
            {/* A new filter or format opens a fresh picker rather than keeping the open set. */}
            <Route path="/read" element={<ReadThread key={location.search} />} />
            <Route path="/mixed" element={<MixedThread />} />
            <Route path="/test" element={<TestThread />} />
            <Route path="/status" element={<StatusThread />} />
            <Route path="/settings" element={<SettingsThread />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ShellCtx.Provider>
  )
}
