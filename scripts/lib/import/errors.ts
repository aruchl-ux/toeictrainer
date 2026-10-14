/** Errors that will repeat on every call (credentials, permission, billing): the whole run must stop. */
export function isRunFatal(e: unknown): boolean {
  const status = (e as { status?: unknown } | null)?.status
  if (status === 401 || status === 402 || status === 403) return true
  // With no credentials at all the SDK throws a plain Error (no status) before sending a request.
  return e instanceof Error && /authentication method/i.test(e.message)
}
