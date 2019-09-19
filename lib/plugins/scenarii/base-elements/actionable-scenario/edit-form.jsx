'use strict'

/* global $ */
import PropTypes from 'prop-types'
import React from 'react'
import { TextInput, Row } from 'react-materialize'
import uuid from 'uuid'
import { Scenarii } from 'asterism-plugin-library'

const { ActionsDropdown, TriggersDropdown, ConditionsDropdown } = Scenarii

class BrowserActionableScenarioEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: props.instance.data.name,
      advancedExpanded: !!props.instance.data.abortTrigger
    }

    this.scenariiService = props.services()['asterism-scenarii']

    this._nameInput = null
    this._nameInputId = uuid.v4()
  }

  componentDidMount () {
    if (this.props.instance.data.executionTrigger.length) {
      this.betterName()
    }
  }

  render () {
    const { theme, animationLevel, instance, services } = this.props
    const { action, executionTrigger, executionCondition, abortTrigger } = instance.data
    const { name, advancedExpanded } = this.state

    return (
      <div>
        <Row className='section card form hide-in-procedure'>
          <TextInput placeholder='Short name' s={12} ref={(c) => { this._nameInput = c }}
            id={`actionable-scenario-name-input-${this._nameInputId}`}
            defaultValue={name} onChange={(e) => { instance.data.name = e.currentTarget.value }} />
        </Row>
        <Row className='section card form'>
          <h5>When:</h5>
          <div className='col s12'>&nbsp;</div>
          <TriggersDropdown onChange={this.setTrigger.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} noCreationPanel defaultTriggerId={executionTrigger}
            typeFilter={() => false} icon={null} label='Set a trigger' dropdownId={uuid.v4()} />
          <h5>With additional condition:</h5>
          <div className='col s12'>&nbsp;</div>
          <ConditionsDropdown onChange={this.setCondition.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} noCreationPanel defaultConditionId={executionCondition}
            typeFilter={() => false} icon={null} label='Set additional condition' dropdownId={uuid.v4()}>
            <option key='no-condition-option' value={'no-condition'}>No condition</option>
          </ConditionsDropdown>
        </Row>
        <Row className='section card form'>
          <h5>Then:</h5>
          <div className='col s12'>&nbsp;</div>
          <ActionsDropdown onChange={this.setAction.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} noCreationPanel defaultActionId={action}
            typeFilter={() => false} icon={null} label='Set an action' dropdownId={uuid.v4()} />
        </Row>

        <Row className='section card form' onClick={this.expandAdvanced.bind(this)}>
          {(advancedExpanded && (
            <span>
              <h5>Abort when:</h5>
              <div className='col s12'>&nbsp;</div>
              <TriggersDropdown onChange={this.setAbortTrigger.bind(this)} theme={theme} animationLevel={animationLevel}
                services={services} noCreationPanel defaultTriggerId={abortTrigger}
                typeFilter={() => false} icon={null} label='Set a trigger' dropdownId={uuid.v4()}>
                <option key='no-abort-trigger-option' value={''}>No trigger</option>
              </TriggersDropdown>
            </span>
          )) || (
            <a href='javascript:void(0)'>Expand advanced settings</a>
          )}
        </Row>
      </div>
    )
  }

  setAction (actionId) {
    this.props.instance.data.action = actionId
    this.betterName()
  }

  setTrigger (triggerId) {
    this.props.instance.data.executionTrigger = triggerId
    this.betterName()
  }

  setCondition (conditionId) {
    this.props.instance.data.executionCondition = (conditionId === 'no-condition') ? '' : conditionId
    this.betterName()
  }

  setAbortTrigger (triggerId) {
    this.props.instance.data.abortTrigger = triggerId
    this.props.highlightCloseButton()
  }

  expandAdvanced () {
    this.setState({
      advancedExpanded: true
    })
  }

  betterName () {
    this.props.highlightCloseButton()
    if (!this.props.instance.data.executionTrigger || !this.props.instance.data.action) {
      return
    }
    if (this.props.instance.data.name &&
        this.props.instance.data.name.length &&
        this.props.instance.data.name !== 'Unconfigured actionable scenario' &&
        this.props.instance.data.name !== 'Misconfigured actionable scenario'
      ) {
      if (this._nameInput) {
        this._nameInput.setState({ value: this.props.instance.data.name })
      }
      return this.setState({ name: this.props.instance.data.name })
    }

    Promise.all([
      this.scenariiService.getTriggerInstance(this.props.instance.data.executionTrigger, true),
      this.props.instance.data.executionCondition.length ? this.scenariiService.getConditionInstance(this.props.instance.data.executionCondition, true) : Promise.resolve(null),
      this.scenariiService.getActionInstance(this.props.instance.data.action, true)
    ]).then(([trigger, condition, action]) => {
      this.props.instance.data.name = this.props.instance.getAutoName(trigger, condition, action)
      this.setState({ name: this.props.instance.data.name })
      if (this._nameInput) {
        this._nameInput.setState({ value: this.props.instance.data.name })
        $(`#actionable-scenario-name-input-${this._nameInputId}`).val(this.props.instance.data.name)
      }
    })
  }
}

BrowserActionableScenarioEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserActionableScenarioEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserActionableScenarioEditForm.label = 'Actionable scenario'

export default BrowserActionableScenarioEditForm
