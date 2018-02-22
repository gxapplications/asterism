'use strict'

import Joi from 'joi'
import PropTypes from 'prop-types'
import React from 'react'
import { Input, Row } from 'react-materialize'

import devtoolsLogActionSchema from './schema'

class DevtoolsLogActionEditForm extends React.Component {
  render () {
    const { instance } = this.props
    const defaultName = Joi.reach(devtoolsLogActionSchema, 'name')._flags.default
    const defaultValue = instance.data.name === defaultName ? '' : instance.data.name

    return (
      <Row className='section card form'>
        <Input placeholder='Will log this message in a logger you can add to your dashboard' s={12} label='Name / Message'
          defaultValue={defaultValue} onChange={(e) => { instance.data.name = e.currentTarget.value }} />
      </Row>
    )
  }
}

DevtoolsLogActionEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired
}

DevtoolsLogActionEditForm.label = 'Simple log action'

export default DevtoolsLogActionEditForm
