import type { ReactNode, SVGProps } from 'react'

/** One 16px stroke family for the whole Office view: 1.4 stroke, round joins, currentColor. */
function Icon({ children, ...rest }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      className="ico"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const PromptMark = () => (
  <Icon>
    <rect x="1.75" y="2.25" width="12.5" height="11.5" rx="3" />
    <path d="M4.75 6.25 6.75 8l-2 1.75M8.5 10.25h3" />
  </Icon>
)
export const ComposeIcon = () => (
  <Icon>
    <path d="M7.25 2.75H4.5a1.75 1.75 0 0 0-1.75 1.75v7a1.75 1.75 0 0 0 1.75 1.75h7a1.75 1.75 0 0 0 1.75-1.75V8.75" />
    <path d="m11.9 2.35 1.75 1.75L8.4 9.35l-2.3.55.55-2.3z" />
  </Icon>
)
export const ReviewIcon = () => (
  <Icon>
    <path d="M13 6.25A5.25 5.25 0 0 0 3.6 4.4M3 9.75a5.25 5.25 0 0 0 9.4 1.85" />
    <path d="M3.25 2.25v2.5h2.5M12.75 13.75v-2.5h-2.5" />
  </Icon>
)
export const GrammarIcon = () => (
  <Icon>
    <path d="M2.5 4h11M2.5 8h5.5M2.5 12h7.5" />
    <path d="M12 7v6.5M10.75 7h2.5M10.75 13.5h2.5" />
  </Icon>
)
export const DocIcon = () => (
  <Icon>
    <path d="M9.25 1.75H4.5A1.75 1.75 0 0 0 2.75 3.5v9a1.75 1.75 0 0 0 1.75 1.75h7a1.75 1.75 0 0 0 1.75-1.75V5.75z" />
    <path d="M9.25 1.75v4h4M5.5 8.75h5M5.5 11.25h3.5" />
  </Icon>
)
export const DocsIcon = () => (
  <Icon>
    <path d="M5.25 4.25V3A1.25 1.25 0 0 1 6.5 1.75h4.25l2.5 2.5V11a1.25 1.25 0 0 1-1.25 1.25h-1.25" />
    <rect x="2.75" y="4.25" width="7.5" height="10" rx="1.25" />
    <path d="M4.75 8h3.5M4.75 10.5h2.5" />
  </Icon>
)
export const StopwatchIcon = () => (
  <Icon>
    <circle cx="8" cy="9.25" r="5" />
    <path d="M8 6.75v2.5l1.5 1M6.5 1.75h3M12.25 4.5l1-1" />
  </Icon>
)
export const LayersIcon = () => (
  <Icon>
    <path d="m8 2 6 3.25-6 3.25-6-3.25z" />
    <path d="m2 8.25 6 3.25 6-3.25M2 11.25l6 3.25 6-3.25" />
  </Icon>
)
export const ChartIcon = () => (
  <Icon>
    <path d="M2.25 13.75h11.5M4 11V8.5M7 11V4.5M10 11V6.75M13 11V3" />
  </Icon>
)
export const SlidersIcon = () => (
  <Icon>
    <path d="M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6" />
    <circle cx="10" cy="4.5" r="1.5" />
    <circle cx="6" cy="11.5" r="1.5" />
  </Icon>
)
export const SwapIcon = () => (
  <Icon>
    <path d="M2.75 5.25h10l-2.5-2.5M13.25 10.75h-10l2.5 2.5" />
  </Icon>
)
export const SidebarIcon = () => (
  <Icon>
    <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2" />
    <path d="M6 2.75v10.5" />
  </Icon>
)
export const PaneIcon = () => (
  <Icon>
    <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2" />
    <path d="M9.5 2.75v10.5" />
  </Icon>
)
export const CheckIcon = () => (
  <Icon>
    <path d="m3.25 8.5 3 3 6.5-7" />
  </Icon>
)
export const CrossIcon = () => (
  <Icon>
    <path d="m4 4 8 8M12 4l-8 8" />
  </Icon>
)
export const FlagIcon = () => (
  <Icon>
    <path d="M3.5 14.25V2.25M3.5 2.75h8l-1.75 3 1.75 3h-8" />
  </Icon>
)
export const ChevronRight = () => (
  <Icon>
    <path d="m6.25 3.75 4.25 4.25-4.25 4.25" />
  </Icon>
)
export const ChevronLeft = () => (
  <Icon>
    <path d="M9.75 3.75 5.5 8l4.25 4.25" />
  </Icon>
)
export const ArrowUpIcon = () => (
  <Icon>
    <path d="M8 13V3.25M3.75 7.5 8 3.25l4.25 4.25" />
  </Icon>
)
export const ShuffleIcon = () => (
  <Icon>
    <path d="M2.25 4.5h2.5c3.5 0 3 7 6.5 7h2.5M11.25 9.5l2.5 2-2.5 2M2.25 11.5h2.5c1.2 0 1.9-.8 2.4-1.9M13.75 4.5h-2.5c-1.2 0-1.9.8-2.4 1.9M11.25 2.5l2.5 2-2.5 2" />
  </Icon>
)
export const AlertIcon = () => (
  <Icon>
    <path d="M8 2.25 14.25 13.5H1.75z" />
    <path d="M8 6.75v3M8 11.75v.01" />
  </Icon>
)
export const FolderIcon = () => (
  <Icon>
    <path d="M1.75 4.25A1.5 1.5 0 0 1 3.25 2.75h3l1.5 1.75h5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-9.5a1.5 1.5 0 0 1-1.5-1.5z" />
  </Icon>
)
export const KeyboardIcon = () => (
  <Icon>
    <rect x="1.75" y="3.75" width="12.5" height="8.5" rx="1.75" />
    <path d="M4.5 6.5h.01M7 6.5h.01M9.5 6.5h.01M12 6.5h-.5M5 9.5h6" />
  </Icon>
)
