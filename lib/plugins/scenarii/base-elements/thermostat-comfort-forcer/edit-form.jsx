'use strict'

import PropTypes from 'prop-types'
import React from 'react'
import { Row } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { ScenariiDropdown } = Scenarii

class ThermostatComfortForcerEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']
  }

  render () {
    const { instance, animationLevel, theme, services } = this.props

    return (
      <Row className='section card form thermostatComfortForcerPanel'>
        <h6 className='show-in-procedure'>{instance.shortLabel}</h6>
        <br />
        <ScenariiDropdown
          defaultScenarioId={instance.data.thermostatStateScenarioId} onChange={this.scenarioChanged.bind(this)}
          theme={theme} animationLevel={animationLevel} services={services} s={12}
          label='Thermostat state scenario to force' typeFilter={(e) => e.id === 'thermostat-state-scenario'}
          instanceFilter={(e) => e.typeId === 'thermostat-state-scenario'}
        />
      </Row>
    )
  }

  scenarioChanged (value) {
    this.props.instance.data.thermostatStateScenarioId = value
    this.nameChange()
  }

  nameChange () {
    if (!this.props.instance.data.thermostatStateScenarioId) {
      this.props.instance.data.name = 'Misconfigured thermostat comfort forcer'
      return
    }

    this.scenariiService.getScenarioInstance(this.props.instance.data.thermostatStateScenarioId)
      .then((thermostatStateScenario) => {
        this.props.instance.data.name = `${thermostatStateScenario.data.name}`
      })
    this.props.highlightCloseButton()
  }
}

ThermostatComfortForcerEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

ThermostatComfortForcerEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

ThermostatComfortForcerEditForm.label = 'Thermostat comfort forcer'

export default ThermostatComfortForcerEditForm
