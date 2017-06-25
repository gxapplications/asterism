'use strict'

import React from 'react'
import { Button, Row } from 'react-materialize'

import ItemSettingPanel from '../../item-setting-panel'
import SocketLoggerItem from './item'

class SocketLoggerSettingPanel extends ItemSettingPanel {
  render () {
    const { context } = this.props
    const { logLevel = 1, historyLength = 30 } = this.state.params
    const { animationLevel } = context.mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    const logLevelLabel = logLevel == 0 ? 'Debug' : (logLevel == 1 ? 'Info' : (logLevel == 2 ? 'Warning' : 'Error')) // eslint-disable-line eqeqeq

    return (
      <div className='clearing padded'>

        <Row className='left-align'>
          <div className='col s12'>
            <h5>Min log level</h5>
            <div className='range-field'>
              <input type='range' min='0' max='3' ref={(c) => { this._logLevel = c }}
                value={logLevel} onChange={this.handleValueChange.bind(this, 'logLevel')} />
            </div>
            Will log from {logLevelLabel} level.
          </div>
        </Row>

        <Row className='left-align'>
          <div className='col s12'>
            <h5>History length</h5>
            <div className='range-field'>
              <input type='range' min='1' max='100' ref={(c) => { this._historyLength = c }}
                value={historyLength} onChange={this.handleValueChange.bind(this, 'historyLength')} />
            </div>
            Will keep last {historyLength} messages.
          </div>
        </Row>

        <Button waves={waves} className='right' onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  save () {
    const params = { ...this.state.params, logLevel: this._logLevel.value, historyLength: this._historyLength.value }
    this.next(SocketLoggerItem, params)
  }
}

export default SocketLoggerSettingPanel
