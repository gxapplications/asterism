'use strict'

import React from 'react'
import { Button, Row } from 'react-materialize'
import uuid from 'uuid'
import { ItemSettingPanel, Scenarii } from 'asterism-plugin-library'

import SurveyControlItem from './item'
import cx from 'classnames'

const { ScenariiDropdown } = Scenarii

class SurveyControlSettingPanel extends ItemSettingPanel {
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
    // TODO !2
    return true
  }

  render () {
    const { theme, mainState } = this.props.context
    const { scenario = '' } = this.state.params
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div className='clearing padded'>
        <Row className='padded card'>
          <h5>Survey scenario:</h5>
          <div className='col s12'>&nbsp;</div>
          <ScenariiDropdown
            onChange={this.handleValueChange.bind(this, 'scenario')} theme={theme} animationLevel={animationLevel}
            ref={(c) => { this._scenario = c }} services={() => this.props.context.services}
            defaultScenarioId={scenario} s={12} instanceFilter={(e) => e.typeId === 'survey-scenario'}
            typeFilter={(e) => e.id === 'survey-scenario'} label='Survey scenario to control' dropdownId={uuid.v4()}
          />
        </Row>

        <Button waves={waves} className={cx('right btn-bottom-sticky', theme.actions.primary)} onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  save () {
    this.next(SurveyControlItem, this.state.params)
  }
}

export default SurveyControlSettingPanel
