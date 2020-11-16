/* eslint-disable no-case-declarations */
'use strict'

import PropTypes from 'prop-types'
import Joi from '@hapi/joi'
import React from 'react'
import RandExp from 'randexp'
import { Row, TextInput, Select } from 'react-materialize'
import httpCallTriggerSchema from './schema'

class BrowserHttpCallTriggerEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      name: props.instance.data.name || 'Unconfigured insecure HTTP call trigger',
      path: props.instance.data.path || this._randomPath('[a-zA-Z]{4,9}'),
      method: props.instance.data.method || 'POST'
    }
  }

  _randomPath (path) {
    const pathExample = new RandExp(path)
    pathExample.defaultRange.subtract(32, 47)
    pathExample.defaultRange.subtract(58, 64)
    pathExample.defaultRange.subtract(91, 96)
    pathExample.defaultRange.subtract(123, 126)
    pathExample.max = 10

    return pathExample.gen()
  }

  render () {
    const { instance } = this.props
    const { name, method, path, success, error } = this.state
    const defaultName = Joi.reach(httpCallTriggerSchema, 'name')._flags.default
    const defaultValue = name === defaultName ? '' : name
    const pathExample = this._randomPath(path)

    let finalUrl = (new URL('/asterism-scenarii/trigger/', document.location)).toString()
    finalUrl = (new URL(pathExample.replace(/^\//, ''), finalUrl))
    const curlCall = `curl --request ${method} --url '${finalUrl.toString()}'`

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
          label='Path'
          placeholder='A valid URL path, or a regular expression' s={12} m={9}
          defaultValue={path} onChange={this.changePath.bind(this)}
        />

        <br />&nbsp;
        <br />

        <div s={12}>
          CURL call:<br />
          <a href='javascript:void(0);' onClick={this.copyToClipboard.bind(this, curlCall)}>
            {curlCall} &nbsp; (copy me)
          </a>
          <br /><br />
          {path !== pathExample && (<span><br />This is an example matching the path regular expression.</span>)}
        </div>

        <br />&nbsp;
        <br />

        <TextInput
          label='Success message'
          placeholder='Success message to return as HTTP response' s={12} m={9}
          defaultValue={success} onChange={(e) => { instance.data.success = e.currentTarget.value; this.props.highlightCloseButton() }}
        />
        <TextInput
          label='Error message'
          placeholder='Error message to return as HTTP response' s={12} m={9}
          defaultValue={error} onChange={(e) => { instance.data.error = e.currentTarget.value; this.props.highlightCloseButton() }}
        />
      </Row>
    )
  }

  copyToClipboard (text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Copied!')
      })
  }

  changePath (ev) {
    const path = ev.currentTarget.value
    this.props.instance.data.path = path
    this.setState({
      path
    })
    this.props.highlightCloseButton()
  }

  changeMethod (ev) {
    const method = ev.currentTarget.value
    this.props.instance.data.method = method
    this.setState({
      method
    })
    this.props.highlightCloseButton()
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

BrowserHttpCallTriggerEditForm.label = 'Insecure HTTP call trigger'

export default BrowserHttpCallTriggerEditForm
