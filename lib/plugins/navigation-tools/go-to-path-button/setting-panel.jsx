'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Input, Row } from 'react-materialize'

import { ItemSettingPanel, IconPicker, ActionColorSwitch } from 'asterism-plugin-library'

import GoToPathButtonItem from './item'

class GoToPathButtonSettingPanel extends ItemSettingPanel {
  render () {
    const { theme, mainState } = this.props.context
    const { title = '', path = '/example/of/another-path', color = 'secondary', icon = 'link' } = this.state.params
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div id='goToPathSettingDiv' className='clearing padded'>
        <Row className='padded card'>
          <Input s={12} label='Path' placeholder='/example/of/another-path' ref={(c) => { this._path = c }}
            value={path} onChange={this.handleValueChange.bind(this, 'path')} />

          <Input s={12} label='Label' ref={(c) => { this._title = c }} className='iconPicker'
            value={title} onChange={this.handleValueChange.bind(this, 'title')}>
            <div>
              <IconPicker theme={theme} animationLevel={animationLevel} defaultIcon={icon} onChange={this.changeIcon.bind(this)} />
            </div>
          </Input>
        </Row>

        <ActionColorSwitch theme={theme} animationLevel={animationLevel} defaultColor={color} onChange={this.changeColor.bind(this)} />

        <Button waves={waves} className={cx('right', theme.actions.primary)} onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  changeColor (color) {
    this.setState({ params: { ...this.state.params, color } })
  }

  changeIcon (icon) {
    this.setState({ params: { ...this.state.params, icon } })
  }

  save () {
    const params = { ...this.state.params, title: this._title.state.value, path: this._path.state.value }
    this.next(GoToPathButtonItem, params)
  }
}

export default GoToPathButtonSettingPanel
