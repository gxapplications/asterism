'use strict'

import PropTypes from 'prop-types'
import React from 'react'
import { Select, Row } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { ScenariiDropdown } = Scenarii

class BrowserScenarioActivatorEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']
  }

  render () {
    const { instance, animationLevel, theme, services } = this.props
    return (
      <Row className='section card form'>
        <br />
        <ScenariiDropdown defaultScenarioId={instance.data.scenarioId} onChange={this.scenarioChanged.bind(this)}
          theme={theme} animationLevel={animationLevel} services={services} noCreationPanel typeFilter={() => false}
          s={12} label='Scenario to activate' />

        <br />&nbsp;
        <br />
        <Select s={12} label='Operation' icon='settings_power' onChange={this.operationChanged.bind(this)}
          defaultValue={instance.data.operation || 'switch'}>
          <option key='switch' value='switch'>Switch state</option>
          <option key='activate' value='activate'>Activate</option>
          <option key='deactivate' value='deactivate'>Deactivate</option>
        </Select>
      </Row>
    )
  }

  scenarioChanged (value) {
    this.props.instance.data.scenarioId = value
    this.nameChange()
  }

  operationChanged (event) {
    const operation = event.currentTarget.value
    this.props.instance.data.operation = operation
    this.nameChange()
  }

  nameChange () {
    if (!this.props.instance.data.scenarioId) {
      this.props.instance.data.name = 'Misconfigured scenario activator'
      return
    }

    this.scenariiService.getScenarioInstance(this.props.instance.data.scenarioId)
    .then((scenario) => {
      this.props.instance.data.name = scenario.data.name
    })
    this.props.highlightCloseButton()
  }
}

BrowserScenarioActivatorEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserScenarioActivatorEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserScenarioActivatorEditForm.label = 'Scenario activator'

export default BrowserScenarioActivatorEditForm
