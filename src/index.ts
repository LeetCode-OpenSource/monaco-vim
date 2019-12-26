import { editor } from 'monaco-editor'

import { default as VimMode } from './cm/keymap_vim'
import { VimStatusBar } from './statusbar'

export function initVimMode(
  editor: editor.IStandaloneCodeEditor,
  statusbarNode: HTMLElement | null = null,
  StatusBarClass = VimStatusBar,
  sanitizer = null,
) {
  const vimAdapter = new VimMode(editor)

  if (!statusbarNode) {
    vimAdapter.attach()
    return vimAdapter
  }

  const statusBar = new StatusBarClass(statusbarNode, editor, sanitizer)
  let keyBuffer = ''

  vimAdapter.on('vim-mode-change', (mode: any) => {
    statusBar.setMode(mode)
  })

  vimAdapter.on('vim-keypress', (key: any) => {
    if (key === ':') {
      keyBuffer = ''
    } else {
      keyBuffer += key
    }
    statusBar.setKeyBuffer(keyBuffer)
  })

  vimAdapter.on('vim-command-done', () => {
    keyBuffer = ''
    statusBar.setKeyBuffer(keyBuffer)
  })

  vimAdapter.on('dispose', function() {
    statusBar.toggleVisibility(false)
    statusBar.closeInput()
    statusBar.clear()
  })

  statusBar.toggleVisibility(true)
  vimAdapter.setStatusBar(statusBar)
  vimAdapter.attach()

  return vimAdapter
}
