'use strict'

import debounce from 'debounce'
import PropTypes from 'prop-types'
import React from 'react'
import { Select, TextInput, Row } from 'react-materialize'

import levelStateSchema from './schema'

class BrowserLevelStateEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      max: props.instance.data.max,
      state: props.instance.data.state,
      colors: props.instance.data.colors
    }

    this.debouncerStateChange = debounce((value) => {
      this.props.instance.data.state = value
    }, 1000, false)
  }

  render () {
    const { instance } = this.props
    const defaultName = levelStateSchema.extract('name')._flags.default
    const defaultValue = instance.data.name === defaultName ? '' : instance.data.name

    return (
      <Row className='section card form'>
        <TextInput
          placeholder='Short name' s={12}
          defaultValue={defaultValue} onChange={(e) => { instance.data.name = e.currentTarget.value; this.props.highlightCloseButton() }}
        />

        <br />&nbsp;
        <br />
        <div className='col s12'>Maximum level: {instance.data.max}</div>
        <div className='range-field col s12'>
          <input
            type='range' list='max' min='2' max='32' onChange={this.changeMaxValue.bind(this)}
            defaultValue={instance.data.max}
          />
          <datalist id='max'>
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

        <div className='col s12'>Current level: {this.state.state}</div>
        <div className='range-field col s12'>
          <input
            type='range' list='state' min='1' max={instance.data.max} onChange={(e) => { this.changeStateValue(e.currentTarget.value) }}
            defaultValue={this.state.state}
          />
          <datalist id='state'>
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

        {instance.data.colors.map((color, idx) => (
          <Select
            s={6} m={4} l={3} key={idx} label={`Color for state ${idx + 1}`}
            onChange={this.colorChange.bind(this, idx)} value={color} options={{ classes: `${color}-text select-top-marged` }}
          >
            {levelStateSchema.colors.map((color, idx2) => (
              <option key={`${idx}-${idx2}`} value={color}>{color}</option>
            ))}
          </Select>
        ))}
      </Row>
    )
  }

  changeMaxValue (event) {
    const i = this.props.instance
    const v = event.currentTarget.value
    i.data.max = v
    if (i.data.state > v) {
      this.changeStateValue(v)
    }

    if (i.data.colors.length < v) {
      i.data.colors.push(...Array(v - i.data.colors.length).fill(i.data.colors[i.data.colors.length - 1]))
    }
    if (i.data.colors.length > v) {
      i.data.colors = i.data.colors.slice(0, v)
    }

    this.setState({
      max: v,
      colors: i.data.colors
    })
    this.props.highlightCloseButton()
  }

  changeStateValue (value) {
    this.setState({
      state: value
    })

    this.debouncerStateChange(value)
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

BrowserLevelStateEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserLevelStateEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserLevelStateEditForm.label = 'Level state'

export default BrowserLevelStateEditForm
