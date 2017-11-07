'use strict'

const _data = []

export default (mainComponent) => ({
  log: (...args) => {
    console.log(...args)
    _data.push(args.join(' '))
    mainComponent.setState({ logs: [..._data] })
  },
  info: (...args) => {
    console.info(...args)
    _data.push(args.join(' '))
    mainComponent.setState({ logs: [..._data] })
  },
  warn: (...args) => {
    console.warn(...args)
    _data.push(args.join(' '))
    mainComponent.setState({ logs: [..._data] })
  },
  error: (...args) => {
    console.error(...args)
    _data.push(args.join(' '))
    mainComponent.setState({ logs: [..._data] })
  }
})
