'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, TextInput, Row } from 'react-materialize'

import { ItemSettingPanel, IconPicker, ActionColorSwitch } from 'asterism-plugin-library'

import GoToPathButtonItem from './item'

class GoToPathButtonSettingPanel extends ItemSettingPanel {
  componentWillUpdate (nextProps, nextState) {
    // Because of react-materialize bad behaviors...
    if (this.state.params.title !== nextState.params.title) {
      this._title.setState({ value: nextState.params.title })
    }
    if (this.state.params.path !== nextState.params.path) {
      this._path.setState({ value: nextState.params.path })
    }
  }

  render () {
    const { theme, mainState } = this.props.context
    const { title = '', path = '/example/of/another-path', color = 'secondary', icon = 'link' } = this.state.params
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined
// TODO !0: fix iconpicker placement !
    return (
      <div id='goToPathSettingDiv' className='clearing padded'>
        <Row className='padded card'>
          <TextInput s={12} label='Path' placeholder='/example/of/another-path' ref={(c) => { this._path = c }}
            value={path} onChange={this.handleEventChange.bind(this, 'path')} />

          <TextInput s={12} label='Label' ref={(c) => { this._title = c }} className='iconPicker'
            value={title} onChange={this.handleEventChange.bind(this, 'title')}>
            <div>
              <IconPicker theme={theme} animationLevel={animationLevel} defaultIcon={icon} onChange={this.handleValueChange.bind(this, 'icon')} />
            </div>
          </TextInput>
        </Row>

        <ActionColorSwitch theme={theme} animationLevel={animationLevel} defaultColor={color} onChange={this.handleValueChange.bind(this, 'color')} />

        <Button waves={waves} className={cx('right btn-bottom-sticky', theme.actions.primary)} onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  save () {
    this.next(GoToPathButtonItem, this.state.params)
  }
}

export default GoToPathButtonSettingPanel
