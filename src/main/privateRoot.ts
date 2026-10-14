import { join } from 'path'

/**
 * Folder of the user's private question pack (imported from their own books; never shipped).
 * A fixed folder name, so the installed app and `npm run dev` share one pack.
 */
export function privateContentRoot(appData: string, env: Record<string, string | undefined> = process.env): string {
  if (env.TOEIC_PRIVATE_CONTENT) return env.TOEIC_PRIVATE_CONTENT
  // Test and dev profiles get their own pack, so E2E runs never read the real one.
  if (env.TOEIC_USER_DATA) return join(env.TOEIC_USER_DATA, 'private-content')
  return join(appData, 'toeic-trainer', 'private-content')
}
