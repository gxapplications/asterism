'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Row } from 'react-materialize'

import { ItemSettingPanel } from 'asterism-plugin-library'
import SocketLoggerItem from './item'

class SocketLoggerSettingPanel extends ItemSettingPanel {
  render () {
    const { theme, mainState } = this.props.context
    const { logLevel = 1, historyLength = 30 } = this.state.params
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    const logLevelLabel = logLevel == 0 ? 'Debug' : (logLevel == 1 ? 'Info' : (logLevel == 2 ? 'Warning' : 'Error')) // eslint-disable-line eqeqeq

    return (
      <div className='clearing padded'>

        <Row className='left-align'>
          <div className='col s12'>
            <h5>Min log level</h5>
            <div className='range-field'>
              <input type='range' min='0' max='3'
                value={logLevel} onChange={this.handleEventChange.bind(this, 'logLevel')} />
            </div>
            Will log from {logLevelLabel} level.
          </div>
        </Row>

        <Row className='left-align'>
          <div className='col s12'>
            <h5>History length</h5>
            <div className='range-field'>
              <input type='range' min='1' max='100'
                value={historyLength} onChange={this.handleEventChange.bind(this, 'historyLength')} />
            </div>
            Will keep last {historyLength} messages.
          </div>
        </Row>

        <Button waves={waves} className={cx('right btn-bottom-sticky', theme.actions.primary)} onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  save () {
    this.next(SocketLoggerItem, this.state.params)
  }
}

export default SocketLoggerSettingPanel
