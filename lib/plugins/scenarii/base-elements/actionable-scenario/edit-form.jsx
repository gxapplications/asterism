'use strict'

/* global $ */
import PropTypes from 'prop-types'
import React from 'react'
import { Input, Row } from 'react-materialize'
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
    if (!this.props.instance.data.executionTrigger.length) {
      this.scenariiService.getTriggerInstances()
      .then((instances) => {
        this.props.instance.data.executionTrigger = instances[0].instanceId

        if (!this.props.instance.data.action.length) {
          this.scenariiService.getActionInstances()
          .then((instances2) => {
            this.props.instance.data.action = instances2[0].instanceId

            this.betterName()
          })
        } else {
          this.betterName()
        }
      })
    } else {
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
          <Input placeholder='Give a name to quickly identify your scenario' s={12} label='Name' ref={(c) => { this._nameInput = c }}
            id={`actionable-scenario-name-input-${this._nameInputId}`}
            defaultValue={name} onChange={(e) => { instance.data.name = e.currentTarget.value }} />
        </Row>
        <Row className='section card form'>
          <h5>When:</h5>
          <TriggersDropdown onChange={this.setTrigger.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} noCreationPanel defaultTriggerId={executionTrigger}
            typeFilter={() => false} icon={null} label='Set a trigger' dropdownId={uuid.v4()} />
          <h5>With additional condition:</h5>
          <ConditionsDropdown onChange={this.setCondition.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} noCreationPanel defaultConditionId={executionCondition}
            typeFilter={() => false} icon={null} label='Set additional condition' dropdownId={uuid.v4()}>
            <option key='no-condition-option' value={''}>No condition</option>
          </ConditionsDropdown>
        </Row>
        <Row className='section card form'>
          <h5>Then:</h5>
          <ActionsDropdown onChange={this.setAction.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} noCreationPanel defaultActionId={action}
            typeFilter={() => false} icon={null} label='Set an action' dropdownId={uuid.v4()} />
        </Row>

        <Row className='section card form' onClick={this.expandAdvanced.bind(this)}>
          {(advancedExpanded && (
            <span>
              <h5>Abort when:</h5>
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
    this.props.instance.data.executionCondition = conditionId
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
      this.scenariiService.getTriggerInstance(this.props.instance.data.executionTrigger),
      this.props.instance.data.executionCondition.length ? this.scenariiService.getConditionInstance(this.props.instance.data.executionCondition) : Promise.resolve(null),
      this.scenariiService.getActionInstance(this.props.instance.data.action)
    ]).then(([trigger, condition, action]) => {
      this.props.instance.data.name = this.props.instance.getAutoName(trigger, condition, action)
      this.setState({ name: this.props.instance.data.name })
      if (this._nameInput) {
        this._nameInput.setState({ value: this.props.instance.data.name })
        $(`#actionable-scenario-name-input-${this._nameInputId}`).val(this.props.instance.data.name)
      }
    })

    this.props.highlightCloseButton()
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