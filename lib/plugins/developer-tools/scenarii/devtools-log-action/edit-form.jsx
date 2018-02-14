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
      <div className='section card form'>
        <Row>
          <Input placeholder='Give a name to quickly identify your action' s={12} label='Name / Message'
            defaultValue={defaultValue} onChange={(e) => { instance.data.name = e.currentTarget.value }} />
        </Row>
        <Row>
          <div className='col s12 center-align'>
            This test action will log this message in a logger you can add to your dashboard through the 'Dev tools' section.
          </div>
        </Row>
      </div>
    )
  }
}

DevtoolsLogActionEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  scenariiService: PropTypes.object.isRequired
}

DevtoolsLogActionEditForm.label = 'Simple log action'

export default DevtoolsLogActionEditForm
