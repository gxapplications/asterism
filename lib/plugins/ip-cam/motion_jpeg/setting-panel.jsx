'use strict'

import React from 'react'
import { Button } from 'react-materialize'

import ItemSettingPanel from '../../item-setting-panel'
import MjpegCameraItem from './item'

class MjpegCameraSettingPanel extends ItemSettingPanel {
  render () {
    const { context } = this.props
    const { animationLevel } = context.mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div className='clearing padded'>
        test

        <Button waves={waves} className='right' onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  save () {
    const params = { ...this.state.params }
    this.next(MjpegCameraItem, params)
  }
}

export default MjpegCameraSettingPanel
