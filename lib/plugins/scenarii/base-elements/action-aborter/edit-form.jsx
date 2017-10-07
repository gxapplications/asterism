'use strict'

import PropTypes from 'prop-types'
import React from 'react'
import { Row } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { ActionsDropdown } = Scenarii

class BrowserActionAborterEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']
  }

  componentDidMount () {
    this.scenariiService.getActionInstances()
    .then((instances) => {
      if (instances.length === 1) {
        this.props.instance.data.actionId = instances[0].instanceId
        this.nameChange()
      }
    })
  }

  render () {
    const { instance, animationLevel, theme, services } = this.props
    return (
      <Row className='section card form'>
        <div className='col s12 m9'>
          <ActionsDropdown defaultActionId={instance.data.actionId} onChange={this.actionChanged.bind(this)}
            theme={theme} animationLevel={animationLevel} services={services} noCreationPanel typeFilter={() => false} />
        </div>
      </Row>
    )
  }

  actionChanged (value) {
    this.props.instance.data.actionId = value
    this.nameChange()
  }

  nameChange () {
    if (!this.props.instance.data.actionId) {
      this.props.instance.data.name = 'unknown action'
      return
    }

    this.scenariiService.getActionInstance(this.props.instance.data.actionId)
    .then((action) => {
      this.props.instance.data.name = action.data.name
    })
    this.props.highlightCloseButton()
  }
}

BrowserActionAborterEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserActionAborterEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserActionAborterEditForm.label = 'Action aborter'

export default BrowserActionAborterEditForm
