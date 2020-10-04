'use strict'

/* global $ */
import debounce from 'debounce'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, TextInput, Row } from 'react-materialize'
import uuid from 'uuid'
import { Scenarii, TemperatureProgrammer } from 'asterism-plugin-library'

const { StatesDropdown } = Scenarii

class BrowserThermostatStateScenarioEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: props.instance.data.name,
      stateInstance: null,
      highLevel: props.instance.data.highLevel,
      lowLevel: props.instance.data.lowLevel,
      offLevel: props.instance.data.offLevel,
      temperatureStateInstance: null,
      maxTemperature: props.instance.data.maxTemperature,
      minTemperature: props.instance.data.minTemperature,
      offTemperature: props.instance.data.offTemperature
    }

    this.scenariiService = props.services()['asterism-scenarii']

    this.debouncerHighLevelChange = debounce((value) => {
      this.props.instance.data.highLevel = value
    }, 1000, false)
    this.debouncerLowLevelChange = debounce((value) => {
      this.props.instance.data.lowLevel = value
    }, 1000, false)
    this.debouncerOffLevelChange = debounce((value) => {
      this.props.instance.data.offLevel = value
    }, 1000, false)
    this.debouncerMaxTemperatureChange = debounce((value) => {
      this.props.instance.data.maxTemperature = value
    }, 1000, false)
    this.debouncerMinTemperatureChange = debounce((value) => {
      this.props.instance.data.minTemperature = value
    }, 1000, false)
    this.debouncerOffTemperatureChange = debounce((value) => {
      this.props.instance.data.offTemperature = value
    }, 1000, false)

    this._nameInput = null
    this._nameInputId = uuid.v4()
    this._programmer = null
  }

  componentWillMount () {
    if (this.props.instance.data.stateId) {
      this.scenariiService.getStateInstance(this.props.instance.data.stateId)
        .then((stateInstance) => {
          this.setState({ stateInstance })
        })
        .catch(() => {})
    }

    if (this.props.instance.data.temperatureStateId) {
      this.scenariiService.getStateInstance(this.props.instance.data.temperatureStateId)
        .then((temperatureStateInstance) => {
          this.setState({ temperatureStateInstance })
        })
        .catch(() => {})
    }
  }

  componentDidMount () {
    if (this.props.instance.data.stateId) {
      this.betterName()
    }
  }

  render () {
    const { theme, animationLevel, instance, services } = this.props
    const { stateId, program, overriddenProgram, temperatureStateId, lowTemperature, highTemperature, forceModeEnd } = instance.data
    const { stateInstance, highLevel, lowLevel, offLevel, name, temperatureStateInstance, maxTemperature, minTemperature, offTemperature } = this.state

    return (
      <div className='clearing padded'>
        <Row className='section card form hide-in-procedure'>
          <TextInput
            placeholder='Short name' s={12} ref={(c) => { this._nameInput = c }}
            id={`thermostat-state-scenario-name-input-${this._nameInputId}`}
            defaultValue={name} onChange={(e) => { instance.data.name = e.currentTarget.value }}
          />
        </Row>
        <Row className='section card form'>
          <h5>Controlling state</h5>
          <div className='col s12'>&nbsp;</div>
          <StatesDropdown
            onChange={this.setStateId.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} defaultStateId={stateId} s={12} instanceFilter={(e) => e.typeId === 'level-state'}
            typeFilter={(e) => e.id === 'level-state'} label='State to control' dropdownId={uuid.v4()}
          />
          <div className='col s12'>&nbsp;</div>

          {stateInstance && [
            <div key={0} className='col s12'><Icon left>brightness_5</Icon> High/Comfort temperature level (actually {highLevel}):</div>,
            <div key={1} className='range-field col s12'>
              <input
                type='range' min='1' max={stateInstance.data.max}
                onChange={(e) => { this.changeHighLevel(e.currentTarget.value) }}
                defaultValue={highLevel}
              />
            </div>,
            <div key={2} className='col s12'>&nbsp;</div>,

            <div key={3} className='col s12'><Icon left>brightness_3</Icon> Low/Eco temperature level (actually {lowLevel}):</div>,
            <div key={4} className='range-field col s12'>
              <input
                type='range' min='1' max={stateInstance.data.max}
                onChange={(e) => { this.changeLowLevel(e.currentTarget.value) }}
                defaultValue={lowLevel}
              />
            </div>,
            <div key={5} className='col s12'>&nbsp;</div>,

            <div key={6} className='col s12'><Icon left>ac_unit</Icon> Off/Frost free temperature level (actually {offLevel}):</div>,
            <div key={7} className='range-field col s12'>
              <input
                type='range' min='1' max={stateInstance.data.max}
                onChange={(e) => { this.changeOffLevel(e.currentTarget.value) }}
                defaultValue={offLevel}
              />
            </div>
          ]}
        </Row>

        <Row className='section card form'>
          <h5>Enslave programmer by a temperature measure (optional)</h5>
          <div className='col s12'>&nbsp;</div>
          <StatesDropdown
            onChange={this.setTemperatureStateId.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} defaultStateId={temperatureStateId} s={12} instanceFilter={(e) => e.typeId === 'floating-level-state'}
            typeFilter={(e) => e.id === 'floating-level-state'} label='State that contains the master temperature' dropdownId={uuid.v4()}
          />
          <div className='col s12'>&nbsp;</div>

          {temperatureStateInstance && [
            <div key={0} className='col s12'><Icon left>vertical_align_top</Icon> Maximal temperature allowed to be set (actually {maxTemperature}):</div>,
            <div key={1} className='range-field col s12'>
              <input
                type='range' min='10' max='38'
                onChange={(e) => { this.changeMaxTemperature(e.currentTarget.value) }}
                defaultValue={maxTemperature}
              />
            </div>,
            <div key={2} className='col s12'>&nbsp;</div>,

            <div key={3} className='col s12'><Icon left>vertical_align_bottom</Icon> Minimal temperature allowed to be set (actually {minTemperature}):</div>,
            <div key={4} className='range-field col s12'>
              <input
                type='range' min='8' max='36'
                onChange={(e) => { this.changeMinTemperature(e.currentTarget.value) }}
                defaultValue={minTemperature}
              />
            </div>,
            <div key={5} className='col s12'>&nbsp;</div>,

            <div key={6} className='col s12'><Icon left>ac_unit</Icon> Temperature for Off/Frost free mode (actually {offTemperature}):</div>,
            <div key={7} className='range-field col s12'>
              <input
                type='range' min='4' max='32'
                onChange={(e) => { this.changeOffTemperature(e.currentTarget.value) }}
                defaultValue={offTemperature}
              />
            </div>
          ]}
        </Row>

        <Row className='section'>
          <TemperatureProgrammer
            ref={(c) => { this._programmer = c }} theme={theme} animationLevel={animationLevel}
            plannerGetter={() => ({ plannings: program, todayOverridenPlanning: overriddenProgram })}
            onPlannerChange={this.changePlanner.bind(this)}
            scaleOffset={temperatureStateId ? minTemperature : 0}
            scaleAmplitude={temperatureStateId ? (maxTemperature - minTemperature) : 0}
            initialForceMode={!!forceModeEnd}
            title={this.computeModeText()}
            temperaturesGetter={() => ({ ecoTemperature: lowTemperature || 15, comfortTemperature: highTemperature || 19 })}

            onTemperaturesChange={(eco, comfort) => { console.log('####', eco, comfort) /* TODO !0: mémoriser le réglage fait sur le double knob ! (dans lowTemperature et highTemperature) */ }}
          />
        </Row>
        <br />&nbsp;<br />&nbsp;<br />
        <div className='col s12'>&nbsp;</div>
      </div>
    )
  }

  betterName () {
    this.props.highlightCloseButton()
    if (!this.props.instance.data.stateId) {
      return
    }

    if (this.props.instance.data.name &&
        this.props.instance.data.name.length &&
        this.props.instance.data.name !== 'Unconfigured thermostat state scenario' &&
        this.props.instance.data.name !== 'Misconfigured thermostat state scenario'
    ) {
      if (this._nameInput) {
        this._nameInput.setState({ value: this.props.instance.data.name })
      }
      return this.setState({ name: this.props.instance.data.name })
    }

    this.scenariiService.getStateInstance(this.props.instance.data.stateId, true)
      .then((state) => {
        this.props.instance.data.name = `Thermostat for '${state.name}'`
        this.setState({ name: this.props.instance.data.name })
        if (this._nameInput) {
          this._nameInput.setState({ value: this.props.instance.data.name })
          $(`#thermostat-state-scenario-name-input-${this._nameInputId}`).val(this.props.instance.data.name)
        }
      })
  }

  setStateId (value) {
    this.props.instance.data.stateId = value
    this.scenariiService.getStateInstance(value)
      .then((stateInstance) => {
        this.setState({ stateInstance })
        this.betterName()
      })
      .catch(() => {})
  }

  changeHighLevel (value) {
    this.setState({
      highLevel: +value
    })
    this.debouncerHighLevelChange(+value)
    this.props.highlightCloseButton()
  }

  changeLowLevel (value) {
    this.setState({
      lowLevel: +value
    })
    this.debouncerLowLevelChange(+value)
    this.props.highlightCloseButton()
  }

  changeOffLevel (value) {
    this.setState({
      offLevel: +value
    })
    this.debouncerOffLevelChange(+value)
    this.props.highlightCloseButton()
  }

  setTemperatureStateId (value) {
    this.props.instance.data.temperatureStateId = value
    this.scenariiService.getStateInstance(value)
      .then((temperatureStateInstance) => {
        this.setState({ temperatureStateInstance })
        this.props.highlightCloseButton()
      })
      .catch(() => {})
  }

  changeMaxTemperature (value) {
    this.setState({
      maxTemperature: +value
    })
    this.debouncerMaxTemperatureChange(+value)
    this.props.highlightCloseButton()
  }

  changeMinTemperature (value) {
    this.setState({
      minTemperature: +value
    })
    this.debouncerMinTemperatureChange(+value)
    this.props.highlightCloseButton()
  }

  changeOffTemperature (value) {
    this.setState({
      offTemperature: +value
    })
    this.debouncerOffTemperatureChange(+value)
    this.props.highlightCloseButton()
  }

  changePlanner (program, overriddenProgram) {
    this.props.instance.data.program = program
    if (overriddenProgram && (!this.props.instance.data.overriddenProgram || overriddenProgram.forEach((v, k) => v === this.props.instance.data.overriddenProgram[k]))) {
      this.props.instance.data.overrideEnd = Date.now() + (23 * 60 * 60000) + (30 * 60000) // +23hr30
    }
    this.props.instance.data.overriddenProgram = overriddenProgram
    this.props.highlightCloseButton()
  }

  computeModeText () {
    let modeText = ''
    const now = new Date()
    const { name, program, overriddenProgram, forceModeEnd, activated } = this.props.instance.data
    const temperatureStateValue = this.state.temperatureStateInstance && this.state.temperatureStateInstance.data.state

    if (!activated) {
      modeText = 'INACTIVE'
    } else if (new Date(forceModeEnd).getTime() > Date.now()) {
      modeText = 'FORCED comf.'
    } else {
      const currentDay = now.getDay()
      const currentHourStep = now.getHours() * 2 + (now.getMinutes() > 30 ? 1 : 0)
      const currentProgram = overriddenProgram || program[currentDay]
      const currentMode = currentProgram[currentHourStep]
      modeText = (currentMode === 0) ? 'economic' : ((currentMode === 1) ? 'comfort' : 'OFF')
    }
    return temperatureStateValue ? `${name} (${temperatureStateValue}°C)<br/>${modeText}` : `${name}<br/>${modeText}`
  }
}

BrowserThermostatStateScenarioEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserThermostatStateScenarioEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserThermostatStateScenarioEditForm.label = 'Thermostat state scenario'

export default BrowserThermostatStateScenarioEditForm
