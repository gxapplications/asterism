'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Input, Row } from 'react-materialize'

import { ItemSettingPanel } from 'asterism-plugin-library'
import RefreshButtonItem from './item'

class RefreshButtonSettingPanel extends ItemSettingPanel {
  componentWillUpdate (nextProps, nextState) {
    // Because of react-materialize bad behaviors...
    if (this.state.params.title !== nextState.params.title) {
      this._title.setState({ value: nextState.params.title })
    }
  }

  render () {
    const { theme, mainState } = this.props.context
    const { title = '' } = this.state.params
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div className='clearing padded'>
        <Row className='padded card'>
          <Input placeholder='Refresh' s={12} label='Label' ref={(c) => { this._title = c }}
            value={title} onChange={this.handleEventChange.bind(this, 'title')} />
        </Row>
        <Button waves={waves} className={cx('right', theme.actions.primary)} onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  save () {
    this.next(RefreshButtonItem, this.state.params)
  }
}

export default RefreshButtonSettingPanel
