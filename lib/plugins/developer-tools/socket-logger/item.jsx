'use strict'

import cx from 'classnames'
import debounce from 'debounce'
import React from 'react'
import { Button, Icon, Modal } from 'react-materialize'

import Item from '../../item'

import styles from './styles.css.js'
// import '../styles.scss'

class SocketLoggerItem extends Item {
  constructor (props) {
    super(props)
    const socket = props.context.publicSockets['asterism/developer-tools/log']
    const { historyLength = 30, logLevel = 1 } = props.initialParams

    const logsBuffer = []
    this.debouncer = debounce(() => {
      this.setState({ logs: logsBuffer })
    }, 100, false)

    this.state = {
      logs: [],
      needRefresh: false
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

  receiveNewParams (params) {
    // this item cannot handle dynamic params change: will flag itself has 'to refresh'
    console.log('The Socket Logger item need a page refresh to take new params into account.')
    this.setState({ needRefresh: true })
  }

  render () {
    const { logs, needRefresh } = this.state
    const { context } = this.props
    return needRefresh ? (
      <Button waves='light' className={cx(context.theme.actions.edition, 'truncate fluid')} onClick={this.refreshPage.bind(this)}>
        Need a refresh<Icon left>refresh</Icon>
      </Button>
    ) : (
      <div className={cx(context.theme.actions.edition, 'fluid')} style={styles.container}>
        <div className='thin-scrollable' style={styles.logScroller}>
          {logs.map((log, idx) => {
            let timestamp = new Date()
            timestamp.setTime(log.args[0])
            timestamp = timestamp.toLocaleString()
            return (
              <Modal key={idx}
                header={timestamp}
                trigger={<pre style={{ ...styles.logRow, ...styles.logLevel(context.theme)[log.level] }}>
                  <span style={styles.logRowInset}>
                    [{timestamp}]
                    <br/>
                    {log.args[1]}
                  </span>
                </pre>}>
                <pre>{log.args.slice(1).join('\n')}</pre>
              </Modal>
            )
          })}
        </div>
      </div>
    )
  }

  refreshPage () {
    window.location.reload()
  }
}

export default SocketLoggerItem
