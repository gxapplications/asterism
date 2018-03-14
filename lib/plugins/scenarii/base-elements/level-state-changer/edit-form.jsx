'use strict'

import PropTypes from 'prop-types'
import React from 'react'
import { Input, Row } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { StatesDropdown } = Scenarii

class BrowserLevelStateChangerEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']
  }

  componentDidMount () {
    this.scenariiService.getStateInstances()
    .then((instances) => {
      if (instances.length === 1) {
        this.props.instance.data.levelStateId = instances[0].instanceId
        this.nameChange()
      }
    })
  }

  render () {
    const { instance, animationLevel, theme, services } = this.props

    return (
      <Row className='section card form'>
        <div className='col s12 m9'>
          <StatesDropdown defaultStateId={instance.data.levelStateId} onChange={this.levelStateChanged.bind(this)}
            theme={theme} animationLevel={animationLevel} services={services} />
        </div>

        <Input s={12} m={3} label='Operation' type='select' icon='swap_vert' onChange={this.operationChanged.bind(this)}
          defaultValue={instance.data.operation || 'replace'}>
          <option key='replace' value='replace'>Set value</option>
          <option key='increment' value='increment'>Increment value</option>
          <option key='decrement' value='decrement'>Decrement value</option>
        </Input>

        <div className='col s12'>Operation value: {instance.data.amount}</div>
        <div className='range-field col s12'>
          <input type='range' list='amount' min='1' max='32' onChange={this.amountChanged.bind(this)}
            defaultValue={instance.data.amount} />
          <datalist id='amount'>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
            <option>16</option>
            <option>32</option>
          </datalist>
        </div>
      </Row>
    )
  }

  levelStateChanged (value) {
    this.props.instance.data.levelStateId = value
    this.nameChange()
  }

  operationChanged (event) {
    const operation = event.currentTarget.value
    this.props.instance.data.operation = operation
    this.nameChange()
  }

  amountChanged (event) {
    const amount = event.currentTarget.value
    this.props.instance.data.amount = amount
    this.nameChange()
  }

  nameChange () {
    if (!this.props.instance.data.levelStateId) {
      this.props.instance.data.name = 'Misconfigured level state update'
      return
    }

    this.scenariiService.getStateInstance(this.props.instance.data.levelStateId)
    .then((levelState) => {
      switch (this.props.instance.data.operation) {
        case 'increment':
          if (this.props.instance.data.amount === 1) {
            this.props.instance.data.name = `${levelState.data.name} ++`
          } else {
            this.props.instance.data.name = `∆ ${levelState.data.name} +${this.props.instance.data.amount}`
          }
          break
        case 'decrement':
          if (this.props.instance.data.amount === 1) {
            this.props.instance.data.name = `${levelState.data.name} --`
          } else {
            this.props.instance.data.name = `∇ ${levelState.data.name} -${this.props.instance.data.amount}`
          }
          break
        case 'replace':
        default:
          this.props.instance.data.name = `${levelState.data.name} = ${this.props.instance.data.amount}`
      }
    })
  }
}

BrowserLevelStateChangerEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired
}

BrowserLevelStateChangerEditForm.label = 'Level state changer'

export default BrowserLevelStateChangerEditForm
