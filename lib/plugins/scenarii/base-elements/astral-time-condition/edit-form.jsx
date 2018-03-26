'use strict'

/* global $, noUiSlider, wNumb */
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import SunCalc from 'suncalc'
import { Row, Input } from 'react-materialize'

class BrowserAstralTimeConditionEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      event: props.instance.data.event,
      timeshift: props.instance.data.timeshift
    }
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
          'min': [5, 5],
          '21%': [30, 10],
          '36%': [60, 15],
          'max': [240]
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
  }

  render () {
    const { instance } = this.props
    const { event, timeshift } = this.state

    const sunTimes = SunCalc.getTimes(new Date(), 48.8566, 2.3522)
    const exampleStart = (event === 'daylight') ? moment(sunTimes['goldenHourEnd']) : (
      (event === 'fewlight') ? moment(sunTimes['sunriseEnd']) : moment(sunTimes[event]).subtract(timeshift, 'minutes')
    )
    const exampleEnd = (event === 'daylight') ? moment(sunTimes['goldenHour']) : (
      (event === 'fewlight') ? moment(sunTimes['sunsetStart']) : moment(sunTimes[event]).add(timeshift, 'minutes')
    )

    return (
      <Row className='section card form astral-time-condition-panel'>
        <Input s={12} label='Sunlight condition' type='select' icon='brightness_4' onChange={this.changeEvent.bind(this)}
          defaultValue={event}>
          <option key='daylight' value='daylight'>Full daylight period</option>
          <option key='fewlight' value='fewlight'>Few or full daylight period (larger)</option>
          <option key='sunrise' value='sunrise'>Around sunrise event</option>
          <option key='sunset' value='sunset'>Around sunset event</option>
          <option key='solarNoon' value='solarNoon'>Around solar noon</option>
          <option key='nadir' value='nadir'>Around darkest night moment</option>
        </Input>

        {event !== 'daylight' && event !== 'fewlight' && [
          <div className='col s12'>&nbsp;</div>,
          <div className='col s12'>
            Acceptable time before &amp; after event (in minutes):
          </div>,
          <div className='col s12 slider'>
            <div id={`timeshift-slider-${instance.instanceId}`} />
          </div>
        ]}

        <div className='col s12'>&nbsp;</div>
        <div className='col s12'>
          Example of next acceptable period for Paris (FR) with timeshift of {timeshift} minutes:<br />
          {exampleStart.calendar()} ⇒ {exampleEnd.calendar()}
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

  nameChange () {
    const data = this.props.instance.data
    const timeShiftText = ` (+/- ${data.timeshift}mins)`

    switch (data.event) {
      case 'daylight':
        this.props.instance.data.name = 'full daylight'
        break
      case 'fewlight':
        this.props.instance.data.name = 'few or full daylight'
        break
      case 'sunrise':
        this.props.instance.data.name = 'around sunrise' + timeShiftText
        break
      case 'sunset':
        this.props.instance.data.name = 'around sunset' + timeShiftText
        break
      case 'solarNoon':
        this.props.instance.data.name = 'around solar noon' + timeShiftText
        break
      case 'nadir':
        this.props.instance.data.name = 'around darkest night moment' + timeShiftText
        break
    }

    this.props.highlightCloseButton()
  }
}

BrowserAstralTimeConditionEditForm.propTypes = {
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserAstralTimeConditionEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserAstralTimeConditionEditForm.label = 'Astral time condition'

export default BrowserAstralTimeConditionEditForm
