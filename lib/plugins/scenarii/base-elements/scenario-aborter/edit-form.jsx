'use strict'

import PropTypes from 'prop-types'
import React from 'react'
import { Row } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { ScenariiDropdown } = Scenarii

class BrowserScenarioAborterEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']
  }

  render () {
    const { instance, animationLevel, theme, services } = this.props
    return (
      <Row className='section card form'>
        <br />
        <ScenariiDropdown
          defaultScenarioId={instance.data.scenarioId} onChange={this.scenarioChanged.bind(this)}
          theme={theme} animationLevel={animationLevel} services={services} noCreationPanel typeFilter={() => false}
          s={12} label='Scenario to abort'
        />
      </Row>
    )
  }

  scenarioChanged (value) {
    this.props.instance.data.scenarioId = value
    this.nameChange()
  }

  nameChange () {
    if (!this.props.instance.data.scenarioId) {
      this.props.instance.data.name = 'unknown scenario'
      return
    }

    this.scenariiService.getScenarioInstance(this.props.instance.data.scenarioId)
      .then((scenario) => {
        this.props.instance.data.name = scenario.data.name
      })
    this.props.highlightCloseButton()
  }
}

BrowserScenarioAborterEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserScenarioAborterEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserScenarioAborterEditForm.label = 'Scenario aborter'

export default BrowserScenarioAborterEditForm
