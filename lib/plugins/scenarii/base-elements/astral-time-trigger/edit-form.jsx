'use strict'

/* global $, noUiSlider, wNumb */
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { Select, Row } from 'react-materialize'
import SunCalc from 'suncalc'
import uuid from 'uuid'

const minuter = (minutes) => {
  return `${Math.floor(minutes / 60)}:${(minutes % 60) || '00'}`
}

class BrowserAstralTimeTriggerEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      event: props.instance.data.event || 'sunrise',
      timeshift: props.instance.data.timeshift || 0,
      limitedWindowLow: props.instance.data.limitedWindowLow || 0,
      limitedWindowHigh: props.instance.data.limitedWindowHigh || 1440
    }

    this._formId = `astral-time-trigger-panel-${uuid.v4()}`
  }

  componentDidMount () {
    this.plugWidgets()
  }

  componentDidUpdate () {
    this.plugWidgets()
  }

  plugWidgets () {
    const domSlider = $(`#timeshift-slider-${this.props.instance.instanceId}`)[0]
    if (!domSlider) {
      return
    }

    if (!this._slider || !domSlider.noUiSlider) {
      this._slider = noUiSlider.create(domSlider, {
        start: this.props.instance.data.timeshift || 0,
        connect: true,
        step: 1,
        animate: true,
        range: {
          min: [-180, 30],
          '15%': [-60, 15],
          '21%': [-30, 5],
          '31%': [-10, 1],
          '50%': [0, 1],
          '69%': [10, 5],
          '79%': [30, 15],
          '85%': [60, 30],
          max: [180]
        },
        format: wNumb({
          decimals: 1
        }),
        pips: { // Show a scale with the slider
          mode: 'steps',
          stepped: true,
          density: 4
        },
        tooltips: wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] }), // decimals: 0 does not work...
        behaviour: 'tap-drag',
        orientation: 'horizontal'
      })

      this._slider.on('change', this.changeTimeshift.bind(this))
    } else {
      this._slider.set(this.props.instance.data.timeshift)
    }

    const domSlider2 = $(`#limited-window-slider-${this.props.instance.instanceId}`)[0]
    if (!domSlider2) {
      return
    }

    if (!this._slider2 || !domSlider2.noUiSlider) {
      this._slider2 = noUiSlider.create(domSlider2, {
        start: [this.props.instance.data.limitedWindowLow || 0, this.props.instance.data.limitedWindowHigh || 1440],
        connect: true,
        step: 1,
        animate: true,
        range: {
          min: [0, 10],
          max: [1440]
        },
        format: wNumb({ decimals: 1, edit: minuter }),
        pips: { // Show a scale with the slider
          mode: 'positions',
          values: [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100],
          density: 4,
          stepped: true,
          format: wNumb({ decimals: 1, edit: minuter })
        },
        tooltips: [
          wNumb({ decimals: 1, edit: minuter }),
          wNumb({ decimals: 1, edit: minuter })
        ],
        behaviour: 'tap-drag',
        orientation: 'horizontal'
      })

      this._slider2.on('change', this.changeLimitedWindow.bind(this))
    } else {
      this._slider2.set([this.props.instance.data.limitedWindowLow, this.props.instance.data.limitedWindowHigh])
    }
  }

  render () {
    const { instance } = this.props
    const { event, timeshift, limitedWindowLow, limitedWindowHigh } = this.state

    const exampleTime = moment(SunCalc.getTimes(new Date(), 48.8566, 2.3522)[event])
    exampleTime.add(timeshift, 'minutes')
    const lowLimit = exampleTime.clone().hour(0).second(0).minute(limitedWindowLow)
    const highLimit = exampleTime.clone().hour(0).second(0).minute(limitedWindowHigh)

    return (
      <Row className='section card form astral-time-trigger-panel' id={this._formId}>
        <br />
        <Select
          s={12} label='Event to monitor' icon='brightness_4' onChange={this.changeEvent.bind(this)}
          defaultValue={event}
        >
          <option key='sunrise' value='sunrise'>At sunrise</option>
          <option key='sunset' value='sunset'>At sunset</option>
          <option key='solarNoon' value='solarNoon'>At solar noon</option>
          <option key='night' value='night'>At night (stars are visible)</option>
        </Select>

        <div className='col s12'>&nbsp;</div>
        <div className='col s12'>
          Offset of the schedule (in minutes):
        </div>
        <div className='col s12 slider'>
          <div id={`timeshift-slider-${instance.instanceId}`} />
        </div>
        <div className='col s12'>&nbsp;</div>
        <div className='col s12'>
          Limited time window (if schedule time is out of the limits, uses the limit):
        </div>
        <div className='col s12 slider'>
          <div id={`limited-window-slider-${instance.instanceId}`} />
        </div>
        <div className='col s12'>&nbsp;</div>
        <div className='col s12'>
          Example of schedule time for Paris (FR) with timeshift of {timeshift} minutes, limited by [{minuter(limitedWindowLow)} - {minuter(limitedWindowHigh)}]:<br />
          {exampleTime.calendar()}
          {exampleTime.isBefore(lowLimit) ? `⇒ limited to ${lowLimit.calendar()}` : ''}{exampleTime.isAfter(highLimit) ? `⇒ limited to ${highLimit.calendar()}` : ''}
        </div>
      </Row>
    )
  }

  changeEvent (ev) {
    const event = ev.currentTarget.value
    this.props.instance.data.event = event
    this.setState({
      event
    })

    this.nameChange()
  }

  changeTimeshift (value) {
    const timeshift = parseInt(value[0])
    this.props.instance.data.timeshift = timeshift
    this.setState({
      timeshift
    })
    this.nameChange()
  }

  changeLimitedWindow (values) {
    const limits = values.map((value) => (parseInt(value.split(':')[0]) * 60) + parseInt(value.split(':')[1]))
    this.props.instance.data.limitedWindowLow = limits[0]
    this.props.instance.data.limitedWindowHigh = limits[1]

    this.setState({
      limitedWindowLow: this.props.instance.data.limitedWindowLow,
      limitedWindowHigh: this.props.instance.data.limitedWindowHigh
    })
    this.nameChange()
  }

  nameChange () {
    const data = this.props.instance.data
    let timeShiftText = ''
    if (data.timeshift > 0) {
      timeShiftText = ` (+${data.timeshift}mins)`
    }
    if (data.timeshift < 0) {
      timeShiftText = ` (${data.timeshift}mins)`
    }

    switch (data.event) {
      case 'sunrise':
        this.props.instance.data.name = 'sunrise' + timeShiftText
        break
      case 'sunset':
        this.props.instance.data.name = 'sunset' + timeShiftText
        break
      case 'solarNoon':
        this.props.instance.data.name = 'solar noon' + timeShiftText
        break
      case 'night':
        this.props.instance.data.name = 'night' + timeShiftText
        break
    }

    this.props.highlightCloseButton()
  }
}

BrowserAstralTimeTriggerEditForm.propTypes = {
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserAstralTimeTriggerEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserAstralTimeTriggerEditForm.label = 'Astral time trigger'

export default BrowserAstralTimeTriggerEditForm
