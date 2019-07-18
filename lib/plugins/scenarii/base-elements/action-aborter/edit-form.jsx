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

  render () {
    const { instance, animationLevel, theme, services } = this.props
    return (
      <Row className='section card form'>
        <br />
        <ActionsDropdown defaultActionId={instance.data.actionId} onChange={this.actionChanged.bind(this)}
          theme={theme} animationLevel={animationLevel} services={services} noCreationPanel label='Action to abort'
          instanceFilter={(e) => e.typeId !== 'action-aborter'} typeFilter={() => false} />
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
