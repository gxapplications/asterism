'use strict'

import PropTypes from 'prop-types'
import React from 'react'
import { Input, Row } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { ScenariiDropdown } = Scenarii

class BrowserScenarioActivatorEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']
  }

  componentDidMount () {
    this.scenariiService.getScenarioInstances()
    .then((instances) => {
      if (instances.length === 1) {
        this.props.instance.data.scenarioId = instances[0].instanceId
        this.nameChange()
      }
    })
  }

  render () {
    const { instance, animationLevel, theme, services } = this.props
    return (
      <Row className='section card form'>
        <div className='col s12 m9'>
          <ScenariiDropdown defaultScenarioId={instance.data.scenarioId} onChange={this.scenarioChanged.bind(this)}
            theme={theme} animationLevel={animationLevel} services={services} noCreationPanel typeFilter={() => false} />
        </div>

        <Input s={12} m={3} label='Operation' type='select' icon='settings_power' onChange={this.operationChanged.bind(this)}
          defaultValue={instance.data.operation || 'switch'}>
          <option key='switch' value='switch'>Switch state</option>
          <option key='activate' value='activate'>Activate</option>
          <option key='deactivate' value='deactivate'>Deactivate</option>
        </Input>
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
