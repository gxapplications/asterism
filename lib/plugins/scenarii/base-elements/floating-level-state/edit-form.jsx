'use strict'

/* global $, noUiSlider, wNumb */
import debounce from 'debounce'
import Joi from 'joi'
import PropTypes from 'prop-types'
import React from 'react'
import { TextInput, Row } from 'react-materialize'

import floatingLevelStateSchema from './schema'

class BrowserFloatingLevelStateEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      precision: props.instance.data.precision,
      min: props.instance.data.min,
      max: props.instance.data.max,
      state: props.instance.data.state
    }

    this.debouncerStateChange = debounce((value) => {
      this.props.instance.data.state = value
    }, 1000, false)
  }

  componentDidMount () {
    this.plugWidgets()
  }

  componentDidUpdate () {
    this.plugWidgets()
  }

  plugWidgets () {
    const domSliderPrecision = $(`#precision-slider-${this.props.instance.instanceId}`)[0]

    if (domSliderPrecision && (!this._domSliderPrecision || !domSliderPrecision.noUiSlider)) {
      this._domSliderPrecision = noUiSlider.create(domSliderPrecision, {
        start: this.props.instance.data.precision || 4,
        connect: true,
        step: 1,
        animate: true,
        range: {
          min: [2],
          max: [8]
        },
        format: wNumb({
          decimals: 1
        }),
        pips: { // Show a scale with the slider
          mode: 'steps',
          stepped: true,
          density: 12
        },
        tooltips: wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] }), // decimals: 0 does not work...
        behaviour: 'tap-drag',
        orientation: 'horizontal'
      })

      this._domSliderPrecision.on('change', this.changePrecisionValue.bind(this))
    } else {
      this._domSliderPrecision.set(this.props.instance.data.precision || 4)
    }

    const domSliderMinMax = $(`#min-max-slider-${this.props.instance.instanceId}`)[0]

    if (domSliderMinMax && (!this._domSliderMinMax || !domSliderMinMax.noUiSlider)) {
      this._domSliderMinMax = noUiSlider.create(domSliderMinMax, {
        start: [this.props.instance.data.min || -10, this.props.instance.data.max || 63],
        connect: true,
        step: 1,
        animate: true,
        range: {
          min: [-65534, 49152],
          '6%': [-16382, 12288],
          '12%': [-4094, 3072],
          '17%': [-1022, 512],
          '22%': [-510, 512],
          '25%': [-254, 128],
          '28%': [-126, 64],
          '31%': [-62, 32],
          '34%': [-30, 1],
          '50%': [0, 1],
          '66%': [31, 32],
          '69%': [63, 64],
          '72%': [127, 128],
          '75%': [255, 256],
          '78%': [511, 512],
          '83%': [1023, 3072],
          '88%': [4095, 12288],
          '94%': [16383, 49152],
          max: [65535]
        },
        format: wNumb({ decimals: 1 }),
        pips: { // Show a scale with the slider
          mode: 'steps',
          density: 3,
          filter: (v, t) => {
            if ([-65534, -4094, -510, -126, -30, 0, 31, 127, 511, 4095, 65535].includes(v)) {
              return 1
            }
            if ([-16382, -1022, -254, -62, -20, -10, 10, 20, 63, 255, 1023, 16383].includes(v)) {
              return 2
            }
            return 0
          },
          format: wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] })
        },
        tooltips: [
          wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] }), // decimals: 0 does not work...
          wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] }) // decimals: 0 does not work...
        ],
        behaviour: 'tap-drag',
        orientation: 'horizontal'
      })

      this._domSliderMinMax.on('change', this.changeMinMaxValue.bind(this))
    } else {
      this._domSliderMinMax.set([this.props.instance.data.min || -10, this.props.instance.data.max || 63])
    }
  }

  render () {
    const { instance } = this.props
    const defaultName = Joi.reach(floatingLevelStateSchema, 'name')._flags.default
    const defaultValue = instance.data.name === defaultName ? '' : instance.data.name

    return (
      <Row className='section card form floatingLevelStatePanel'>
        <TextInput
          placeholder='Short name' s={12}
          defaultValue={defaultValue} onChange={(e) => { instance.data.name = e.currentTarget.value; this.props.highlightCloseButton() }}
        />

        <br />&nbsp;
        <br />

        <div className='col s12 m5'>Decimal precision: {instance.data.precision}</div>
        <div className='col s12 m7 slider'>
          <div id={`precision-slider-${instance.instanceId}`} />
        </div>

        <div className='col s12'>Min / Max levels: [{instance.data.min} - {instance.data.max}]</div>
        <div className='col s12 slider'>
          <div id={`min-max-slider-${instance.instanceId}`} />
        </div>

        <div className='col s12'>Current level: {this.state.state}</div>
        <TextInput
          placeholder='Value' s={12}
          defaultValue={Number.parseFloat(this.state.state).toPrecision(this.state.precision)}
          onChange={(e) => this.changeStateValue(e.currentTarget.value)}
        />
      </Row>
    )
  }

  changePrecisionValue (value) {
    this.props.instance.data.precision = parseInt(value[0])
    this.setState({
      precision: this.props.instance.data.precision
    })
    this.props.highlightCloseButton()
  }

  changeMinMaxValue (value) {
    const [min, max] = value.sort((a, b) => (a - b))
    const i = this.props.instance
    i.data.max = max
    i.data.min = min

    if (i.data.state > max) {
      this.changeStateValue(max)
    }
    if (i.data.state < min) {
      this.changeStateValue(min)
    }

    this.setState({ min, max })
    this.props.highlightCloseButton()
  }

  changeStateValue (value) {
    value = Number.parseFloat(Number.parseFloat(value).toPrecision(this.state.precision))
    if (Number.isNaN(value)) {
      return
      // TODO !0: on fait quoi d'autre ?
    }

    const i = this.props.instance
    if (i.data.min > value) {
      value = i.data.min
    }
    if (i.data.max < value) {
      value = i.data.max
    }

    this.setState({
      state: value
    })
    this.debouncerStateChange(value)
    this.props.highlightCloseButton()
  }
}

BrowserFloatingLevelStateEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserFloatingLevelStateEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserFloatingLevelStateEditForm.label = 'Floating level state'

export default BrowserFloatingLevelStateEditForm
