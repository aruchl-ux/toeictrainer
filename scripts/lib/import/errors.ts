/** Errors that will repeat on every call (credentials, permission, billing): the whole run must stop. */
export function isRunFatal(e: unknown): boolean {
  const status = (e as { status?: unknown } | null)?.status
  return status === 401 || status === 402 || status === 403
}
