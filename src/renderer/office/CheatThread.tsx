import { Navigate, useNavigate, useParams } from 'react-router'
import { useApp } from '@renderer/app/AppContext'
import { CHEAT_SHEETS } from '@shared/cheatsheet'
import { PART5_TOPICS, Part5Topic } from '@shared/types'
import { CheatPane } from './CheatPane'
import { ChevronRight, DocIcon } from './icons'
import { AgentMsg } from './Task'
import { Typed } from './threads'
import { Thread, useShell } from './Thread'
import { useO } from './strings'

/** /cheat and /cheat/:topic: pick a topic in the thread, read its formulas in the side pane. */
export function CheatThread() {
  const raw = useParams().topic
  const parsed = Part5Topic.safeParse(raw)
  const topic = parsed.success ? parsed.data : null
  const { bank } = useApp()
  const { o, t, skill } = useO()
  const navigate = useNavigate()
  const { paneOpen, togglePane } = useShell()

  if (raw !== undefined && !topic) return <Navigate to="/cheat" replace />
  const sheet = topic ? CHEAT_SHEETS[topic] : null

  return (
    <Thread
      crumbs={[o('groupPart5'), t('navCheat'), ...(topic ? [skill(topic)] : [])]}
      pane={sheet ? <CheatPane key={sheet.topic} sheet={sheet} /> : undefined}
      composer={{ placeholder: o('composerIdle') }}
    >
      <Typed cmd={`/cheat${topic ? ` ${topic}` : ''}`} />
      <AgentMsg anchor head={topic ? skill(topic) : t('cheatTitle')}>
        {!topic && <p>{o('cheatPick')}</p>}
        {topic && paneOpen && <p>{o('cheatOpenIn')}</p>}
        {topic && !paneOpen && (
          <p>
            {o('cheatPaneHidden')}{' '}
            <button type="button" className="link" onClick={togglePane}>
              {o('cheatShowPane')}
            </button>
          </p>
        )}
        <ul className="files">
          {PART5_TOPICS.map((tp) => (
            <li key={tp}>
              <button
                type="button"
                className="row-btn"
                aria-current={tp === topic ? 'true' : undefined}
                onClick={() => navigate(`/cheat/${tp}`)}
              >
                <DocIcon />
                <span className="row-title">{skill(tp)}</span>
                <span className="row-meta">{t('cheatCount', { n: CHEAT_SHEETS[tp].entries.length })}</span>
                <ChevronRight />
              </button>
            </li>
          ))}
        </ul>
        {topic && bank.part5.some((i) => i.topic === topic) && (
          <div className="actions">
            <button type="button" className="btn primary" onClick={() => navigate(`/drill/${topic}`)}>
              {t('cheatDrill')}
            </button>
          </div>
        )}
      </AgentMsg>
    </Thread>
  )
}
