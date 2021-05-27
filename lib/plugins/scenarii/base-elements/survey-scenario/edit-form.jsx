'use strict'

/* global $, noUiSlider, wNumb */
import PropTypes from 'prop-types'
import React from 'react'
import { TextInput, Row, Select } from 'react-materialize'
import uuid from 'uuid'

import { Scenarii } from 'asterism-plugin-library'
import cx from 'classnames'

const { StatesDropdown, ConditionsDropdown, TriggersDropdown, ActionsDropdown } = Scenarii

class BrowserSurveyScenarioEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: props.instance.data.name,
      armingDelay: props.instance.data.armingDelay,
      armingConditionsToNotice: props.instance.data.armingConditionsToNotice,
      armingConditionsToNoticeFolded: props.instance.data.armingConditionsToNotice.length > 0,
      raisingTriggers: props.instance.data.raisingTriggers,
      raisingTriggersFolded: props.instance.data.raisingTriggers.length > 0,
      deactivationTriggerIds: props.instance.data.deactivationTriggerIds,
      deactivationTriggersFolded: props.instance.data.deactivationTriggerIds.length > 0,
      armingActions: props.instance.data.armingActions,
      armingActionsFolded: props.instance.data.armingActions.length > 0,
      warningActions: props.instance.data.warningActions,
      warningActionsFolded: props.instance.data.warningActions.length > 0,
      alarmingActions: props.instance.data.alarmingActions,
      alarmingActionsFolded: props.instance.data.alarmingActions.length > 0,
      deactivationActions: props.instance.data.deactivationActions,
      deactivationActionsFolded: props.instance.data.deactivationActions.length > 0,
      deleteElementConfirm: null
    }

    this.scenariiService = props.services()['asterism-scenarii']
    this._socket = props.privateSocket

    this._nameInput = null
    this._nameInputId = uuid.v4()
    this._deleteTimer = null
  }

  componentDidMount (prevProps, prevState) {
    this._mounted = true
    this.scenariiService.getStateInstance(this.props.instance.data.levelStateId)
      .then((levelState) => {
        this.setState({
          levelState
        })
      })
    this.plugWidgets()
  }

  componentDidUpdate (prevProps, prevState) {
    this.plugWidgets()
  }

  componentWillUnmount () {
    this._mounted = false
  }

  plugWidgets () {
    const domSlider = $(`#delay-slider-${this.props.instance.instanceId}`)[0]
    if (!domSlider) {
      return
    }

    if (!this._slider || !domSlider.noUiSlider) {
      this._slider = noUiSlider.create(domSlider, {
        start: this.props.instance.data.armingDelay || 20,
        connect: true,
        step: 1,
        animate: true,
        range: {
          min: [0],
          '8%': [1, 1],
          '22%': [5, 5],
          '38%': [30, 10],
          '49%': [60, 15],
          '56%': [90, 30],
          '75%': [240, 60],
          '79%': [300, 50],
          max: [600]
        },
        format: wNumb({
          decimals: 1
        }),
        pips: { // Show a scale with the slider
          mode: 'steps',
          stepped: true,
          density: 4
        },
        tooltips: wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] }), // decimals: 0 does not work...
        behaviour: 'tap-drag',
        orientation: 'horizontal'
      })

      this._slider.on('change', this.changeDelay.bind(this))
    } else {
      this._slider.set(this.props.instance.data.armingDelay)
    }
  }

  render () {
    const { instance, theme, animationLevel, services } = this.props
    const { levelState, name, armingDelay, armingConditionsToNotice, armingConditionsToNoticeFolded } = this.state
    const { raisingTriggers, raisingTriggersFolded, deactivationTriggerIds, deactivationTriggersFolded } = this.state
    const { armingActions, armingActionsFolded, warningActions, warningActionsFolded } = this.state
    const { alarmingActions, alarmingActionsFolded, deactivationActions, deactivationActionsFolded } = this.state

    const waves = this.props.animationLevel >= 2 ? 'waves-effect waves-light' : undefined
    const deleteWaves = this.props.animationLevel >= 2 ? 'btn-flat waves-effect waves-red' : 'btn-flat'
    const deleteWavesConfirm = (this.props.animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${this.props.theme.actions.negative}`

    return (
      <div className='survey-scenario-panel'>
        <Row className='section card form hide-in-procedure'>
          <TextInput
            placeholder='Short name' s={12} ref={(c) => { this._nameInput = c }}
            id={`survey-scenario-name-input-${this._nameInputId}`}
            defaultValue={name} onChange={(e) => { instance.data.name = e.currentTarget.value }}
          />
        </Row>
        <Row className='section card form'>
          <h5>
            <i className='material-icons left'>timer</i>
            Arming delay <small>(actually {armingDelay}s)</small>
          </h5>
          <div key={2} className='col s12 slider'>
            <div id={`delay-slider-${instance.instanceId}`} />
          </div>
        </Row>
        <Row className='section card form'>
          <h5>
            <i className='material-icons left'>speed</i>
            Alarm level state <small>(2 or 3 levels: Ok, [Warning], Alarm)</small>
          </h5><br />
          <StatesDropdown
            defaultStateId={instance.data.levelStateId} onChange={this.levelStateChanged.bind(this)}
            theme={theme} animationLevel={animationLevel} services={services} s={12} label='Alarm state to update'
            typeFilter={(e) => e.id === 'level-state'} instanceFilter={(e) => e.typeId === 'level-state'}
          />
        </Row>

        <Row className='section card form min-height-6'>
          <h5 onClick={() => this.setState({ armingConditionsToNoticeFolded: !armingConditionsToNoticeFolded })}>
            <i className='material-icons left'>playlist_add_check</i>
            <div className={cx('folder btn-flat right', waves)}>
              <i className='material-icons'>{armingConditionsToNoticeFolded ? 'expand_more' : 'expand_less'}</i>
            </div>
            Conditions to notice when arming
          </h5>
          {!armingConditionsToNoticeFolded && (
            <ul>
              {armingConditionsToNotice.map(({ name, conditionId }, idx) => (
                <li key={uuid.v4()} className='col s12 sub-panels titled-embed-render'>
                  <TextInput
                    icon='check_circle_outline' placeholder='To notice when not met' s={8} m={9} l={10}
                    defaultValue={name} onChange={this.armingConditionToNoticeNameChanged.bind(this, idx)}
                  />
                  <div
                    className={cx('removeAction', this._isDeleteConfirmation(conditionId) ? deleteWavesConfirm : deleteWaves)}
                    onClick={this.deleteArmingConditionToNotice.bind(this, conditionId)}
                  >
                    <i className='material-icons'>{this.isArmingConditionToNoticeGlobal(conditionId) ? 'clear' : 'delete'}</i>
                  </div>
                  {this.isArmingConditionToNoticeGlobal(conditionId)
                    ? <div className='globalizeAction disabled'><i className='material-icons right'>public</i> Shared element, cannot be edited here.</div>
                    : (
                      <div className={cx('globalizeAction btn-flat', waves)} onClick={this.globalizeArmingConditionToNotice.bind(this, conditionId)}>
                        <i className='material-icons'>public</i>
                      </div>
                    )}
                  {this.renderArmingConditionToNotice(conditionId)}
                </li>
              ))}
              {armingConditionsToNotice.length < 32 && (
                <li className='col s12 sub-panels'>
                  <ConditionsDropdown
                    onChange={this.armingConditionToNoticeAdded.bind(this)} noCreationPanel
                    theme={theme} animationLevel={animationLevel} services={services} s={12} label='Arming condition to add'
                    icon='add' parentIdForNewInstance={instance.instanceId}
                  />
                </li>
              )}
            </ul>
          )}
        </Row>

        <Row className='section card form min-height-6'>
          <h5 onClick={() => this.setState({ raisingTriggersFolded: !raisingTriggersFolded })}>
            <i className='material-icons left'>notifications_active</i>
            <div className={cx('folder btn-flat right', waves)}>
              <i className='material-icons'>{raisingTriggersFolded ? 'expand_more' : 'expand_less'}</i>
            </div>
            Triggers that raise the alarm level
          </h5>
          {!raisingTriggersFolded && (
            <ul>
              {raisingTriggers.map(({ name, triggerId, warningDelay }, idx) => (
                <li key={uuid.v4()} className='col s12 sub-panels titled-embed-render'>
                  <TextInput
                    icon='notifications_active' placeholder='To notice when raising alarm level' s={6} m={7} l={7}
                    defaultValue={name} onChange={this.raisingTriggerNameChanged.bind(this, idx)}
                  />
                  {(levelState.data.max >= 3) && (
                    <Select s={2} m={2} l={3} label='Delay' icon='timer' onChange={this.raisingTriggerDelayChanged.bind(this, idx)} value={warningDelay || ''}>
                      <option value={0}>0s</option>
                      <option value={5}>5s</option>
                      <option value={10}>10s</option>
                      <option value={15}>15s</option>
                      <option value={20}>20s</option>
                      <option value={30}>30s</option>
                      <option value={40}>40s</option>
                      <option value={50}>50s</option>
                      <option value={60}>1m</option>
                    </Select>
                  )}
                  <div
                    className={cx('removeAction', this._isDeleteConfirmation(triggerId) ? deleteWavesConfirm : deleteWaves)}
                    onClick={this.deleteRaisingTrigger.bind(this, triggerId)}
                  >
                    <i className='material-icons'>{this.isRaisingTriggerGlobal(triggerId) ? 'clear' : 'delete'}</i>
                  </div>
                  {this.isRaisingTriggerGlobal(triggerId)
                    ? <div className='globalizeAction disabled'><i className='material-icons right'>public</i> Shared element, cannot be edited here.</div>
                    : (
                      <div className={cx('globalizeAction btn-flat', waves)} onClick={this.globalizeRaisingTrigger.bind(this, triggerId)}>
                        <i className='material-icons'>public</i>
                      </div>
                    )}
                  {this.renderRaisingTrigger(triggerId)}

                </li>
              ))}
              {raisingTriggers.length < 128 && (
                <li className='col s12 sub-panels'>
                  <TriggersDropdown
                    onChange={this.raisingTriggerAdded.bind(this)} noCreationPanel
                    theme={theme} animationLevel={animationLevel} services={services} s={12} label='Trigger to raise alarm level'
                    icon='add' parentIdForNewInstance={instance.instanceId}
                  />
                </li>
              )}
            </ul>
          )}
        </Row>

        <Row className='section card form min-height-6'>
          <h5 onClick={() => this.setState({ deactivationTriggersFolded: !deactivationTriggersFolded })}>
            <i className='material-icons left'>notifications_paused</i>
            <div className={cx('folder btn-flat right', waves)}>
              <i className='material-icons'>{deactivationTriggersFolded ? 'expand_more' : 'expand_less'}</i>
            </div>
            Triggers that lower the alarm level
          </h5>
          {!deactivationTriggersFolded && (
            <ul>
              {deactivationTriggerIds.map((triggerId, idx) => (
                <li key={uuid.v4()} className='col s12 sub-panels'>
                  <h6 className='col s6 m7 l7'><i className='material-icons left'>notifications_paused</i>#{idx + 1}:</h6>
                  <div
                    className={cx('removeAction', this._isDeleteConfirmation(triggerId) ? deleteWavesConfirm : deleteWaves)}
                    onClick={this.deleteDeactivationTrigger.bind(this, triggerId)}
                  >
                    <i className='material-icons'>{this.isDeactivationTriggerGlobal(triggerId) ? 'clear' : 'delete'}</i>
                  </div>
                  {this.isDeactivationTriggerGlobal(triggerId)
                    ? <div className='globalizeAction disabled'><i className='material-icons right'>public</i> Shared element, cannot be edited here.</div>
                    : (
                      <div className={cx('globalizeAction btn-flat', waves)} onClick={this.globalizeDeactivationTrigger.bind(this, triggerId)}>
                        <i className='material-icons'>public</i>
                      </div>
                    )}
                  {this.renderDeactivationTrigger(triggerId)}

                </li>
              ))}
              {deactivationTriggerIds.length < 16 && (
                <li className='col s12 sub-panels'>
                  <TriggersDropdown
                    onChange={this.deactivationTriggerAdded.bind(this)} noCreationPanel
                    theme={theme} animationLevel={animationLevel} services={services} s={12} label='Trigger to lower alarm level'
                    icon='add' parentIdForNewInstance={instance.instanceId}
                  />
                </li>
              )}
            </ul>
          )}
        </Row>

        <Row className='section card form min-height-6'>
          <h5 onClick={() => this.setState({ armingActionsFolded: !armingActionsFolded })}>
            <i className='material-icons left'>announcement</i>
            <div className={cx('folder btn-flat right', waves)}>
              <i className='material-icons'>{armingActionsFolded ? 'expand_more' : 'expand_less'}</i>
            </div>
            Actions during arming step
          </h5>
          {!armingActionsFolded && (
            <ul>
              {armingActions.map((actionId, idx) => (
                <li key={uuid.v4()} className='col s12 sub-panels'>
                  <h6 className='col s6 m7 l7'><i className='material-icons left'>announcement</i>#{idx + 1}:</h6>
                  <div
                    className={cx('removeAction', this._isDeleteConfirmation(actionId) ? deleteWavesConfirm : deleteWaves)}
                    onClick={this.deleteArmingAction.bind(this, actionId)}
                  >
                    <i className='material-icons'>{this.isArmingActionGlobal(actionId) ? 'clear' : 'delete'}</i>
                  </div>
                  {this.isArmingActionGlobal(actionId)
                    ? <div className='globalizeAction disabled'><i className='material-icons right'>public</i> Shared element, cannot be edited here.</div>
                    : (
                      <div className={cx('globalizeAction btn-flat', waves)} onClick={this.globalizeArmingAction.bind(this, actionId)}>
                        <i className='material-icons'>public</i>
                      </div>
                    )}
                  {this.renderArmingAction(actionId)}
                </li>
              ))}
              {armingActions.length < 16 && (
                <li className='col s12 sub-panels'>
                  <ActionsDropdown
                    onChange={this.armingActionAdded.bind(this)} noCreationPanel
                    theme={theme} animationLevel={animationLevel} services={services} s={12} label='Action during arming step'
                    icon='add' parentIdForNewInstance={instance.instanceId}
                  />
                </li>
              )}
            </ul>
          )}
        </Row>

        <Row className='section card form min-height-6'>
          <h5 onClick={() => this.setState({ warningActionsFolded: !warningActionsFolded })}>
            <i className='material-icons left'>report_problem</i>
            <div className={cx('folder btn-flat right', waves)}>
              <i className='material-icons'>{warningActionsFolded ? 'expand_more' : 'expand_less'}</i>
            </div>
            Actions triggered before alarming level
          </h5>
          {!warningActionsFolded && (
            <ul>
              {warningActions.map((actionId, idx) => (
                <li key={uuid.v4()} className='col s12 sub-panels'>
                  <h6 className='col s6 m7 l7'><i className='material-icons left'>report_problem</i>#{idx + 1}:</h6>
                  <div
                    className={cx('removeAction', this._isDeleteConfirmation(actionId) ? deleteWavesConfirm : deleteWaves)}
                    onClick={this.deleteWarningAction.bind(this, actionId)}
                  >
                    <i className='material-icons'>{this.isWarningActionGlobal(actionId) ? 'clear' : 'delete'}</i>
                  </div>
                  {this.isWarningActionGlobal(actionId)
                    ? <div className='globalizeAction disabled'><i className='material-icons right'>public</i> Shared element, cannot be edited here.</div>
                    : (
                      <div className={cx('globalizeAction btn-flat', waves)} onClick={this.globalizeWarningAction.bind(this, actionId)}>
                        <i className='material-icons'>public</i>
                      </div>
                    )}
                  {this.renderWarningAction(actionId)}
                </li>
              ))}
              {warningActions.length < 16 && (
                <li className='col s12 sub-panels'>
                  <ActionsDropdown
                    onChange={this.warningActionAdded.bind(this)} noCreationPanel
                    theme={theme} animationLevel={animationLevel} services={services} s={12} label='Action triggered before alarming level'
                    icon='add' parentIdForNewInstance={instance.instanceId}
                  />
                </li>
              )}
            </ul>
          )}
        </Row>

        <Row className='section card form min-height-6'>
          <h5 onClick={() => this.setState({ alarmingActionsFolded: !alarmingActionsFolded })}>
            <i className='material-icons left'>new_releases</i>
            <div className={cx('folder btn-flat right', waves)}>
              <i className='material-icons'>{alarmingActionsFolded ? 'expand_more' : 'expand_less'}</i>
            </div>
            Actions triggered when alarm raises
          </h5>
          {!alarmingActionsFolded && (
            <ul>
              {alarmingActions.map((actionId, idx) => (
                <li key={uuid.v4()} className='col s12 sub-panels'>
                  <h6 className='col s6 m7 l7'><i className='material-icons left'>new_releases</i>#{idx + 1}:</h6>
                  <div
                    className={cx('removeAction', this._isDeleteConfirmation(actionId) ? deleteWavesConfirm : deleteWaves)}
                    onClick={this.deleteAlarmingAction.bind(this, actionId)}
                  >
                    <i className='material-icons'>{this.isAlarmingActionGlobal(actionId) ? 'clear' : 'delete'}</i>
                  </div>
                  {this.isAlarmingActionGlobal(actionId)
                    ? <div className='globalizeAction disabled'><i className='material-icons right'>public</i> Shared element, cannot be edited here.</div>
                    : (
                      <div className={cx('globalizeAction btn-flat', waves)} onClick={this.globalizeAlarmingAction.bind(this, actionId)}>
                        <i className='material-icons'>public</i>
                      </div>
                    )}
                  {this.renderAlarmingAction(actionId)}
                </li>
              ))}
              {alarmingActions.length < 16 && (
                <li className='col s12 sub-panels'>
                  <ActionsDropdown
                    onChange={this.alarmingActionAdded.bind(this)} noCreationPanel
                    theme={theme} animationLevel={animationLevel} services={services} s={12} label='Action triggered when alarm raises'
                    icon='add' parentIdForNewInstance={instance.instanceId}
                  />
                </li>
              )}
            </ul>
          )}
        </Row>

        <Row className='section card form min-height-6'>
          <h5 onClick={() => this.setState({ deactivationActionsFolded: !deactivationActionsFolded })}>
            <i className='material-icons left'>report</i>
            <div className={cx('folder btn-flat right', waves)}>
              <i className='material-icons'>{deactivationActionsFolded ? 'expand_more' : 'expand_less'}</i>
            </div>
            Actions triggered when raised alarm is deactivated
          </h5>
          {!deactivationActionsFolded && (
            <ul>
              {deactivationActions.map((actionId, idx) => (
                <li key={uuid.v4()} className='col s12 sub-panels'>
                  <h6 className='col s6 m7 l7'><i className='material-icons left'>report</i>#{idx + 1}:</h6>
                  <div
                    className={cx('removeAction', this._isDeleteConfirmation(actionId) ? deleteWavesConfirm : deleteWaves)}
                    onClick={this.deleteDeactivationAction.bind(this, actionId)}
                  >
                    <i className='material-icons'>{this.isDeactivationActionGlobal(actionId) ? 'clear' : 'delete'}</i>
                  </div>
                  {this.isDeactivationActionGlobal(actionId)
                    ? <div className='globalizeAction disabled'><i className='material-icons right'>public</i> Shared element, cannot be edited here.</div>
                    : (
                      <div className={cx('globalizeAction btn-flat', waves)} onClick={this.globalizeDeactivationAction.bind(this, actionId)}>
                        <i className='material-icons'>public</i>
                      </div>
                    )}
                  {this.renderDeactivationAction(actionId)}
                </li>
              ))}
              {deactivationActions.length < 16 && (
                <li className='col s12 sub-panels'>
                  <ActionsDropdown
                    onChange={this.deactivationActionAdded.bind(this)} noCreationPanel
                    theme={theme} animationLevel={animationLevel} services={services} s={12} label='Action triggered when raised alarm is deactivated'
                    icon='add' parentIdForNewInstance={instance.instanceId}
                  />
                </li>
              )}
            </ul>
          )}
        </Row>
      </div>
    )
  }

  changeDelay (value) {
    const delay = parseInt(value[0].split('.')[0])
    this.props.instance.data.armingDelay = delay
    this.setState({ armingDelay: delay })
    this.props.highlightCloseButton()
  }

  levelStateChanged (value) {
    this.props.instance.data.levelStateId = value
    this.scenariiService.getStateInstance(value)
      .then((levelState) => {
        this.setState({
          levelState
        })
      })
    this.props.highlightCloseButton()
  }

  renderArmingConditionToNotice (conditionId) {
    if (this.state[`armingConditionToNoticeEditPanel-${conditionId}`] !== undefined) {
      const condition = this.state[`armingConditionToNoticeEditPanel-${conditionId}`]
      if (condition) {
        const ConditionEditForm = condition.EditForm
        return (
          <ConditionEditForm
            instance={condition} services={this.props.services}
            theme={this.props.theme} animationLevel={this.props.animationLevel}
            highlightCloseButton={() => this._saveLocalInstance(condition)}
          />
        )
      }

      // not found case
      return (
        <div className='section card red-text min-height-6'>
          <br />
          <i className='material-icons small left'>warning</i> <i className='material-icons small left'>healing</i>&nbsp;
          The condition that was here seems to be missing. This avoid the survey to be run properly, so you have to fix this.
        </div>
      )
    } else {
      this.scenariiService.getConditionInstance(conditionId, true)
        .then((condition) => {
          this.setState({
            [`armingConditionToNoticeEditPanel-${conditionId}`]: condition || null // force null if undefined (not found)
          })
        })
        .catch((error) => {
          this.setState({
            [`armingConditionToNoticeEditPanel-${conditionId}`]: null
          })
          console.error(error)
        })
      return null
    }
  }

  armingConditionToNoticeAdded (conditionId) {
    this.scenariiService.getConditionInstance(conditionId, true)
      .then((condition) => {
        this.props.instance.data.armingConditionsToNotice.push({
          name: condition.shortLabel,
          conditionId
        })
        this.setState({
          armingConditionsToNotice: this.props.instance.data.armingConditionsToNotice,
          [`armingConditionToNoticeEditPanel-${conditionId}`]: condition || null // force null if undefined (not found)
        })
        this.props.highlightCloseButton()
      })
  }

  armingConditionToNoticeNameChanged (index, event) {
    const namedCondition = this.props.instance.data.armingConditionsToNotice[index]
    namedCondition.name = event.currentTarget.value
    this.props.highlightCloseButton()
  }

  isArmingConditionToNoticeGlobal (conditionId) {
    const condition = this.state[`armingConditionToNoticeEditPanel-${conditionId}`]
    if (condition && condition.parent === this.props.instance.instanceId) {
      return false
    }
    return true // by default if not fetched yet
  }

  globalizeArmingConditionToNotice (conditionId) {
    const condition = this.state[`armingConditionToNoticeEditPanel-${conditionId}`]
    if (condition && condition.parent === this.props.instance.instanceId) {
      condition.parent = null
      this.scenariiService.setConditionInstance(condition, null)
        .then(() => {
          this.forceUpdate()
          if (this.props.scenariiPanel) {
            this.props.scenariiPanel._tabs[1].forceUpdate()
          }
        })
      this.props.highlightCloseButton()
    }
  }

  deleteArmingConditionToNotice (conditionId) {
    if (!this._isDeleteConfirmation(conditionId)) {
      this._deleteConfirm(conditionId)
      return
    }
    this._deleteConfirm(null)

    if (!this.isArmingConditionToNoticeGlobal(conditionId)) {
      this.scenariiService.deleteConditionInstance({ instanceId: conditionId })
    }
    this.props.instance.data.armingConditionsToNotice = this.props.instance.data.armingConditionsToNotice.filter((c) => c.conditionId !== conditionId)
    const { ...newState } = this.state
    delete newState[`armingConditionToNoticeEditPanel-${conditionId}`]
    newState.armingConditionsToNotice = this.props.instance.data.armingConditionsToNotice
    this.setState(newState)

    this.props.highlightCloseButton()
  }

  renderRaisingTrigger (triggerId) {
    if (this.state[`raisingTriggerEditPanel-${triggerId}`] !== undefined) {
      const trigger = this.state[`raisingTriggerEditPanel-${triggerId}`]
      if (trigger) {
        const TriggerEditForm = trigger.EditForm
        return (
          <TriggerEditForm
            instance={trigger} services={this.props.services}
            theme={this.props.theme} animationLevel={this.props.animationLevel}
            highlightCloseButton={() => this._saveLocalInstance(trigger)}
          />
        )
      }

      // not found case
      return (
        <div className='section card red-text min-height-6'>
          <br />
          <i className='material-icons small left'>warning</i> <i className='material-icons small left'>healing</i>&nbsp;
          The trigger that was here seems to be missing. This avoid the survey to be run properly, so you have to fix this.
        </div>
      )
    } else {
      this.scenariiService.getTriggerInstance(triggerId, true)
        .then((trigger) => {
          this.setState({
            [`raisingTriggerEditPanel-${triggerId}`]: trigger || null // force null if undefined (not found)
          })
        })
        .catch((error) => {
          this.setState({
            [`raisingTriggerEditPanel-${triggerId}`]: null
          })
          console.error(error)
        })
      return null
    }
  }

  raisingTriggerAdded (triggerId) {
    this.scenariiService.getTriggerInstance(triggerId, true)
      .then((trigger) => {
        this.props.instance.data.raisingTriggers.push({
          name: trigger.shortLabel,
          triggerId,
          warningDelay: 10
        })
        this.setState({
          raisingTriggers: this.props.instance.data.raisingTriggers,
          [`raisingTriggerEditPanel-${triggerId}`]: trigger || null // force null if undefined (not found)
        })
        this.props.highlightCloseButton()
      })
  }

  raisingTriggerNameChanged (index, event) {
    const namedRaisingTrigger = this.props.instance.data.raisingTriggers[index]
    namedRaisingTrigger.name = event.currentTarget.value
    this.props.highlightCloseButton()
  }

  raisingTriggerDelayChanged (index, event) {
    const namedRaisingTrigger = this.props.instance.data.raisingTriggers[index]
    namedRaisingTrigger.warningDelay = event.currentTarget.value
    this.props.highlightCloseButton()
  }

  isRaisingTriggerGlobal (triggerId) {
    const trigger = this.state[`raisingTriggerEditPanel-${triggerId}`]
    if (trigger && trigger.parent === this.props.instance.instanceId) {
      return false
    }
    return true // by default if not fetched yet
  }

  globalizeRaisingTrigger (triggerId) {
    const trigger = this.state[`raisingTriggerEditPanel-${triggerId}`]
    if (trigger && trigger.parent === this.props.instance.instanceId) {
      trigger.parent = null
      this.scenariiService.setTriggerInstance(trigger, null)
        .then(() => {
          this.forceUpdate()
          if (this.props.scenariiPanel) {
            this.props.scenariiPanel._tabs[3].forceUpdate()
          }
        })
      this.props.highlightCloseButton()
    }
  }

  deleteRaisingTrigger (triggerId) {
    if (!this._isDeleteConfirmation(triggerId)) {
      this._deleteConfirm(triggerId)
      return
    }
    this._deleteConfirm(null)

    if (!this.isRaisingTriggerGlobal(triggerId)) {
      this.scenariiService.deleteTriggerInstance({ instanceId: triggerId })
    }
    this.props.instance.data.raisingTriggers = this.props.instance.data.raisingTriggers.filter((c) => c.triggerId !== triggerId)
    const { ...newState } = this.state
    delete newState[`raisingTriggerEditPanel-${triggerId}`]
    newState.raisingTriggers = this.props.instance.data.raisingTriggers
    this.setState(newState)

    this.props.highlightCloseButton()
  }

  renderDeactivationTrigger (triggerId) {
    if (this.state[`deactivationTriggerEditPanel-${triggerId}`] !== undefined) {
      const trigger = this.state[`deactivationTriggerEditPanel-${triggerId}`]
      if (trigger) {
        const TriggerEditForm = trigger.EditForm
        return (
          <TriggerEditForm
            instance={trigger} services={this.props.services}
            theme={this.props.theme} animationLevel={this.props.animationLevel}
            highlightCloseButton={() => this._saveLocalInstance(trigger)}
          />
        )
      }

      // not found case
      return (
        <div className='section card red-text min-height-6'>
          <br />
          <i className='material-icons small left'>warning</i> <i className='material-icons small left'>healing</i>&nbsp;
          The trigger that was here seems to be missing. This avoid the survey to be run properly, so you have to fix this.
        </div>
      )
    } else {
      this.scenariiService.getTriggerInstance(triggerId, true)
        .then((trigger) => {
          this.setState({
            [`deactivationTriggerEditPanel-${triggerId}`]: trigger || null // force null if undefined (not found)
          })
        })
        .catch((error) => {
          this.setState({
            [`deactivationTriggerEditPanel-${triggerId}`]: null
          })
          console.error(error)
        })
      return null
    }
  }

  deactivationTriggerAdded (triggerId) {
    this.scenariiService.getTriggerInstance(triggerId, true)
      .then((trigger) => {
        this.props.instance.data.deactivationTriggerIds.push(triggerId)
        this.setState({
          deactivationTriggerIds: this.props.instance.data.deactivationTriggerIds,
          [`deactivationTriggerEditPanel-${triggerId}`]: trigger || null // force null if undefined (not found)
        })
        this.props.highlightCloseButton()
      })
  }

  isDeactivationTriggerGlobal (triggerId) {
    const trigger = this.state[`deactivationTriggerEditPanel-${triggerId}`]
    if (trigger && trigger.parent === this.props.instance.instanceId) {
      return false
    }
    return true // by default if not fetched yet
  }

  globalizeDeactivationTrigger (triggerId) {
    const trigger = this.state[`deactivationTriggerEditPanel-${triggerId}`]
    if (trigger && trigger.parent === this.props.instance.instanceId) {
      trigger.parent = null
      this.scenariiService.setTriggerInstance(trigger, null)
        .then(() => {
          this.forceUpdate()
          if (this.props.scenariiPanel) {
            this.props.scenariiPanel._tabs[3].forceUpdate()
          }
        })
      this.props.highlightCloseButton()
    }
  }

  deleteDeactivationTrigger (triggerId) {
    if (!this._isDeleteConfirmation(triggerId)) {
      this._deleteConfirm(triggerId)
      return
    }
    this._deleteConfirm(null)

    if (!this.isDeactivationTriggerGlobal(triggerId)) {
      this.scenariiService.deleteTriggerInstance({ instanceId: triggerId })
    }
    this.props.instance.data.deactivationTriggerIds = this.props.instance.data.deactivationTriggerIds.filter((id) => id !== triggerId)
    const { ...newState } = this.state
    delete newState[`deactivationTriggerEditPanel-${triggerId}`]
    newState.deactivationTriggerIds = this.props.instance.data.deactivationTriggerIds
    this.setState(newState)

    this.props.highlightCloseButton()
  }

  renderArmingAction (actionId) {
    if (this.state[`armingActionEditPanel-${actionId}`] !== undefined) {
      const action = this.state[`armingActionEditPanel-${actionId}`]
      if (action) {
        const ActionEditForm = action.EditForm
        return (
          <ActionEditForm
            instance={action} services={this.props.services}
            theme={this.props.theme} animationLevel={this.props.animationLevel}
            highlightCloseButton={() => this._saveLocalInstance(action)}
          />
        )
      }

      // not found case
      return (
        <div className='section card red-text min-height-6'>
          <br />
          <i className='material-icons small left'>warning</i> <i className='material-icons small left'>healing</i>&nbsp;
          The action that was here seems to be missing. This avoid the survey to be run properly, so you have to fix this.
        </div>
      )
    } else {
      this.scenariiService.getActionInstance(actionId, true)
        .then((action) => {
          this.setState({
            [`armingActionEditPanel-${actionId}`]: action || null // force null if undefined (not found)
          })
        })
        .catch((error) => {
          this.setState({
            [`armingActionEditPanel-${actionId}`]: null
          })
          console.error(error)
        })
      return null
    }
  }

  armingActionAdded (actionId) {
    this.scenariiService.getActionInstance(actionId, true)
      .then((action) => {
        this.props.instance.data.armingActions.push(actionId)
        this.setState({
          armingActions: this.props.instance.data.armingActions,
          [`armingActionEditPanel-${actionId}`]: action || null // force null if undefined (not found)
        })
        this.props.highlightCloseButton()
      })
  }

  isArmingActionGlobal (actionId) {
    const action = this.state[`armingActionEditPanel-${actionId}`]
    if (action && action.parent === this.props.instance.instanceId) {
      return false
    }
    return true // by default if not fetched yet
  }

  globalizeArmingAction (actionId) {
    const action = this.state[`armingActionEditPanel-${actionId}`]
    if (action && action.parent === this.props.instance.instanceId) {
      action.parent = null
      this.scenariiService.setActionInstance(action, null)
        .then(() => {
          this.forceUpdate()
          if (this.props.scenariiPanel) {
            this.props.scenariiPanel._tabs[2].forceUpdate()
          }
        })
      this.props.highlightCloseButton()
    }
  }

  deleteArmingAction (actionId) {
    if (!this._isDeleteConfirmation(actionId)) {
      this._deleteConfirm(actionId)
      return
    }
    this._deleteConfirm(null)

    if (!this.isArmingActionGlobal(actionId)) {
      this.scenariiService.deleteActionInstance({ instanceId: actionId })
    }
    this.props.instance.data.armingActions = this.props.instance.data.armingActions.filter((id) => id !== actionId)
    const { ...newState } = this.state
    delete newState[`armingActionEditPanel-${actionId}`]
    newState.armingActions = this.props.instance.data.armingActions
    this.setState(newState)

    this.props.highlightCloseButton()
  }

  renderWarningAction (actionId) {
    if (this.state[`warningActionEditPanel-${actionId}`] !== undefined) {
      const action = this.state[`warningActionEditPanel-${actionId}`]
      if (action) {
        const ActionEditForm = action.EditForm
        return (
          <ActionEditForm
            instance={action} services={this.props.services}
            theme={this.props.theme} animationLevel={this.props.animationLevel}
            highlightCloseButton={() => this._saveLocalInstance(action)}
          />
        )
      }

      // not found case
      return (
        <div className='section card red-text min-height-6'>
          <br />
          <i className='material-icons small left'>warning</i> <i className='material-icons small left'>healing</i>&nbsp;
          The action that was here seems to be missing. This avoid the survey to be run properly, so you have to fix this.
        </div>
      )
    } else {
      this.scenariiService.getActionInstance(actionId, true)
        .then((action) => {
          this.setState({
            [`warningActionEditPanel-${actionId}`]: action || null // force null if undefined (not found)
          })
        })
        .catch((error) => {
          this.setState({
            [`warningActionEditPanel-${actionId}`]: null
          })
          console.error(error)
        })
      return null
    }
  }

  warningActionAdded (actionId) {
    this.scenariiService.getActionInstance(actionId, true)
      .then((action) => {
        this.props.instance.data.warningActions.push(actionId)
        this.setState({
          warningActions: this.props.instance.data.warningActions,
          [`warningActionEditPanel-${actionId}`]: action || null // force null if undefined (not found)
        })
        this.props.highlightCloseButton()
      })
  }

  isWarningActionGlobal (actionId) {
    const action = this.state[`warningActionEditPanel-${actionId}`]
    if (action && action.parent === this.props.instance.instanceId) {
      return false
    }
    return true // by default if not fetched yet
  }

  globalizeWarningAction (actionId) {
    const action = this.state[`warningActionEditPanel-${actionId}`]
    if (action && action.parent === this.props.instance.instanceId) {
      action.parent = null
      this.scenariiService.setActionInstance(action, null)
        .then(() => {
          this.forceUpdate()
          if (this.props.scenariiPanel) {
            this.props.scenariiPanel._tabs[2].forceUpdate()
          }
        })
      this.props.highlightCloseButton()
    }
  }

  deleteWarningAction (actionId) {
    if (!this._isDeleteConfirmation(actionId)) {
      this._deleteConfirm(actionId)
      return
    }
    this._deleteConfirm(null)

    if (!this.isWarningActionGlobal(actionId)) {
      this.scenariiService.deleteActionInstance({ instanceId: actionId })
    }
    this.props.instance.data.warningActions = this.props.instance.data.warningActions.filter((id) => id !== actionId)
    const { ...newState } = this.state
    delete newState[`warningActionEditPanel-${actionId}`]
    newState.warningActions = this.props.instance.data.warningActions
    this.setState(newState)

    this.props.highlightCloseButton()
  }

  renderAlarmingAction (actionId) {
    if (this.state[`alarmingActionEditPanel-${actionId}`] !== undefined) {
      const action = this.state[`alarmingActionEditPanel-${actionId}`]
      if (action) {
        const ActionEditForm = action.EditForm
        return (
          <ActionEditForm
            instance={action} services={this.props.services}
            theme={this.props.theme} animationLevel={this.props.animationLevel}
            highlightCloseButton={() => this._saveLocalInstance(action)}
          />
        )
      }

      // not found case
      return (
        <div className='section card red-text min-height-6'>
          <br />
          <i className='material-icons small left'>warning</i> <i className='material-icons small left'>healing</i>&nbsp;
          The action that was here seems to be missing. This avoid the survey to be run properly, so you have to fix this.
        </div>
      )
    } else {
      this.scenariiService.getActionInstance(actionId, true)
        .then((action) => {
          this.setState({
            [`alarmingActionEditPanel-${actionId}`]: action || null // force null if undefined (not found)
          })
        })
        .catch((error) => {
          this.setState({
            [`alarmingActionEditPanel-${actionId}`]: null
          })
          console.error(error)
        })
      return null
    }
  }

  alarmingActionAdded (actionId) {
    this.scenariiService.getActionInstance(actionId, true)
      .then((action) => {
        this.props.instance.data.alarmingActions.push(actionId)
        this.setState({
          alarmingActions: this.props.instance.data.alarmingActions,
          [`alarmingActionEditPanel-${actionId}`]: action || null // force null if undefined (not found)
        })
        this.props.highlightCloseButton()
      })
  }

  isAlarmingActionGlobal (actionId) {
    const action = this.state[`alarmingActionEditPanel-${actionId}`]
    if (action && action.parent === this.props.instance.instanceId) {
      return false
    }
    return true // by default if not fetched yet
  }

  globalizeAlarmingAction (actionId) {
    const action = this.state[`alarmingActionEditPanel-${actionId}`]
    if (action && action.parent === this.props.instance.instanceId) {
      action.parent = null
      this.scenariiService.setActionInstance(action, null)
        .then(() => {
          this.forceUpdate()
          if (this.props.scenariiPanel) {
            this.props.scenariiPanel._tabs[2].forceUpdate()
          }
        })
      this.props.highlightCloseButton()
    }
  }

  deleteAlarmingAction (actionId) {
    if (!this._isDeleteConfirmation(actionId)) {
      this._deleteConfirm(actionId)
      return
    }
    this._deleteConfirm(null)

    if (!this.isAlarmingActionGlobal(actionId)) {
      this.scenariiService.deleteActionInstance({ instanceId: actionId })
    }
    this.props.instance.data.alarmingActions = this.props.instance.data.alarmingActions.filter((id) => id !== actionId)
    const { ...newState } = this.state
    delete newState[`alarmingActionEditPanel-${actionId}`]
    newState.alarmingActions = this.props.instance.data.alarmingActions
    this.setState(newState)

    this.props.highlightCloseButton()
  }

  renderDeactivationAction (actionId) {
    if (this.state[`deactivationActionEditPanel-${actionId}`] !== undefined) {
      const action = this.state[`deactivationActionEditPanel-${actionId}`]
      if (action) {
        const ActionEditForm = action.EditForm
        return (
          <ActionEditForm
            instance={action} services={this.props.services}
            theme={this.props.theme} animationLevel={this.props.animationLevel}
            highlightCloseButton={() => this._saveLocalInstance(action)}
          />
        )
      }

      // not found case
      return (
        <div className='section card red-text min-height-6'>
          <br />
          <i className='material-icons small left'>warning</i> <i className='material-icons small left'>healing</i>&nbsp;
          The action that was here seems to be missing. This avoid the survey to be run properly, so you have to fix this.
        </div>
      )
    } else {
      this.scenariiService.getActionInstance(actionId, true)
        .then((action) => {
          this.setState({
            [`deactivationActionEditPanel-${actionId}`]: action || null // force null if undefined (not found)
          })
        })
        .catch((error) => {
          this.setState({
            [`deactivationActionEditPanel-${actionId}`]: null
          })
          console.error(error)
        })
      return null
    }
  }

  deactivationActionAdded (actionId) {
    this.scenariiService.getActionInstance(actionId, true)
      .then((action) => {
        this.props.instance.data.deactivationActions.push(actionId)
        this.setState({
          deactivationActions: this.props.instance.data.deactivationActions,
          [`deactivationActionEditPanel-${actionId}`]: action || null // force null if undefined (not found)
        })
        this.props.highlightCloseButton()
      })
  }

  isDeactivationActionGlobal (actionId) {
    const action = this.state[`deactivationActionEditPanel-${actionId}`]
    if (action && action.parent === this.props.instance.instanceId) {
      return false
    }
    return true // by default if not fetched yet
  }

  globalizeDeactivationAction (actionId) {
    const action = this.state[`deactivationActionEditPanel-${actionId}`]
    if (action && action.parent === this.props.instance.instanceId) {
      action.parent = null
      this.scenariiService.setActionInstance(action, null)
        .then(() => {
          this.forceUpdate()
          if (this.props.scenariiPanel) {
            this.props.scenariiPanel._tabs[2].forceUpdate()
          }
        })
      this.props.highlightCloseButton()
    }
  }

  deleteDeactivationAction (actionId) {
    if (!this._isDeleteConfirmation(actionId)) {
      this._deleteConfirm(actionId)
      return
    }
    this._deleteConfirm(null)

    if (!this.isDeactivationActionGlobal(actionId)) {
      this.scenariiService.deleteActionInstance({ instanceId: actionId })
    }
    this.props.instance.data.deactivationActions = this.props.instance.data.deactivationActions.filter((id) => id !== actionId)
    const { ...newState } = this.state
    delete newState[`deactivationActionEditPanel-${actionId}`]
    newState.deactivationActions = this.props.instance.data.deactivationActions
    this.setState(newState)

    this.props.highlightCloseButton()
  }

  _isDeleteConfirmation (elementId) {
    return this.state.deleteElementConfirm === elementId
  }

  _deleteConfirm (element) {
    clearTimeout(this._deleteTimer)
    if (this.state.deleteElementConfirm !== element) {
      this.setState({
        deleteElementConfirm: element
      })
    }
    if (element) {
      this._deleteTimer = setTimeout(() => {
        if (this._mounted) {
          this.setState({ deleteElementConfirm: null })
        }
      }, 3000)
    }
  }

  _saveLocalInstance (instance) {
    const save = (instance.presave) ? instance.presave(this.props.services).then(() => instance.save()) : instance.save()
    return save
      .catch((error) => {
        $('#scenarii-persistence-error-modal p').html(error ? error.message : 'Unknown error saving element!')
        $('#scenarii-persistence-error-modal').modal('open')
      })
  }
}

BrowserSurveyScenarioEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserSurveyScenarioEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserSurveyScenarioEditForm.label = 'Survey scenario'

export default BrowserSurveyScenarioEditForm
