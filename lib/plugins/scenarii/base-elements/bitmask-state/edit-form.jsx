'use strict'

import debounce from 'debounce'
import Joi from 'joi'
import PropTypes from 'prop-types'
import React from 'react'
import { TextInput, Row, Select } from 'react-materialize'

import bitmaskStateSchema from './schema'

class BrowserBitmaskStateEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      count: props.instance.data.count,
      state: props.instance.data.state,
      colors: props.instance.data.colors
    }

    this.debouncerStateChange = debounce((value) => {
      this.props.instance.data.state = value
    }, 1000, false)
  }

  render () {
    const { instance } = this.props
    const { state, count } = this.state
    const defaultName = Joi.reach(bitmaskStateSchema, 'name')._flags.default
    const defaultValue = instance.data.name === defaultName ? '' : instance.data.name

    return (
      <Row className='section card form'>
        <TextInput
          placeholder='Short name' s={12}
          defaultValue={defaultValue} onChange={(e) => { instance.data.name = e.currentTarget.value; this.props.highlightCloseButton() }}
        />

        <br />&nbsp;
        <br />
        <div className='col s12'>Positions count: {instance.data.count}</div>
        <div className='range-field col s12'>
          <input
            type='range' list='count' min='1' max='8' onChange={this.changeCountValue.bind(this)}
            defaultValue={instance.data.count}
          />
          <datalist id='count'>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
          </datalist>
        </div>

        <div className='col s12'>Current state: (binary masked value {state.toString(2).padStart(count, '0')}/{state})</div>
        <div className='col s12 row'>
          {instance.data.colors.map((color, idx) => (
            <div className='col s6 m4 l3 switch' key={idx}>
              <br />
              <label>
                <input type='checkbox' checked={(state & (2 ** idx)) > 0} onChange={this.changeStateValue.bind(this, idx, (state & (2 ** idx)) === 0, state)} />
                <span className='lever' />
                {`#${idx + 1} (value ${2 ** idx}) is ${(state & (2 ** idx)) > 0 ? 'ON' : 'OFF'}`}
              </label>
              <br /><br />
            </div>
          ))}
        </div>

        {instance.data.colors.map((color, idx) => (
          <Select
            s={6} m={4} l={3} key={idx} label={`Color for state ${idx + 1}`}
            onChange={this.colorChange.bind(this, idx)} value={color} className={`${color}-text`}
          >
            {bitmaskStateSchema.colors.map((color, idx2) => (
              <option key={`${idx}-${idx2}`} value={color}>{color}</option>
            ))}
          </Select>
        ))}
      </Row>
    )
  }

  changeCountValue (event) {
    const i = this.props.instance
    const v = event.currentTarget.value
    i.data.count = v
    if (i.data.state > 2 ** v) {
      i.data.state = 2 ** v
    }

    if (i.data.colors.length < v) {
      i.data.colors.push(...Array(v - i.data.colors.length).fill(i.data.colors[i.data.colors.length - 1]))
    }
    if (i.data.colors.length > v) {
      i.data.colors = i.data.colors.slice(0, v)
    }

    this.setState({
      count: v,
      colors: i.data.colors
    })
    this.props.highlightCloseButton()
  }

  changeStateValue (index, way, value) {
    const shift = 2 ** index
    const newState = way ? (value | shift) : (value & ~shift)

    this.setState({
      state: newState
    })

    this.debouncerStateChange(newState)
    this.props.highlightCloseButton()
  }

  colorChange (index, event) {
    this.props.instance.data.colors[index] = event.currentTarget.value
    this.setState({
      colors: this.props.instance.data.colors
    })
    this.props.highlightCloseButton()
  }
}

BrowserBitmaskStateEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserBitmaskStateEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserBitmaskStateEditForm.label = 'Bitmask state'

export default BrowserBitmaskStateEditForm
