/* eslint-disable no-case-declarations */
'use strict'

import PropTypes from 'prop-types'
import Joi from '@hapi/joi'
import React from 'react'
import { Row, TextInput, Select } from 'react-materialize'
import httpCallTriggerSchema from './schema'

class BrowserHttpCallTriggerEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      name: props.instance.data.name || 'Unconfigured HTTP call trigger',
      path: props.instance.data.path || '.*',
      method: props.instance.data.method || 'POST'
    }
  }

  render () {
    const { instance } = this.props
    const { name, method, path } = instance.data
    const defaultName = Joi.reach(httpCallTriggerSchema, 'name')._flags.default
    const defaultValue = name === defaultName ? '' : name

    return (
      <Row className='section card form http-call-trigger-panel'>
        <TextInput
          placeholder='Short name' s={12}
          defaultValue={defaultValue} onChange={(e) => { instance.data.name = e.currentTarget.value; this.props.highlightCloseButton() }}
        />

        <br />&nbsp;
        <br />

        <Select
          s={12} m={3} label='Method' onChange={this.changeMethod.bind(this)}
          defaultValue={method}
        >
          <option key='post' value='POST'>POST</option>
          <option key='delete' value='DELETE'>DELETE</option>
          <option key='put' value='PUT'>PUT</option>
          <option key='patch' value='PATCH'>PATCH</option>
        </Select>

        <TextInput
          placeholder='Path' s={12} m={9}
          defaultValue={path} onChange={(e) => { instance.data.path = e.currentTarget.value; this.props.highlightCloseButton() }}
        />

        <br />&nbsp;
        <br />

        TODO : securityToken (uuid.v4() generator, or use existing one)
        TODO : resulting cURL command with 'Copy' button
        TODO : success & error texts
      </Row>
    )
  }

  nameChange () {
    // TODO
  }

  changeMethod (ev) {
    const method = ev.currentTarget.value
    this.props.instance.data.method = method
    this.setState({
      method
    })
    this.nameChange()
  }
}

BrowserHttpCallTriggerEditForm.propTypes = {
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserHttpCallTriggerEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserHttpCallTriggerEditForm.label = 'HTTP call trigger'

export default BrowserHttpCallTriggerEditForm
