'use strict'

import React from 'react'
import { Button, Input, Row } from 'react-materialize'

import ItemSettingPanel from '../../item-setting-panel'
import RefreshButtonItem from './item'

class RefreshButtonSettingPanel extends ItemSettingPanel {
  render () {
    const { context } = this.props
    const { title } = this.state
    const { animationLevel } = context.mainState

    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div className='clearing padded'>
        <Row className='padded card'>
          <Input placeholder='Refresh' s={12} label='Label' ref={(c) => { this._title = c }} defaultValue={title} />
        </Row>
        <Button waves={waves} className='right' onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  save () {
    const params = { ...this.state.params, title: this._title.state.value }
    this.setState({ params })
    this.next(RefreshButtonItem, params)
  }
}

export default RefreshButtonSettingPanel
