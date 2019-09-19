'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Row } from 'react-materialize'

import { ItemSettingPanel } from 'asterism-plugin-library'

import TemperatureProgrammerItem from './item'

class TemperatureProgrammerSettingPanel extends ItemSettingPanel {
  render () {
    const { theme, mainState } = this.props.context
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div id='actionButtonSettingDiv' className='clearing padded'>
        <Row className='padded card'>
          TODO
        </Row>

        <Button waves={waves} className={cx('right btn-bottom-sticky', theme.actions.primary)} onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  save () {
    this.next(TemperatureProgrammerItem, this.state.params)
  }
}

export default TemperatureProgrammerSettingPanel
