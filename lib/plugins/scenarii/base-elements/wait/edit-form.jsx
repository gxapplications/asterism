'use strict'

import PropTypes from 'prop-types'
import React from 'react'
import { Input, Row } from 'react-materialize'

class BrowserWaitEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']
  }

  render () {
    return (
      <Row className='section card form'>
        TODO !1
        <Input name='on1' type='date' />
        <Input name='on2' type='time' />
      </Row>
    )
  }
}

BrowserWaitEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired
}

BrowserWaitEditForm.label = 'Wait timer'

export default BrowserWaitEditForm
