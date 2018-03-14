'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Input, Row } from 'react-materialize'

import { ItemSettingPanel, IconPicker, ActionColorSwitch, Scenarii } from 'asterism-plugin-library'

import ActionButtonItem from './item'

const { ActionsDropdown } = Scenarii

class ActionButtonSettingPanel extends ItemSettingPanel {
  componentWillUpdate (nextProps, nextState) {
    // Because of react-materialize bad behaviors...
    if (this.state.params.title !== nextState.params.title) {
      this._title.setState({ value: nextState.params.title })
    }

    if (this.state.params.action !== nextState.params.action) {
      this._action.setState({ currentId: nextState.params.action })
    }
  }

  render () {
    const { theme, mainState } = this.props.context
    const { title = '', action = '', color = 'primary', icon = 'error' } = this.state.params
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div id='actionButtonSettingDiv' className='clearing padded'>
        <Row className='padded card'>
          <ActionsDropdown defaultActionId={action} onChange={this.handleValueChange.bind(this, 'action')}
            ref={(c) => { this._action = c }} theme={theme} animationLevel={animationLevel}
            services={() => this.props.context.services} />

          <Input s={12} label='Label' ref={(c) => { this._title = c }} className='iconPicker'
            value={title} onChange={this.handleEventChange.bind(this, 'title')}>
            <div>
              <IconPicker theme={theme} animationLevel={animationLevel} defaultIcon={icon}
                onChange={this.handleValueChange.bind(this, 'icon')} />
            </div>
          </Input>
        </Row>

        <ActionColorSwitch theme={theme} animationLevel={animationLevel} defaultColor={color}
          onChange={this.handleValueChange.bind(this, 'color')} />

        <Button waves={waves} className={cx('right', theme.actions.primary)} onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  save () {
    this.next(ActionButtonItem, this.state.params)
  }
}

export default ActionButtonSettingPanel
