import { Fragment, useId, useState } from 'react'
import {
  SYMBOLS,
  clueText,
  exampleParts,
  formulaParts,
  symbolsIn,
  type CheatEntry,
  type CheatSheet,
  type SheetPoint
} from '@shared/cheatsheet'
import { t, type Lang } from '../../app/i18n'

/** One formula line as chips: S, V forms and slots each keep one ink across every sheet. */
export function FormulaLine({ line }: { line: string }) {
  const parts = formulaParts(line)
  return (
    <code className="formula">
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && p.kind !== 'punct' && parts[i - 1].kind !== 'punct' && (
            <span className="fp-plus" aria-hidden="true">
              +
            </span>
          )}
          <span className={`fp fp-${p.kind}`}>{p.text}</span>
        </Fragment>
      ))}
    </code>
  )
}

function Example({ text }: { text: string }) {
  return (
    <p className="cheat-example" lang="en">
      {exampleParts(text).map((p, i) => (p.hit ? <mark key={i}>{p.text}</mark> : <Fragment key={i}>{p.text}</Fragment>))}
    </p>
  )
}

function EntryCard({ entry, lang, uiLang }: { entry: CheatEntry; lang: Lang; uiLang: Lang }) {
  const headId = `cheat-${entry.id}`
  return (
    <article className="cheat-entry" aria-labelledby={headId}>
      <h3 id={headId} className="cheat-name" lang={lang}>
        {entry.name[lang]}
      </h3>
      <div className="cheat-formulas">
        {entry.formula.map((line) => (
          <FormulaLine key={line} line={line} />
        ))}
      </div>
      {entry.words && entry.words.length > 0 && (
        <dl className="cheat-words" aria-label={t(uiLang, 'cheatWords')}>
          {entry.words.map((w) => (
            <div key={w.w}>
              <dt lang="en">{w.w}</dt>
              <dd lang={lang}>{w[lang]}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="cheat-use" lang={lang}>
        {entry.use[lang]}
      </p>
      <Example text={entry.example.en} />
      {lang === 'th' && (
        <p className="cheat-translation" lang="th">
          {entry.example.th}
        </p>
      )}
      {entry.mistake && (
        <p className="cheat-mistake">
          <span className="cheat-mistake-label" lang={uiLang}>
            {t(uiLang, 'cheatMistake')}
          </span>
          <span lang="en">
            <s>✗ {entry.mistake.wrong}</s> <strong>✓ {entry.mistake.right}</strong>
          </span>
          <span className="cheat-mistake-why" lang={lang}>
            {entry.mistake.why[lang]}
          </span>
        </p>
      )}
      {entry.clues && entry.clues.length > 0 && (
        <div className="cheat-clues">
          <span className="cheat-clues-label" lang={uiLang}>
            {t(uiLang, 'cheatClues')}
          </span>
          <ul>
            {entry.clues.map((c) => (
              <li key={clueText(c)}>
                <span lang="en">{clueText(c)}</span>
                {typeof c !== 'string' && (
                  <span className="cheat-clue-meaning" lang={lang}>
                    {c[lang]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

/** Every point the topic's questions test, so nothing in a drill is missing from its sheet. */
function PointList({ points, lang, uiLang }: { points: SheetPoint[]; lang: Lang; uiLang: Lang }) {
  const headId = useId()
  if (points.length === 0) return null
  return (
    <section className="cheat-points" aria-labelledby={headId}>
      <h3 id={headId} className="cheat-points-title" lang={uiLang}>
        {t(uiLang, 'cheatPoints', { n: points.length })}
      </h3>
      <ul>
        {points.map((p) => (
          <li key={p.key}>
            <span className="cheat-point-key" lang="en">
              {p.key}
            </span>
            <span className="cheat-point-meaning" lang={lang}>
              {p[lang]}
            </span>
            {p.wrong.length > 0 && (
              <span className="cheat-point-wrong" lang="en">
                {p.wrong.map((w) => (
                  <s key={w}>✗ {w}</s>
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** What S, V3, Obj… mean, for only the symbols this sheet uses. */
function SymbolKey({ sheet, lang, uiLang }: { sheet: CheatSheet; lang: Lang; uiLang: Lang }) {
  const used = symbolsIn(sheet)
  if (used.length === 0) return null
  return (
    <dl className="cheat-symbols" aria-label={t(uiLang, 'cheatSymbols')}>
      {used.map((s) => (
        <div key={s}>
          <dt lang="en">{s}</dt>
          <dd lang={lang}>{SYMBOLS[s][lang]}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * A topic's formula cards. Opens in the learner's language and flips to the other one,
 * like an explanation. Router-free so it also works inside the drill dialog.
 */
export function CheatSheetView({ sheet, lang, points = [] }: { sheet: CheatSheet; lang: Lang; points?: SheetPoint[] }) {
  const [showOther, setShowOther] = useState(false)
  const shown: Lang = showOther ? (lang === 'th' ? 'en' : 'th') : lang
  return (
    <div className="cheat-sheet">
      <div className="cheat-sheet-head">
        <p className="cheat-intro" lang={shown}>
          {sheet.intro[shown]}
        </p>
        <button type="button" className="link" lang={lang} onClick={() => setShowOther((v) => !v)}>
          {t(lang, showOther ? 'cheatShowMain' : 'cheatShowOther')}
        </button>
      </div>
      <SymbolKey sheet={sheet} lang={shown} uiLang={lang} />
      <div className="cheat-entries">
        {sheet.entries.map((e) => (
          <EntryCard key={e.id} entry={e} lang={shown} uiLang={lang} />
        ))}
      </div>
      <PointList points={points} lang={shown} uiLang={lang} />
    </div>
  )
}
