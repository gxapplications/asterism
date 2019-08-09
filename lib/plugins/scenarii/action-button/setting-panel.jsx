'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, TextInput, Row } from 'react-materialize'

import { ItemSettingPanel, IconPicker, ActionColorSwitch, Scenarii } from 'asterism-plugin-library'

import ActionButtonItem from './item'

const { ActionsDropdown } = Scenarii

class ActionButtonSettingPanel extends ItemSettingPanel {
  componentWillUpdate (nextProps, nextState) {
    // Because of react-materialize bad behaviors...
    if (this.state.params.title !== nextState.params.title) {
      this._title.setState({ value: nextState.params.title })
    } // TODO !0: still needed?

    if (this.state.params.action !== nextState.params.action) {
      this._action.setState({ currentId: nextState.params.action })
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const comparator = (i) => [
      i.params.action,
      i.params.title,
      i.params.color,
      i.params.icon
    ]
    return JSON.stringify(comparator(this.state)) !== JSON.stringify(comparator(nextState))
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
            ref={(c) => { this._action = c }} theme={theme} animationLevel={animationLevel} label={null}
            services={() => this.props.context.services} />

          <IconPicker theme={theme} animationLevel={animationLevel} defaultIcon={icon} onChange={this.handleValueChange.bind(this, 'icon')} />
          <TextInput s={12} m={10} l={10} label='Label' ref={(c) => { this._title = c }}
            value={title} onChange={this.handleEventChange.bind(this, 'title')} />
        </Row>

        <ActionColorSwitch theme={theme} animationLevel={animationLevel} defaultColor={color}
          onChange={this.handleValueChange.bind(this, 'color')} />

        <Button waves={waves} className={cx('right btn-bottom-sticky', theme.actions.primary)} onClick={this.save.bind(this)}>
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
