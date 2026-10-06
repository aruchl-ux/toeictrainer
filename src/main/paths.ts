import { app } from 'electron'
import { join } from 'path'

export function contentRoot(): string {
  return app.isPackaged ? join(process.resourcesPath, 'content') : join(app.getAppPath(), 'content')
}
