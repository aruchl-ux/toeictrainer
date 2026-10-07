import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from 'react'
import { Composer, type ComposerProps } from './Composer'
import { PaneIcon, SidebarIcon } from './icons'
import { useO } from './strings'

export interface Shell {
  sidebarOpen: boolean
  toggleSidebar(): void
  paneOpen: boolean
  togglePane(): void
}

export const ShellCtx = createContext<Shell | null>(null)

export function useShell(): Shell {
  const s = useContext(ShellCtx)
  if (!s) throw new Error('useShell must be used inside the Office shell')
  return s
}

interface Props {
  crumbs: string[]
  /** Right side of the top bar: progress count, pace, test clock. */
  status?: ReactNode
  /** Document pane (Part 6 / Part 7 passages). */
  pane?: ReactNode
  composer: ComposerProps
  /** Changing this scrolls the transcript to the newest task. */
  scrollSignal?: unknown
  /** Home: heading and composer sit in the middle of the column. */
  centered?: boolean
  children: ReactNode
}

export function Thread({ crumbs, status, pane, composer, scrollSignal, centered, children }: Props) {
  const { sidebarOpen, toggleSidebar, paneOpen, togglePane } = useShell()
  const { o } = useO()
  const scroller = useRef<HTMLDivElement>(null)

  // Show the newest task from its top when it is taller than the view, otherwise follow the bottom.
  useLayoutEffect(() => {
    const el = scroller.current
    // Reports and pickers open at the top; only running threads follow the newest task.
    if (!el || scrollSignal === undefined) return
    const place = () => {
      const anchors = el.querySelectorAll<HTMLElement>('[data-anchor]')
      const anchor = anchors[anchors.length - 1]
      const top = anchor ? anchor.offsetTop - 20 : 0
      const target = anchor && el.scrollHeight - top > el.clientHeight ? top : el.scrollHeight
      el.scrollTo({ top: target, behavior: 'smooth' })
    }
    place()
    // The verdict reveals after a short check; place again once it has its height.
    const id = window.setTimeout(place, 420)
    return () => window.clearTimeout(id)
  }, [scrollSignal])

  const showPane = Boolean(pane) && paneOpen
  return (
    <div className={showPane ? 'thread has-pane' : 'thread'}>
      <div className="thread-main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn"
            aria-label={o(sidebarOpen ? 'sidebarHide' : 'sidebarShow')}
            aria-pressed={sidebarOpen}
            title={`${o(sidebarOpen ? 'sidebarHide' : 'sidebarShow')} (Ctrl+B)`}
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </button>
          <nav className="crumbs" aria-label="breadcrumb">
            <span className="crumb-root">{o('workspace')}</span>
            {crumbs.map((c, i) => (
              <span key={i} className={i === crumbs.length - 1 ? 'crumb last' : 'crumb'} aria-current={i === crumbs.length - 1 ? 'page' : undefined}>
                {c}
              </span>
            ))}
          </nav>
          <div className="topbar-status">{status}</div>
          {pane && (
            <button
              type="button"
              className="icon-btn"
              aria-label={o(paneOpen ? 'paneHide' : 'paneShow')}
              aria-pressed={paneOpen}
              title={o(paneOpen ? 'paneHide' : 'paneShow')}
              onClick={togglePane}
            >
              <PaneIcon />
            </button>
          )}
        </header>
        <div ref={scroller} className={centered ? 'transcript centered' : 'transcript'}>
          <div className="transcript-col">{children}</div>
        </div>
        {!centered && (
          <div className="composer-dock">
            <Composer {...composer} />
          </div>
        )}
      </div>
      {showPane && <aside className="pane">{pane}</aside>}
    </div>
  )
}
