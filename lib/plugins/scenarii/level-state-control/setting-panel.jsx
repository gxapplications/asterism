'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Input, Row } from 'react-materialize'

import { ItemSettingPanel, IconPicker, ActionColorSwitch, Scenarii } from 'asterism-plugin-library'

import LevelStateControlItem from './item'

const { StatesDropdown } = Scenarii

class LevelStateControlSettingPanel extends ItemSettingPanel {
  constructor (props) {
    super(props)
    this.scenariiService = this.props.context.services['asterism-scenarii']
  }

  componentWillUpdate (nextProps, nextState) {
    // Because of react-materialize bad behaviors...
    if (this.state.params.title !== nextState.params.title) {
      this._title.setState({ value: nextState.params.title })
    }

    if (this.state.params.levelState !== nextState.params.levelState) {
      this._levelState.setState({ currentId: nextState.params.levelState })
    }
  }

  // TODO !1: choose first state if none in params (creation case).

  render () {
    const { theme, mainState } = this.props.context
    const { title = '', color = 'primary', icon = 'error', levelState = '' } = this.state.params
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    // TODO !1: when choose a state, if name is empty, then copy state name into name
    return (
      <div id='levelStateControlItemSettingDiv' className='clearing padded'>
        <Row className='padded card'>
          <StatesDropdown defaultStateId={levelState} onChange={this.handleValueChange.bind(this, 'levelState')}
            ref={(c) => { this._levelState = c }} theme={theme} animationLevel={animationLevel}
            scenariiService={this.scenariiService} />

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
    this.next(LevelStateControlItem, this.state.params)
  }
}

export default LevelStateControlSettingPanel