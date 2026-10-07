import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useApp } from '@renderer/app/AppContext'
import { useGlobalCommands, type Command, type CommandArg } from './commands'
import { ArrowUpIcon } from './icons'
import { useO } from './strings'

export interface ComposerProps {
  placeholder: string
  /** Thread commands, listed before the global ones. */
  commands?: Command[]
  /**
   * Single keys pressed while the composer is empty (A–D, 1–4, F, Enter, arrows).
   * Return true when the thread used the key, so it is not typed.
   */
  onKey?(key: string): boolean
  /** Plain text sent with Enter (not a command). Return true when the thread used it. */
  onText?(text: string): boolean
  big?: boolean
}

type Item = { kind: 'cmd'; cmd: Command } | { kind: 'arg'; cmd: Command; arg: CommandArg }

const SINGLE = /^[a-d1-4f]$/i
const isTextEntry = (el: EventTarget | null) =>
  el instanceof Element && el.closest('input, textarea, select, [contenteditable]') !== null
const isControl = (el: EventTarget | null) => el instanceof Element && el.closest('button, a, summary, label') !== null

/** Moves focus to the composer from anywhere in the Office view. */
export function focusComposer(): void {
  document.querySelector<HTMLInputElement>('.composer-input')?.focus()
}

export function Composer({ placeholder, commands = [], onKey, onText, big }: ComposerProps) {
  const { settings, updateSettings } = useApp()
  const { o } = useO()
  const global = useGlobalCommands()
  const all = useMemo(() => {
    const own = new Set(commands.map((c) => c.name))
    return [...commands, ...global.filter((c) => !own.has(c.name))]
  }, [commands, global])
  const [value, setValue] = useState('')
  const [hi, setHi] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  // What the slash menu shows: command names, or the arguments of the command typed so far.
  const slash = /^\/(\S*)(\s+(\S*))?$/.exec(value)
  const items: Item[] = useMemo(() => {
    if (!slash) return []
    const [, name, spaced, argText = ''] = slash
    if (!spaced) {
      const q = name.toLowerCase()
      return all.filter((c) => c.name.startsWith(q)).map((cmd) => ({ kind: 'cmd' as const, cmd }))
    }
    const cmd = all.find((c) => c.name === name.toLowerCase())
    if (!cmd?.args) return []
    const q = argText.toLowerCase()
    return cmd.args
      .filter((a) => a.value.startsWith(q) || a.label.toLowerCase().includes(q))
      .map((arg) => ({ kind: 'arg' as const, cmd, arg }))
  }, [slash?.[0], all]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setHi(0), [items.length, slash?.[1]])

  const run = (cmd: Command, arg?: string) => {
    if (cmd.needsArg && !arg) {
      setValue(`/${cmd.name} `)
      return
    }
    setValue('')
    setNotice(null)
    cmd.run(arg)
  }

  const accept = (item: Item, execute: boolean) => {
    if (item.kind === 'arg') return execute ? run(item.cmd, item.arg.value) : setValue(`/${item.cmd.name} ${item.arg.value}`)
    if (item.cmd.args && (item.cmd.needsArg || !execute)) return setValue(`/${item.cmd.name} `)
    if (execute) run(item.cmd)
    else setValue(`/${item.cmd.name}`)
  }

  const submit = () => {
    const text = value.trim()
    if (!text) {
      onKey?.('Enter')
      return
    }
    if (text.startsWith('/')) {
      const [name, arg] = text.slice(1).split(/\s+/, 2)
      const cmd = all.find((c) => c.name === name.toLowerCase())
      if (!cmd) {
        if (items[hi]) return accept(items[hi], true)
        setNotice(o('unknownCommand', { c: `/${name}` }))
        return
      }
      if (arg && cmd.args && !cmd.args.some((a) => a.value === arg.toLowerCase())) {
        if (items[hi]) return accept(items[hi], true)
        setNotice(o('needArg', { c: `/${cmd.name}`, list: cmd.args.map((a) => a.value).join(', ') }))
        return
      }
      return run(cmd, arg?.toLowerCase())
    }
    if (onText?.(text)) {
      setValue('')
      setNotice(null)
    } else {
      setNotice(o('badAnswer'))
    }
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (items.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setHi((h) => (h + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length)
      return
    }
    if (e.key === 'Tab' && items[hi]) {
      e.preventDefault()
      accept(items[hi], false)
      return
    }
    if (e.key === 'Escape') {
      setValue('')
      setNotice(null)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
      return
    }
    if (value === '' && (SINGLE.test(e.key) || e.key === 'ArrowLeft' || e.key === 'ArrowRight') && onKey?.(e.key)) {
      e.preventDefault()
      setNotice(null)
    }
  }

  // Keys pressed while focus is elsewhere in the view still reach the thread; "/" jumps into the composer.
  useEffect(() => {
    const onWindowKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTextEntry(e.target) || e.defaultPrevented) return
      if (e.key === '/') {
        e.preventDefault()
        input.current?.focus()
        setValue('/')
        return
      }
      if (isControl(e.target) && (e.key === 'Enter' || e.key === ' ')) return
      if ((SINGLE.test(e.key) || e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') && onKey?.(e.key)) {
        e.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener('keydown', onWindowKey)
    return () => window.removeEventListener('keydown', onWindowKey)
  }, [onKey])

  const lang = settings.language
  const open = items.length > 0
  return (
    <div className={big ? 'composer big' : 'composer'}>
      {open && (
        <ul className="slash" role="listbox" id="slash-menu" aria-label={o('kCommands')}>
          {items.map((item, i) => (
            <li
              key={item.kind === 'cmd' ? item.cmd.name : `${item.cmd.name}-${item.arg.value}`}
              role="option"
              aria-selected={i === hi}
              className={i === hi ? 'on' : undefined}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                accept(item, true)
                input.current?.focus()
              }}
            >
              {item.kind === 'cmd' ? (
                <>
                  <span className="slash-name">/{item.cmd.name}{item.cmd.args ? ' …' : ''}</span>
                  <span className="slash-hint">{item.cmd.hint}</span>
                </>
              ) : (
                <>
                  <span className="slash-name">{item.arg.value}</span>
                  <span className="slash-hint">{item.arg.label}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="composer-box">
        <input
          ref={input}
          className="composer-input"
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? 'slash-menu' : undefined}
          aria-autocomplete="list"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setValue(e.target.value)
            setNotice(null)
          }}
          onKeyDown={onKeyDown}
        />
        <div className="composer-row">
          <button
            type="button"
            className="pill"
            onClick={() => void updateSettings({ language: lang === 'th' ? 'en' : 'th' })}
          >
            {o('explainPill')} <span className="pill-val">{lang === 'th' ? o('langTh') : o('langEn')}</span>
          </button>
          {notice && (
            <span className="composer-notice" role="status">
              {notice}
            </span>
          )}
          <button type="button" className="send" aria-label={o('send')} disabled={value.trim() === ''} onClick={submit}>
            <ArrowUpIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
