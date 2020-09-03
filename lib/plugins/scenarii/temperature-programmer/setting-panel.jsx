'use strict'

import cx from 'classnames'
import React from 'react'
import uuid from 'uuid'
import { Button, Row } from 'react-materialize'

import { ItemSettingPanel, Scenarii } from 'asterism-plugin-library'

import TemperatureProgrammerItem from './item'

const { ScenariiDropdown } = Scenarii

class TemperatureProgrammerSettingPanel extends ItemSettingPanel {
  constructor (props) {
    super(props)
    this.scenariiService = this.props.context.services['asterism-scenarii']
  }

  componentWillUpdate (nextProps, nextState) {
    if (this.state.params.scenario !== nextState.params.scenario) {
      this._scenario.setState({ currentId: nextState.params.scenario })
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const comparator = (i) => [
      i.params.scenario
    ]
    return JSON.stringify(comparator(this.state)) !== JSON.stringify(comparator(nextState))
  }

  render () {
    const { theme, mainState } = this.props.context
    const { scenario = '' } = this.state.params
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div id='tempProgrammerSettingDiv' className='clearing padded'>
        <Row className='padded card'>
          <ScenariiDropdown
            onChange={this.handleValueChange.bind(this, 'scenario')} theme={theme} animationLevel={animationLevel}
            ref={(c) => { this._scenario = c }} services={() => this.props.context.services}
            defaultScenarioId={scenario} s={12} instanceFilter={(e) => e.typeId === 'thermostat-state-scenario'}
            typeFilter={(e) => e.id === 'thermostat-state-scenario'} label='Thermostat scenario to control' dropdownId={uuid.v4()}
          />
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
