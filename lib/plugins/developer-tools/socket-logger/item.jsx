'use strict'

import cx from 'classnames'
import debounce from 'debounce'
import React from 'react'

import Item from '../../item'

// TODO !2: find a better way to include true CSS
import styles from './styles.css.js'

class SocketLoggerItem extends Item {
  constructor (props) {
    super(props)
    const socket = props.context.publicSockets['asterism/developer-tools/log']
    const { historyLength = 30, logLevel = 1 } = this.state.params

    const logsBuffer = []
    this.debouncer = debounce(() => {
      this.setState({ logs: logsBuffer })
    }, 100, false)

    this.state = {
      logs: []
    }

    const stackToLog = (log) => {
      logsBuffer.unshift(log)
      while (logsBuffer.length > historyLength) {
        logsBuffer.pop()
      }
      this.debouncer()
    }
    switch (logLevel) {
      case 0:
        socket.on('log', (args) => {
          stackToLog({ level: 0, args })
        })
        // fall through
      case 1:
        socket.on('info', (args) => {
          stackToLog({ level: 1, args })
        })
        // fall through
      case 2:
      default:
        socket.on('warn', (args) => {
          stackToLog({ level: 2, args })
        })
        // fall through
      case 3:
        socket.on('error', (args) => {
          stackToLog({ level: 3, args })
        })
    }
  }

  render () {
    const { logs } = this.state
    const { context } = this.props
    return (
      <div className={cx(context.theme.actions.edition, 'fluid')} style={styles.container}>
        <div style={styles.logScroller}>
          {logs.map((log, idx) => {
            const timestamp = new Date()
            timestamp.setTime(log.args[0])
            // TODO !0: onClick: wave depending on animationLevel; scrollbar tuning (thin, better....)
            return <pre key={idx} style={{ ...styles.logRow, ...styles.logLevel(context.theme)[log.level] }}>
              <a style={styles.logRowInset} onClick={this.openLogRow.bind(this, log)}>
                [{timestamp.toString()}]
                <br/>
                {log.args.slice(1).join('\n')}
              </a>
            </pre>
          })}
        </div>
      </div>
    )
  }

  openLogRow (log) {
    console.log(log)
    // TODO !0: modal with data from log
  }
}

export default SocketLoggerItem
