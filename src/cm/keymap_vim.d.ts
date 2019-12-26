import { editor } from 'monaco-editor'

export default class VimMode {
  constructor(editor: editor.IStandaloneCodeEditor)

  attach(): void

  on(key: string, callback: any): void

  setStatusBar(bar: any): void
}
