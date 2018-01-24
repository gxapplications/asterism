'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Input, Row } from 'react-materialize'

import { ItemSettingPanel, IconPicker, ActionColorSwitch } from 'asterism-plugin-library'

import ActionButtonItem from './item'
import ActionsDropdown from '../browser/actions-dropdown'

class ActionButtonSettingPanel extends ItemSettingPanel {
  constructor (props) {
    super(props)
    console.log('####1 constructor panel, props:', props, ', state: ', this.state)
    this.scenariiService = this.props.context.services['asterism-scenarii']
  }

  render () {
    const { theme, mainState } = this.props.context
    const { title = '', action = '', color = 'primary', icon = 'error' } = this.state.params
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    console.log('####2 will render, state:', this.state)
    // TODO !0: dropdown not updated after a first change then a second modal opening
    return (
      <div id='actionButtonSettingDiv' className='clearing padded'>
        <Row className='padded card'>
          <ActionsDropdown defaultActionId={action} onChange={this.changeActionId.bind(this)}
            theme={theme} animationLevel={animationLevel} scenariiService={this.scenariiService} />

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

  changeActionId (actionId) {
    this.setState({ params: { ...this.state.params, action: actionId } })
  }

  save () {
    const params = { ...this.state.params, title: this._title.state.value }
    console.log('####3 save, params:', params)
    this.next(ActionButtonItem, params)
  }
}

export default ActionButtonSettingPanel
