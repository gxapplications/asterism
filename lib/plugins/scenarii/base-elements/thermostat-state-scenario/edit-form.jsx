'use strict'

import debounce from 'debounce'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, TextInput, Row } from 'react-materialize'
import uuid from 'uuid'
import { Scenarii } from 'asterism-plugin-library'

const { StatesDropdown } = Scenarii

class BrowserThermostatStateScenarioEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: props.instance.data.name,
      stateInstance: null,
      highLevel: props.instance.data.highLevel,
      lowLevel: props.instance.data.lowLevel,
      offLevel: props.instance.data.offLevel
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

    this._nameInput = null
    this._nameInputId = uuid.v4()
  }

  componentWillMount () {
    this.scenariiService.getStateInstance(this.props.instance.data.stateId)
    .then((stateInstance) => {
      this.setState({ stateInstance })
    })
    .catch(() => {})
  }

  componentDidMount () {

  }

  render () {
    const { theme, animationLevel, instance, services } = this.props
    const { stateId } = instance.data
    const { stateInstance, highLevel, lowLevel, offLevel, name } = this.state

    return (
      <div className='clearing padded'>
        <Row className='section card form hide-in-procedure'>
          <TextInput placeholder='Short name' s={12} ref={(c) => { this._nameInput = c }}
            id={`thermostat-state-scenario-name-input-${this._nameInputId}`}
            defaultValue={name} onChange={(e) => { instance.data.name = e.currentTarget.value }} />
        </Row>
        <Row className='section card form'>
          <h5>Controlling state</h5>
          <div className='col s12'>&nbsp;</div>
          <StatesDropdown onChange={this.setStateId.bind(this)} theme={theme} animationLevel={animationLevel}
            services={services} defaultStateId={stateId} s={12} instanceFilter={(e) => e.typeId === 'level-state'}
            typeFilter={(e) => e.id === 'level-state'} label='State to control' dropdownId={uuid.v4()} />
          <div className='col s12'>&nbsp;</div>

          {stateInstance && [
            <div key={0} className='col s12'><Icon left>brightness_5</Icon> High/Comfort temperature level (actually {highLevel}):</div>,
            <div key={1} className='range-field col s12'>
              <input type='range' min='1' max={stateInstance.data.max}
                onChange={(e) => { this.changeHighLevel(e.currentTarget.value) }}
                defaultValue={highLevel} />
            </div>,
            <div key={2} className='col s12'>&nbsp;</div>,

            <div key={3} className='col s12'><Icon left>brightness_3</Icon> Low/Eco temperature level (actually {lowLevel}):</div>,
            <div key={4} className='range-field col s12'>
              <input type='range' min='1' max={stateInstance.data.max}
                onChange={(e) => { this.changeLowLevel(e.currentTarget.value) }}
                defaultValue={lowLevel} />
            </div>,
            <div key={5} className='col s12'>&nbsp;</div>,

            <div key={6} className='col s12'><Icon left>ac_unit</Icon> Off/Frost free temperature level (actually {offLevel}):</div>,
            <div key={7} className='range-field col s12'>
              <input type='range' min='1' max={stateInstance.data.max}
                onChange={(e) => { this.changeOffLevel(e.currentTarget.value) }}
                defaultValue={offLevel} />
            </div>
          ]}
        </Row>

        <Row className='section card form'>
          TODO !0
        </Row>
        <br />&nbsp;<br />&nbsp;<br />
        <div className='col s12'>&nbsp;</div>
      </div>
    )
  }

  setStateId (value) {
    this.props.instance.data.stateId = value
    this.scenariiService.getStateInstance(value)
    .then((stateInstance) => {
      this.setState({ stateInstance })
      this.nameChange()
    })
    .catch(() => {})
  }

  changeHighLevel (value) {
    this.setState({
      highLevel: value
    })
    this.debouncerHighLevelChange(value)
    this.props.highlightCloseButton()
  }

  changeLowLevel (value) {
    this.setState({
      lowLevel: value
    })
    this.debouncerLowLevelChange(value)
    this.props.highlightCloseButton()
  }

  changeOffLevel (value) {
    this.setState({
      offLevel: value
    })
    this.debouncerOffLevelChange(value)
    this.props.highlightCloseButton()
  }

  nameChange () {
    // TODO !0
    this.setState({
      name: 'todo'
    })
    this.props.highlightCloseButton()
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
