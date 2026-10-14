import { Fragment, useState } from 'react'
import { SYMBOLS, clueText, exampleParts, formulaParts, sheetPoints, symbolsIn, type CheatSheet } from '@shared/cheatsheet'
import { useApp } from '@renderer/app/AppContext'
import type { Lang } from '@renderer/app/i18n'
import { DocIcon } from './icons'
import { useO } from './strings'

function Formula({ line }: { line: string }) {
  const parts = formulaParts(line)
  return (
    <code className="cf">
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && p.kind !== 'punct' && parts[i - 1].kind !== 'punct' && <span className="cf-plus"> + </span>}
          <span className={`cf-${p.kind}`}>{p.kind === 'punct' ? `${p.text} ` : p.text}</span>
        </Fragment>
      ))}
    </code>
  )
}

/** A topic's formulas as a read-only doc in the side pane, like a notes file open beside the thread. */
export function CheatPane({ sheet }: { sheet: CheatSheet }) {
  const { o, t, lang, skill } = useO()
  const [other, setOther] = useState(false)
  const shown: Lang = other ? (lang === 'th' ? 'en' : 'th') : lang
  const points = sheetPoints(sheet.topic, useApp().bank)
  return (
    <section className="doc" aria-label={o('pane')}>
      <div className="tabs">
        <span className="tab on">
          <DocIcon />
          <span className="tab-title">{skill(sheet.topic)}</span>
          <span className="tab-kind">cheatsheet</span>
        </span>
      </div>
      <p className="doc-note cheat-note">
        <span className="mono">{t('cheatCount', { n: sheet.entries.length })}</span>
        <button type="button" className="link" lang={lang} onClick={() => setOther((v) => !v)}>
          {t(other ? 'cheatShowMain' : 'cheatShowOther')}
        </button>
      </p>
      <div className="doc-body cheat-doc">
        <p className="cheat-doc-intro" lang={shown}>
          {sheet.intro[shown]}
        </p>
        {symbolsIn(sheet).length > 0 && (
          <dl className="cheat-doc-words" aria-label={t('cheatSymbols')}>
            {symbolsIn(sheet).map((s) => (
              <div key={s}>
                <dt className="mono">{s}</dt>
                <dd lang={shown}>{SYMBOLS[s][shown]}</dd>
              </div>
            ))}
          </dl>
        )}
        {sheet.entries.map((e) => (
          <article key={e.id} className="cheat-doc-entry" aria-labelledby={`oc-${e.id}`}>
            <h3 id={`oc-${e.id}`} lang={shown}>
              {e.name[shown]}
            </h3>
            {e.formula.map((line) => (
              <Formula key={line} line={line} />
            ))}
            {e.words && e.words.length > 0 && (
              <dl className="cheat-doc-words" aria-label={t('cheatWords')}>
                {e.words.map((w) => (
                  <div key={w.w}>
                    <dt className="mono">{w.w}</dt>
                    <dd lang={shown}>{w[shown]}</dd>
                  </div>
                ))}
              </dl>
            )}
            <p lang={shown}>{e.use[shown]}</p>
            <p className="cheat-doc-ex" lang="en">
              {exampleParts(e.example.en).map((p, i) =>
                p.hit ? (
                  <mark key={i} className="ev">
                    {p.text}
                  </mark>
                ) : (
                  <Fragment key={i}>{p.text}</Fragment>
                )
              )}
            </p>
            {shown === 'th' && (
              <p className="dim" lang="th">
                {e.example.th}
              </p>
            )}
            {e.clues && e.clues.length > 0 && (
              <p className="cheat-doc-clues">
                <span className="dim">{t('cheatClues')}</span>
                {e.clues.map((c) => (
                  <code key={clueText(c)} title={typeof c === 'string' ? undefined : c[shown]}>
                    {clueText(c)}
                    {typeof c !== 'string' && <span className="dim" lang={shown}> {c[shown]}</span>}
                  </code>
                ))}
              </p>
            )}
            {e.mistake && (
              <p className="cheat-doc-mistake">
                <s>✗ {e.mistake.wrong}</s> <strong>✓ {e.mistake.right}</strong>{' '}
                <span className="dim" lang={shown}>
                  {e.mistake.why[shown]}
                </span>
              </p>
            )}
          </article>
        ))}
        {points.length > 0 && (
          <section className="cheat-doc-points" aria-labelledby="oc-points">
            <h3 id="oc-points" lang={lang}>
              {t('cheatPoints', { n: points.length })}
            </h3>
            <ul>
              {points.map((p) => (
                <li key={p.key}>
                  <code>{p.key}</code> <span lang={shown}>{p[shown]}</span>
                  {p.wrong.map((w) => (
                    <s key={w} className="dim">
                      {' '}
                      ✗ {w}
                    </s>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  )
}
