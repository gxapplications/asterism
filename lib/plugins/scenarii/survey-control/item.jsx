'use strict'

/* global $ */
import React from 'react'

import { Item, PatternLock } from 'asterism-plugin-library'
import cx from 'classnames'
import { Button, Icon, Modal, ProgressBar, Row } from 'react-materialize'

class SurveyControlItem extends Item {
  constructor (props) {
    super(props)
    this.scenariiService = this.props.context.services['asterism-scenarii']
    // hack to have main asterism scoped serverStorage
    const DefaultServerStorage = this.props.context.serverStorage.constructor
    this.rootServerStorage = new DefaultServerStorage('asterism')

    this.state.scenario = null
    this.state.arming = false
    this.state.levelStateInstance = null
    this.state.stateListenerId = null
    this.state.currentLevel = 0 // 0=unknown
    this.state.alarmMessage = null
    this.state.warningDelay = null
    this.receiveNewParams(this.state.params)

    this._mounted = false
    this._armingInterval = null
    this._warningInterval = null
  }

  receiveNewParams (params) {
    if (params.scenario) {
      this.scenariiService.getScenarioInstance(params.scenario, true)
        .then((scenario) => {
          if (scenario.data.levelStateId) {
            this.scenariiService.getStateInstance(scenario.data.levelStateId)
              .then((levelStateInstance) => {
                this.setState({
                  params,
                  scenario,
                  levelStateInstance,
                  currentLevel: levelStateInstance.data.state,
                  stateListenerId: this.scenariiService.addStateListener(levelStateInstance, this.updateLevel.bind(this))
                })
              })
          } else {
            this.setState({
              params,
              scenario
            })
          }

          this.scenariiService.privateSocket.on('scenarioActivationChanged', ({ instanceId, data }) => {
            if (!this._mounted || (params.scenario !== instanceId)) {
              return
            }

            this.state.scenario.data = data // do not trigger a refresh
            this.setState({
              arming: false
            })
          })

          this.scenariiService.privateSocket.on('surveyLevelChanged', ({ instanceId, triggerId, triggerName, delay, level }) => {
            if (!this._mounted || (params.scenario !== instanceId)) {
              return
            }

            console.log('###### ON surveyLevelChanged', level) // TODO !0: modal close to test

            if (level <= 2) {
              $(`#survey-pattern-${scenario.instanceId}`).modal('close')
              return this.setState({
                alarmMessage: null,
                warningDelay: null
              })
            }

            this.setState({
              alarmMessage: triggerName || null,
              warningDelay: delay || null
            })
            if (this._warningInterval) {
              clearInterval(this._warningInterval)
            }
            if (delay > 0) {
              this._warningInterval = setInterval(() => {
                const d = this.state.warningDelay - 1
                if (d <= 0) {
                  clearInterval(this._warningInterval)
                }
                this.setState({ warningDelay: d })
              }, 1000)
            }

            $(`#survey-pattern-${instanceId}`).modal('open')
          })
        })
        .catch(() => {})
    }
  }

  componentDidMount () {
    this._mounted = true
  }

  componentWillUnmount () {
    try {
      this._mounted = false
      if (this.state.stateListenerId) {
        this.scenariiService.removeStateListener(this.state.levelStateInstance, this.state.stateListenerId)
      }
    } catch (e) {}
  }

  shouldComponentUpdate (nextProps, nextState) {
    // TODO !2
    return true
  }

  renderAlarmStatus () {
    const { alarmMessage, warningDelay } = this.state
    return (
      <i>
        {alarmMessage || ''}
        &nbsp;&nbsp;
        {warningDelay > 0 && `(${warningDelay}s left)`}
      </i>
    )
  }

  renderPattern () {
    const { mainState, theme } = this.props.context
    const { animationLevel } = mainState()
    const { scenario, alarmMessage, warningDelay, levelStateInstance, currentLevel } = this.state
    const { name } = scenario.data

    const isWarning = levelStateInstance.data.max >= 4 && currentLevel === 3
    const isAlarming = !isWarning && currentLevel > 2
    const modalColor = isWarning ? theme.feedbacks.warning : (isAlarming ? theme.feedbacks.error : theme.feedbacks.success)

    return (
      <Modal
        id={`survey-pattern-${scenario.instanceId}`} header={name} options={{
          inDuration: animationLevel >= 2 ? 300 : 0,
          outDuration: animationLevel >= 2 ? 300 : 0,
          preventScrolling: true,
          endingTop: '5%'
        }}
        className={cx(modalColor, 'survey-pattern-modal')}
      >
        <div className='truncate'>
          {alarmMessage || 'Clear'}
        </div>
        <div className='delay'>
          {(!!warningDelay && (warningDelay + 's')) || ''}
        </div>
        <PatternLock theme={theme} animationLevel={animationLevel} patternCallback={this.patternDraw.bind(this)} />
      </Modal>
    )
  }

  render () {
    const { mainState, theme } = this.props.context
    const { animationLevel } = mainState()
    const { scenario, arming, currentLevel, levelStateInstance } = this.state

    const waves = animationLevel >= 2 ? 'light' : undefined

    if (!scenario) {
      return (
        <Button waves={waves} className={cx(theme.feedbacks.warning, 'truncate fluid')} onClick={() => {}}>
          <Icon left className='red-text'>healing</Icon>
          No scenario set
        </Button>
      )
    }

    const { name, armingDelay, activated } = scenario.data
    const armingProgress = 100 * ((armingDelay - (arming || 0) + 1) / armingDelay)

    const btnColor = activated ? theme.feedbacks.warning : (arming
      ? theme.feedbacks.progressing
      : theme.actions.inconspicious)

    const alertIcons = levelStateInstance.data.max >= 4
      ? ['question_mark', 'done', 'warning', 'report']
      : ['question_mark', 'done', 'report']

    return (
      <div className={cx('fluid surveyControlItem', theme.backgrounds.card)}>
        {arming && (<ProgressBar progress={armingProgress} />)}

        <Row className='col s12 mainTitle'>
          {(activated && (<Icon>{alertIcons[currentLevel-1]}</Icon>)) || <Icon>block</Icon>}
          <div className='fluid'>
            <div className='truncate'>{name}</div>
          </div>
          {(arming || activated) ? <Icon>lock</Icon> : <Icon>lock_open</Icon>}
        </Row>

        <Row className='col s12 truncate'>
          {!activated && !arming && <i>Survey OFF</i>}
          {arming && <i>Activating...</i>}
          {activated && (((currentLevel > 2) && this.renderAlarmStatus()) || <i>Clear</i>)}
        </Row>

        <Button
          waves={waves}
          className={cx(btnColor, 'truncate col s11')}
          onClick={this.switchActivation.bind(this, false)}
        >
          {arming ? 'Cancel' : (activated ? 'Deactivate' : 'Activate')}
          {arming && ('  (' + arming + 's)')}
        </Button>
        {this.renderPattern()}
      </div>
    )
  }

  switchActivation (force = false) {
    const { scenario, arming } = this.state

    if (arming) { // cancel case
      scenario.setActivation(false)
      if (this._armingInterval) {
        clearInterval(this._armingInterval)
      }
      return
    }

    if (!scenario.data.activated) {
      this.setState({
        arming: scenario.data.armingDelay,
        alarmMessage: null
      })
      scenario.setActivation(true, (scenario.data.armingDelay * 1000) + 2000) // big timeout limit set
      this._armingInterval = setInterval(() => {
        if (this._mounted && this.state.arming > 0) {
          this.setState({
            arming: this.state.arming - 1
          })
        } else {
          clearInterval(this._armingInterval)
        }
      }, 1000)
    } else {
      if (force) {
        scenario.setActivation(false)
        this.setState({ alarmMessage: null })
        $(`#survey-pattern-${scenario.instanceId}`).modal('close')
      } else {
        $(`#survey-pattern-${scenario.instanceId}`).modal('open')
      }
    }
  }

  updateLevel (level, levelState) {
    this.setState({
      levelStateInstance: Object.assign(this.state.levelStateInstance, levelState),
      currentLevel: level
    })
  }

  refresh () {
    if (this.state.params.scenario) {
      this.scenariiService.getScenarioInstance(this.state.params.scenario, true)
        .then((scenario) => {
          if (scenario.data.levelStateId) {
            this.scenariiService.getStateInstance(scenario.data.levelStateId)
              .then((levelStateInstance) => {
                this.setState({
                  scenario,
                  levelStateInstance,
                  currentLevel: levelStateInstance.data.state
                })
              })
          }
        })
        .catch(() => {})
    }
  }

  patternDraw (pattern) {
    if (!pattern) return
    return Promise.all([
      this.rootServerStorage.getItem('security-admin').catch(() => false),
      this.rootServerStorage.getItem('security-readOnly').catch(() => false)
    ])
      .then(([adminPattern, readOnlyPattern]) => {
        if (readOnlyPattern?.pattern === pattern || adminPattern?.pattern === pattern) {
          this.switchActivation(true)
        }
        throw new Error('Pattern mismatch')
      })
  }
}

export default SurveyControlItem
