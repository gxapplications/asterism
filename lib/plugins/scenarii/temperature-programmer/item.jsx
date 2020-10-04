'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Icon } from 'react-materialize'

import { Item, TemperatureProgrammer } from 'asterism-plugin-library'

class TemperatureProgrammerItem extends Item {
  constructor (props) {
    super(props)
    this.scenariiService = this.props.context.services['asterism-scenarii']

    this.state.scenario = null
    this.state.temperatureStateInstance = null
    this.receiveNewParams(this.state.params)

    this._programmer = null
    this._mounted = false
  }

  receiveNewParams (params) {
    if (params.scenario) {
      this.scenariiService.getScenarioInstance(params.scenario, true)
        .then((scenario) => {
          if (scenario.data.temperatureStateId) {
            this.scenariiService.getStateInstance(scenario.data.temperatureStateId)
              .then((temperatureStateInstance) => {
                const listener = this.scenariiService.addStateListener(temperatureStateInstance, (level, levelState) => {
                  Object.assign(this.state.temperatureStateInstance, levelState)
                  this._updateModeText()
                })
                this.setState({
                  params,
                  scenario,
                  temperatureStateInstance,
                  temperatureStateListenerId: listener
                })
              })
              .catch(() => {
                this.setState({
                  params,
                  scenario
                })
              })
          } else {
            this.setState({
              params,
              scenario
            })
          }

          this.scenariiService.privateSocket.on('scenarioThermostatStateChanged', ({ instanceId, data }) => {
            if (!this._mounted || (params.scenario !== instanceId)) {
              return
            }
            const hadOverriddenProgram = this.state.scenario.data.overriddenProgram
            this.state.scenario.data = data
            this._updateModeText()
            this._programmer && this._programmer.doubleKnob && this._programmer.doubleKnob.setCenter(
              this._programmer.centerText[data.forceModeEnd ? 1 : 0],
              !!data.forceModeEnd
            )

            if (data.overriddenProgram !== hadOverriddenProgram) {
              this.forceUpdate()
            }
          })
        })
        .catch(() => {})
    }
  }

  componentDidMount () {
    this._mounted = true

    // Auto refresh every 30 minutes, rounded
    let oClock = new Date()
    oClock.setMinutes(oClock.getMinutes() < 30 ? 0 : 30, 1, 500)
    oClock = oClock.getTime() + (30 * 60000) // Next round half
    this._currentHourStepUpdater = setTimeout(() => {
      this._updateModeText()
      this._currentHourStepUpdater = setInterval(this._updateModeText.bind(this), 30 * 60000)
    }, oClock - Date.now())
  }

  componentWillUnmount () {
    try {
      this._mounted = false
      clearTimeout(this._currentHourStepUpdater)
      clearInterval(this._currentHourStepUpdater)
      clearTimeout(this.planningModeTimer)
      clearInterval(this.centerClickTimer)
    } catch (e) {}
  }

  shouldComponentUpdate (nextProps, nextState) {
    const comparator = (i) => [
      // TODO !1 ?
      i.scenario && i.scenario.instanceId,
      i.scenario && i.scenario.data && i.scenario.data.forceModeEnd,
      i.scenario && i.scenario.data && i.scenario.data.overriddenProgram
    ]
    return JSON.stringify(comparator(this.state)) !== JSON.stringify(comparator(nextState))
  }

  render () {
    const { mainState, theme } = this.props.context
    const { animationLevel } = mainState()
    const { scenario } = this.state

    if (!scenario) {
      return (
        <Button waves={animationLevel >= 2 ? 'light' : null} className={cx(theme.feedbacks.warning, 'truncate fluid')} onClick={() => {}}>
          <Icon left className='red-text'>healing</Icon>
          No scenario set
        </Button>
      )
    }

    const {
      program, overriddenProgram, maxTemperature, minTemperature, highTemperature,
      lowTemperature, temperatureStateId, forceModeEnd
    } = scenario.data

    return (
      <TemperatureProgrammer
        ref={(c) => { this._programmer = c }} theme={theme} animationLevel={animationLevel}
        plannerGetter={() => ({ plannings: program, todayOverridenPlanning: overriddenProgram })}
        onPlannerChange={this.changePlanner.bind(this)}
        scaleOffset={temperatureStateId ? minTemperature : 0}
        scaleAmplitude={temperatureStateId ? (maxTemperature - minTemperature) : 0}
        onForceModeChange={this.changeForceMode.bind(this)}
        initialForceMode={!!forceModeEnd}
        title={this.computeModeText()}
        temperaturesGetter={() => ({ ecoTemperature: lowTemperature || 15, comfortTemperature: highTemperature || 19 })}

        onTemperaturesChange={(eco, comfort) => { console.log('####', eco, comfort) /* TODO !0: mémoriser le réglage fait sur le double knob ! (dans lowTemperature et highTemperature) */ }}
      />
    )
  }

  computeModeText () {
    let modeText = ''
    const now = new Date()
    const { name, program, overriddenProgram, forceModeEnd, activated } = this.state.scenario.data
    const temperatureStateValue = this.state.temperatureStateInstance && this.state.temperatureStateInstance.data.state

    if (!activated) {
      modeText = 'INACTIVE'
    } else if (forceModeEnd) {
      modeText = 'FORCED comf.'
    } else {
      const currentDay = now.getDay()
      const currentHourStep = now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0)
      const currentProgram = overriddenProgram || program[currentDay]
      const currentMode = currentProgram[currentHourStep]
      modeText = (currentMode === 0) ? 'economic' : ((currentMode === 1) ? 'comfort' : 'OFF')
    }
    return temperatureStateValue ? `${name} (${temperatureStateValue}°C)<br/>${modeText}` : `${name}<br/>${modeText}`
  }

  changePlanner (program, overriddenProgram) {
    this.state.scenario.data.program = program
    if (overriddenProgram && (!this.state.scenario.data.overriddenProgram || overriddenProgram.forEach((v, k) => v === this.state.scenario.data.overriddenProgram[k]))) {
      this.state.scenario.data.overrideEnd = Date.now() + (23 * 60 * 60000) + (30 * 60000) // +23hr30
    }
    this.state.scenario.data.overriddenProgram = overriddenProgram
    this.state.scenario.save()
    this._updateModeText()
  }

  changeForceMode (mode, hours) {
    if (!mode) {
      this.state.scenario.data.forceModeEnd = false
    } else {
      this.state.scenario.data.forceModeEnd = Date.now() + ((hours || 2) * 3600 * 1000)
    }
    this.state.scenario.save()
    this._updateModeText()
  }

  _updateModeText () {
    this._programmer && this._programmer.doubleKnob && this._programmer.doubleKnob.setTitle(this.computeModeText())
  }

  refresh (event) {
    // TODO !1: a lot of things to do, huh ?
    return Promise.resolve()
  }
}

export default TemperatureProgrammerItem
