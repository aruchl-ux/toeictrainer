import { Fragment, useState } from 'react'
import { exampleParts, formulaParts, type CheatEntry, type CheatSheet } from '@shared/cheatsheet'
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
      {entry.clues && entry.clues.length > 0 && (
        <div className="cheat-clues">
          <span className="cheat-clues-label" lang={uiLang}>
            {t(uiLang, 'cheatClues')}
          </span>
          <ul>
            {entry.clues.map((c) => (
              <li key={c} lang="en">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

/**
 * A topic's formula cards. Opens in the learner's language and flips to the other one,
 * like an explanation. Router-free so it also works inside the drill dialog.
 */
export function CheatSheetView({ sheet, lang }: { sheet: CheatSheet; lang: Lang }) {
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
      <div className="cheat-entries">
        {sheet.entries.map((e) => (
          <EntryCard key={e.id} entry={e} lang={shown} uiLang={lang} />
        ))}
      </div>
    </div>
  )
}
