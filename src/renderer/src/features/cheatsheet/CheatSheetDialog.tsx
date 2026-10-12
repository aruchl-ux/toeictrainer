import { useEffect, useRef } from 'react'
import type { CheatSheet } from '@shared/cheatsheet'
import { t, topicLabel, type Lang } from '../../app/i18n'
import { CrossIcon } from '../../app/Ink'
import { CheatSheetView } from './CheatSheetView'

/** A topic's sheet over the running quiz. The quiz stays mounted underneath, so nothing is lost. */
export function CheatSheetDialog({ sheet, lang, onClose }: { sheet: CheatSheet; lang: Lang; onClose(): void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (typeof d.showModal === 'function') d.showModal()
    else d.setAttribute('open', '')
  }, [])

  const close = () => {
    // close() hands focus back to the button that opened the dialog.
    if (typeof ref.current?.close === 'function') ref.current.close()
    onClose()
  }

  return (
    <dialog ref={ref} className="cheat-dialog" aria-labelledby="cheat-dialog-title" onClose={onClose}>
      <header className="cheat-dialog-head">
        <h2 id="cheat-dialog-title" lang={lang}>
          {t(lang, 'cheatOpenFor', { topic: topicLabel(sheet.topic, lang) })}
        </h2>
        <button type="button" className="small" onClick={close}>
          <CrossIcon />
          {t(lang, 'cheatClose')}
        </button>
      </header>
      <CheatSheetView sheet={sheet} lang={lang} />
    </dialog>
  )
}
