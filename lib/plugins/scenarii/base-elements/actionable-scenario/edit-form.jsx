'use strict'

/* global $ */
import PropTypes from 'prop-types'
import React from 'react'
import { TextInput, Row } from 'react-materialize'
import uuid from 'uuid'
import { Scenarii } from 'asterism-plugin-library'
import cx from "classnames";

const { ActionsDropdown, TriggersDropdown, ConditionsDropdown } = Scenarii

class BrowserActionableScenarioEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: props.instance.data.name,
      advancedExpanded: !!props.instance.data.abortTrigger,
      triggerEditPanel: undefined, // undef: not set, false: loading, null: missing, else: to display
      deleteExecutionTriggerConfirm: false
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
    const { action, executionCondition, abortTrigger } = instance.data
    const { name, advancedExpanded } = this.state

    return (
      <div className='actionableScenario'>
        <Row className='section card form hide-in-procedure'>
          <TextInput
            placeholder='Short name' s={12} ref={(c) => { this._nameInput = c }}
            id={`actionable-scenario-name-input-${this._nameInputId}`}
            defaultValue={name} onChange={(e) => { instance.data.name = e.currentTarget.value }}
          />
        </Row>
        <h6 className='show-in-procedure'>{instance.shortLabel}</h6>
        <Row className='section card form'>
          <h5>When:</h5>
          {this.renderExecutionTrigger()}

          <h5>With additional condition:</h5>
          <div className='col s12'>&nbsp;</div>
          <ConditionsDropdown
            onChange={this.setCondition.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} noCreationPanel defaultConditionId={executionCondition}
            typeFilter={() => false} icon={null} label='Set additional condition' dropdownId={uuid.v4()}
          >
            <option key='no-condition-option' value='no-condition'>No condition</option>
          </ConditionsDropdown>
        </Row>
        <Row className='section card form'>
          <h5>Then:</h5>
          <div className='col s12'>&nbsp;</div>
          <ActionsDropdown
            onChange={this.setAction.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} noCreationPanel defaultActionId={action}
            typeFilter={() => false} icon={null} label='Set an action' dropdownId={uuid.v4()}
          />
        </Row>

        <Row className='section card form' onClick={this.expandAdvanced.bind(this)}>
          {(advancedExpanded && (
            <span>
              <h5>Abort when:</h5>
              <div className='col s12'>&nbsp;</div>
              <TriggersDropdown
                onChange={this.setAbortTrigger.bind(this)} theme={theme} animationLevel={animationLevel}
                services={services} noCreationPanel defaultTriggerId={abortTrigger}
                typeFilter={() => false} icon={null} label='Set a trigger' dropdownId={uuid.v4()}
              >
                <option key='no-abort-trigger-option' value=''>No trigger</option>
              </TriggersDropdown>
            </span>
          )) || (
            <a href='javascript:void(0)'>Expand advanced settings</a>
          )}
        </Row>
      </div>
    )
  }

  renderExecutionTrigger () {
    const { theme, animationLevel, instance, services } = this.props
    const { executionTrigger } = instance.data

    const trigger = this.state.triggerEditPanel
    if (trigger !== undefined && trigger !== false) {
      if (trigger) { // can be null if not found!
        const TriggerEditForm = trigger.EditForm

        const deleteWaves = animationLevel >= 2 ? 'btn-flat waves-effect waves-red' : 'btn-flat'
        const deleteWavesConfirm = (animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${theme.actions.negative}`
        const globalizeWaves = animationLevel >= 2 ? 'btn-flat waves-effect' : 'btn-flat'

        return (
            <div className='executionTriggerForm'>
              <TriggerEditForm theme={theme} animationLevel={animationLevel}
                instance={this.state.triggerEditPanel} services={services}
              />

              {this.isExecutionTriggerGlobal() ? (
                <div className='global'>
                  <i className='material-icons'>public</i> Public Shared trigger, cannot be edited here.
                  <div className={cx('removeTrigger', this.state.deleteExecutionTriggerConfirm ? deleteWavesConfirm : deleteWaves)}
                    onClick={this.deleteExecutionTrigger.bind(this)}
                  >
                    <i className='material-icons'>clear</i>
                  </div>
                </div>
              ) : (
                <div className='local'>
                  <div className={cx('globalizeTrigger', globalizeWaves)} onClick={this.globalizeExecutionTrigger.bind(this)}>
                    <i className='material-icons'>public</i>
                  </div>
                  <div className={cx('removeTrigger', this.state.deleteExecutionTriggerConfirm ? deleteWavesConfirm : deleteWaves)}
                    onClick={this.deleteExecutionTrigger.bind(this)}
                  >
                    <i className='material-icons'>delete</i>
                  </div>
                </div>
              )}
            </div>
        )
      }

      // not found case (null)
      return (
        <div className='section card red-text'>
          <i className='material-icons'>warning</i> <i className='material-icons'>healing</i>&nbsp;
          The trigger that was here seems to be missing. This avoid the scenario to be run properly, so you have to fix this.
        </div>
      )
    } else {
      if (trigger !== false && executionTrigger) {
        this.setState({
          triggerEditPanel: false
        })
        setTimeout(() => {
          this.scenariiService.getTriggerInstance(executionTrigger, true)
          .then((trig) => {
            this.setState({
              triggerEditPanel: trig || null // force null if undefined (not found)
            })
          })
          .catch((error) => {
            this.setState({
              triggerEditPanel: null
            })
            console.error(error)
          })
        }, 200)
        return null
      }

      return executionTrigger ? null : (
        <div>
          <br />
          <TriggersDropdown
            onChange={this.setTrigger.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} parentIdForNewInstance={instance.instanceId} noCreationPanel
            typeFilter={() => true} icon={null} label='Set a trigger' dropdownId={uuid.v4()}
          />
        </div>
      )
    }
  }

  setAction (actionId) {
    this.props.instance.data.action = actionId
    this.betterName()
  }

  setTrigger (triggerId) {
    this.props.instance.data.executionTrigger = triggerId
    this.forceUpdate()
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

  isExecutionTriggerGlobal () {
    const trigger = this.state.triggerEditPanel
    if (trigger && trigger.parent === this.props.instance.instanceId) {
      return false
    }
    return true // by default if not fetched yet
  }

  deleteExecutionTrigger () {
    if (!this.state.deleteExecutionTriggerConfirm) {
      this._deleteExecutionTriggerConfirm()
      return
    }

    clearTimeout(this._deleteTimer)
    if (!this.isExecutionTriggerGlobal()) {
      this.scenariiService.deleteTriggerInstance({ instanceId: this.props.instance.data.executionTrigger })
    }
    this.setState({
      triggerEditPanel: undefined, // TODO !0: works ?
      deleteExecutionTriggerConfirm: false
    })
    // TODO !0: need force update ?
  }

  _deleteExecutionTriggerConfirm () {
    clearTimeout(this._deleteTimer)
    this.setState({
      deleteExecutionTriggerConfirm: true
    })
    if (element) {
      this._deleteTimer = setTimeout(() => {
        if (this._mounted) {
          this.setState({ deleteExecutionTriggerConfirm: false })
        }
      }, 3000)
    }
  }

  globalizeExecutionTrigger () {
    const trigger = this.state.triggerEditPanel
    if (trigger && trigger.parent === this.props.instance.instanceId) {
      trigger.parent = null
      this.scenariiService.setTriggerInstance(trigger, null)
        .then(() => this.forceUpdate())
      this.props.highlightCloseButton()
    }
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
