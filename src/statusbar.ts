import { editor } from 'monaco-editor'

export class VimStatusBar {
  private node: HTMLElement | null

  private editor: editor.IStandaloneCodeEditor

  private modeInfoNode = document.createElement('span')

  private secInfoNode = document.createElement('span')

  private notifNode = document.createElement('span')

  private keyInfoNode = document.createElement('span')

  private input: null | { node: HTMLInputElement; options: any; callback: any } = null

  private notifTimeout: number | null = null

  private sanitizer: null | ((content: string) => HTMLElement)

  constructor(node: HTMLElement | null, editor: editor.IStandaloneCodeEditor, sanitizer = null) {
    this.node = node
    if (this.node) {
      this.node.appendChild(this.modeInfoNode)
      this.node.appendChild(this.secInfoNode)
      this.node.appendChild(this.notifNode)
      this.node.appendChild(this.keyInfoNode)
    }
    this.notifNode.className = 'vim-notification'
    this.keyInfoNode.setAttribute('style', 'float: right')
    this.toggleVisibility(false)
    this.editor = editor
    this.sanitizer = sanitizer
  }

  setMode(ev: { mode: string; subMode: string }) {
    if (ev.mode === 'visual' && ev.subMode === 'linewise') {
      this.setText('--VISUAL LINE--')
      return
    }

    this.setText(`--${ev.mode.toUpperCase()}--`)
  }

  setKeyBuffer(key: string) {
    this.keyInfoNode.textContent = key
  }

  setSec(text: string, callback?: any, options?: any) {
    this.notifNode.textContent = ''
    if (text === undefined) {
      return
    }

    this.setInnerHtml_(this.secInfoNode, text)
    const input = this.secInfoNode.querySelector('input')

    if (input) {
      input.focus()
      this.input = {
        callback,
        options,
        node: input,
      }

      if (options) {
        if (options.selectValueOnOpen) {
          input.select()
        }

        if (options.value) {
          input.value = options.value
        }
      }

      this.addInputListeners()
    }

    return this.closeInput
  }

  setText(text: string) {
    this.modeInfoNode.textContent = text
  }

  toggleVisibility(toggle: boolean) {
    if (this.node) {
      this.node.style.display = toggle ? 'block' : 'none'
    }

    if (this.input) {
      this.removeInputListeners()
    }

    this.notifTimeout && clearInterval(this.notifTimeout)
  }

  closeInput = () => {
    this.removeInputListeners()
    this.input = null
    this.setSec('')

    if (this.editor) {
      this.editor.focus()
    }
  }

  clear = () => {
    this.setInnerHtml_(this.node, '')
  }

  inputKeyUp = (e: any) => {
    if (this.input) {
      const { options } = this.input
      if (options && options.onKeyUp) {
        options.onKeyUp(e, e.target.value, this.closeInput)
      }
    }
  }

  inputBlur = () => {
    if (!this.input) {
      return
    }
    const { options } = this.input

    if (options.closeOnBlur) {
      this.closeInput()
    }
  }

  inputKeyDown = (e: any) => {
    if (!this.input) {
      return
    }
    const { options, callback } = this.input

    if (options && options.onKeyDown && options.onKeyDown(e, e.target.value, this.closeInput)) {
      return
    }

    if (e.keyCode === 27 || (options && options.closeOnEnter !== false && e.keyCode === 13)) {
      this.input.node.blur()
      e.stopPropagation()
      this.closeInput()
    }

    if (e.keyCode === 13 && callback) {
      e.stopPropagation()
      e.preventDefault()
      callback(e.target.value)
    }
  }

  addInputListeners() {
    if (!this.input) {
      return
    }
    const { node } = this.input
    node.addEventListener('keyup', this.inputKeyUp)
    node.addEventListener('keydown', this.inputKeyDown)
    node.addEventListener('blur', this.inputBlur)
  }

  removeInputListeners() {
    if (!this.input || !this.input.node) {
      return
    }

    const { node } = this.input
    node.removeEventListener('keyup', this.inputKeyUp)
    node.removeEventListener('keydown', this.inputKeyDown)
    node.removeEventListener('blur', this.inputBlur)
  }

  showNotification(text: string) {
    const sp = document.createElement('span')
    this.setInnerHtml_(sp, text)
    this.notifNode.textContent = sp.textContent
    this.notifTimeout = window.setTimeout(() => {
      this.notifNode.textContent = ''
    }, 5000)
  }

  setInnerHtml_(element: HTMLElement | null, htmlContents: string) {
    if (!element) {
      return
    }
    if (this.sanitizer) {
      // Clear out previous contents first.
      while (element.children.length) {
        element.removeChild(element.children[0])
      }
      element.appendChild(this.sanitizer(htmlContents))
    } else {
      element.innerHTML = htmlContents
    }
  }
}
