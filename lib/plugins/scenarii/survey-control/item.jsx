'use strict'

import React from 'react'

import { Item } from 'asterism-plugin-library'
import cx from 'classnames'
import { Button, Icon, ProgressBar, Row } from 'react-materialize'

class SurveyControlItem extends Item {
  constructor (props) {
    super(props)
    this.scenariiService = this.props.context.services['asterism-scenarii']

    this.state.scenario = null
    this.state.arming = false
    this.state.levelStateInstance = null
    this.state.stateListenerId = null
    this.state.currentLevel = 0 // 0=unknown
    this.receiveNewParams(this.state.params)

    this._mounted = false
    this._armingInterval = null
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

            this.state.scenario.data = data
            this.setState({
              arming: false
            })
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

    const alertIcons = levelStateInstance.data.max >= 3
      ? ['question_mark', 'done', 'warning', 'report']
      : ['question_mark', 'done', 'report']

    return (
      <div className={cx('fluid surveyControlItem', theme.backgrounds.card)}>
        {arming && (<ProgressBar progress={armingProgress} />)}

        <Row className='col s12 mainTitle'>
          {(activated && (<Icon>{alertIcons[currentLevel]}</Icon>)) || <Icon>block</Icon>}
          <div className='fluid'>
            <div className='truncate'>{name}</div>
          </div>
          {(arming || activated) ? <Icon>lock</Icon> : <Icon>lock_open</Icon>}
        </Row>

        <Row className='col s12 truncate'>
          {!activated && !arming && <i>Survey OFF</i>}
          {arming && <i>Activating...</i>}
          {activated && (((currentLevel > 1) && <i>TODO</i>) || <i>Clear</i>)}
        </Row>

        <Button
          waves={waves}
          className={cx(btnColor, 'truncate col s11')}
          onClick={this.switchActivation.bind(this)}
        >
          {arming ? 'Cancel' : (activated ? 'Deactivate' : 'Activate')}
          {arming && ('  (' + arming + 's)')}
        </Button>
      </div>
    )
  }

  switchActivation () {
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
        arming: scenario.data.armingDelay
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
      scenario.setActivation(false)
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
}

export default SurveyControlItem