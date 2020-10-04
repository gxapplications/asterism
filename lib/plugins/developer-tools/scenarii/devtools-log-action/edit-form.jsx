'use strict'

import Joi from '@hapi/joi'
import PropTypes from 'prop-types'
import React from 'react'
import { TextInput, Row } from 'react-materialize'

import devtoolsLogActionSchema from './schema'

class DevtoolsLogActionEditForm extends React.Component {
  render () {
    const { instance } = this.props
    const defaultName = Joi.reach(devtoolsLogActionSchema, 'name')._flags.default
    const defaultValue = instance.data.name === defaultName ? '' : instance.data.name

    return (
      <Row className='section card form'>
        <br />
        <TextInput
          placeholder='Will log this message in a logger you can add to your dashboard' s={12} label='Log message'
          defaultValue={defaultValue} onChange={(e) => { instance.data.name = e.currentTarget.value; this.props.highlightCloseButton() }}
        />
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

DevtoolsLogActionEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

DevtoolsLogActionEditForm.label = 'Simple log action'

export default DevtoolsLogActionEditForm
