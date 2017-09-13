'use strict'

import React from 'react'
import { Button } from 'react-materialize'

import ItemSettingPanel from '../../item-setting-panel'
import SocketLoggerItem from './item'

class SocketLoggerSettingPanel extends ItemSettingPanel {
  render () {
    const { context } = this.props
    const { animationLevel } = context.mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div className='clearing padded'>
        // TODO !0: log level slider knob: min-level [0-3]:  logLevel = 1 par default

        // TODO !0: also history length slider knob [1-100]:  historyLength = 30 par default

        <Button waves={waves} className='right' onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  save () {
    const params = { ...this.state.params } // TODO !0: add value here
    this.setState({ params })
    this.next(SocketLoggerItem, params)
  }
}

export default SocketLoggerSettingPanel
