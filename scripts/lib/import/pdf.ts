import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'

const GIT_PDFTOTEXT = 'C:\Program Files\Git\mingw64\bin\pdftotext.exe'
const onPathDefault = () => !spawnSync('pdftotext', ['-v']).error

/** pdftotext from PDFTOTEXT, then PATH, then the copy Git for Windows ships. */
export function findPdftotext(
  env: Record<string, string | undefined> = process.env,
  onPath: () => boolean = onPathDefault,
  exists: (p: string) => boolean = existsSync
): string {
  if (env.PDFTOTEXT) return env.PDFTOTEXT
  if (onPath()) return 'pdftotext'
  if (exists(GIT_PDFTOTEXT)) return GIT_PDFTOTEXT
  throw new Error('pdftotext not found. Install Git for Windows (it ships pdftotext) or set PDFTOTEXT to its full path.')
}

/** Text of one page (1-based) in reading order; raw mode keeps two-column pages readable. */
export function pageText(bin: string, file: string, page: number): string {
  return execFileSync(bin, ['-f', String(page), '-l', String(page), '-enc', 'UTF-8', file, '-'], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024
  })
}

// Parsed documents are kept per file, since some books are hundreds of MB.
const docs = new Map<string, Promise<PDFDocument>>()

function load(file: string): Promise<PDFDocument> {
  let doc = docs.get(file)
  if (!doc) {
    doc = PDFDocument.load(readFileSync(file), { ignoreEncryption: true })
    docs.set(file, doc)
  }
  return doc
}

/** Frees a parsed document once its pages are done. */
export function forgetPdf(file: string): void {
  docs.delete(file)
}

export async function pageCount(file: string): Promise<number> {
  return (await load(file)).getPageCount()
}

/** One page (1-based) as a standalone PDF, base64, for Claude's PDF document input. */
export async function singlePagePdf(file: string, page: number): Promise<string> {
  const out = await PDFDocument.create()
  const [copied] = await out.copyPages(await load(file), [page - 1])
  out.addPage(copied)
  return Buffer.from(await out.save()).toString('base64')
}
