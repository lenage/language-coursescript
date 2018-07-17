'use babel'

import { Emitter } from 'atom'
import React from 'react'
import ReactDOM from 'react-dom'
import App from '../components/Search.jsx'

export default class LanguageCoursescriptSearch {
  constructor() {
    this.emitter = new Emitter()
    this.element = document.createElement('div')
    this.element.classList.add('language-coursescript-search')

    ReactDOM.render(<App focus={false} onCopy={this.handleCopy} onClose={this.handleClose} />, this.element)
  }

  handleCopy = (text) => {
    atom.clipboard.write(text)
    this.emitter.emit('destroy')
  }

  handleClose = () => {
    this.emitter.emit('destroy')
  }

  handleFocusInput = () => {
    ReactDOM.render(<App focus={true} onCopy={this.handleCopy.bind(this)} />, this.element)
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.element)
    this.element.remove()
  }

  onDestroy(cb) {
    this.emitter.on('destroy', cb)
  }

  getElement() {
    return this.element
  }
}
