'use strict'

/* global $, noUiSlider, wNumb, M */
import debounce from 'debounce'
import PropTypes from 'prop-types'
import React from 'react'
import { Autocomplete, Icon, Select, Row, TextInput } from 'react-materialize'

const _weekdays = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.']

const minuter = (minutes) => {
  return `${Math.floor(minutes / 60)}:${(minutes % 60) || '00'}`
}

class DomoticsSettings extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      locationSearch: [],
      currentLocation: {},
      energyCosts: {
        prices: [0, 0, 0, 0, 0, 0],
        planningBase: [0, 0, 0, 0, 0, 0, 0],
        planningOthers: [[], [], [], [], [], [], []]
      }
    }

    this._slider = [null, null, null, null, null, null, null]
    this._sliderAreas = [0, 0, 0, 0, 0, 0, 0]

    this._socket = props.privateSocket
    this._mounted = false

    this.energyCostsDebouncer = debounce(() => {
      this.props.serverStorage.setItem('settings-domotics-energy-costs', this.state.energyCosts)
    }, 1000, false)
  }

  componentDidMount () {
    this._mounted = true
    this.props.serverStorage.getItem('settings-domotics-location')
    .then((location) => {
      if (this._mounted) {
        if (location.name.length) {
          $('#domotics_settings .location-field label').addClass('active')
          $('#domotics_settings .autocomplete').val(location.name)
        }
        this.setState({
          currentLocation: location || {}
        })
      }
    })
    .catch(error => {
      console.log(error)
      this.setState({
        currentLocation: {}
      })
    })
    this.props.serverStorage.getItem('settings-domotics-energy-costs')
    .then((energyCosts) => {
      if (this._mounted) {
        this.setState({
          energyCosts: energyCosts || {
            prices: [0, 0, 0, 0, 0, 0],
            planningBase: [0, 0, 0, 0, 0, 0, 0],
            planningOthers: [[], [], [], [], [], [], []]
          }
        })
        this.plugWidgets()
      }
    })
    .catch(error => {
      console.log(error)
      this.setState({
        energyCosts: {
          prices: [0, 0, 0, 0, 0, 0],
          planningBase: [0, 0, 0, 0, 0, 0, 0],
          planningOthers: [[], [], [], [], [], [], []]
        }
      })
    })
  }

  componentDidUpdate (prevProps, prevState) {
    this.plugWidgets()
  }

  componentWillUnmount () {
    this._mounted = false
  }

  plugWidgets () {
    [0, 1, 2, 3, 4, 5, 6].forEach((idx) => {
      const domSlider = $(`#weekdays_a_slider_${idx}`)[0]
      if (!domSlider) {
        return
      }

      const planning = this.state.energyCosts.planningOthers[idx] || []
      const knobs = [0, ...planning.map((area) => area.hour), 1440]

      if (!this._slider[idx] || !domSlider.noUiSlider || this._sliderAreas[idx] !== planning.length) {
        this._sliderAreas[idx] = planning.length
        if (domSlider.noUiSlider) {
          domSlider.noUiSlider.destroy()
        }

        this._slider[idx] = noUiSlider.create(domSlider, {
          start: knobs,
          connect: true,
          step: 1,
          animate: true,
          range: {
            'min': [0, 15],
            'max': [1440]
          },
          format: wNumb({ decimals: 1, edit: minuter }),
          pips: { // Show a scale with the slider
            mode: 'positions',
            values: [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100],
            stepped: true,
            density: 4,
            format: wNumb({ decimals: 1, edit: minuter })
          },
          tooltips: [wNumb({ decimals: 1, edit: minuter }), ...planning.map(() => wNumb({ decimals: 1, edit: minuter })), wNumb({ decimals: 1, edit: () => '+' })],
          behaviour: 'tap-drag',
          orientation: 'vertical'
        })

        this._slider[idx].on('change', this.changeEnergyCostsPlanning.bind(this, idx))

        const origins = domSlider.getElementsByClassName('noUi-origin')
        origins[0].setAttribute('disabled', true)
        if (origins[6]) {
          origins[6].setAttribute('disabled', true)
        }
      } else {
        this._slider[idx].set(knobs)
      }
    })

    if (this.state.currentLocation.name.length) {
      $('#domotics_settings .location-field label').addClass('active')
      $('#domotics_settings .autocomplete').val(this.state.currentLocation.name)
    }
  }

  render () {
    const { locationSearch, currentLocation, energyCosts } = this.state

    const locations = locationSearch.reduce((acc, loc) => {
      acc[loc.title] = null
      return acc
    }, {})

    return (
      <div id='domotics_settings' className='card domoticsSettings'>
        <div className='section left-align'>
          <h5>Home settings</h5>
          <p>
            Setup home location and global domotics data to enhance a lot of useful features (weather, sunrise time, ...).
          </p>
          <Row className='section card form location-field'>
            <Icon s={1} className='hide-on-small-only location-icon' left>my_location</Icon>
            <br />
            <Autocomplete s={12} m={11} l={11} title='Nearest big city'
              value={currentLocation.name}
              onChange={this.onLocationChanged.bind(this)}
              options={{ minLength: 2, limit: 10, onAutocomplete: this.onLocationChoosed.bind(this), data: Object.assign({}, ...locations) }} />
          </Row>
          <Row className='section card form'>
            <p className='col s12'>
              <Icon left>flash_on</Icon>
              Energy pricing allows you to follow comsumption and real time costs.
              <br clear='both' /><br clear='both' />
            </p>
            {energyCosts.prices.map((pricing, idx) => (
              <TextInput s={6} m={4} l={4} key={idx} type='number' label={idx === 0 ? 'Base pricing' : `Pricing #${idx}`}
                onChange={this.pricingChange.bind(this, idx)} value={`${pricing}` || '0'} min={0} max={100} step={0.0001} />
            ))}
            <hr className='col s12' />

            <table className='responsive-table centered'>
              <thead>
                <tr>
                  {_weekdays.map((weekday, idx) => (<th key={`weekdays_h${idx}`}>{weekday}</th>))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {_weekdays.map((weekday, idx) => (<td key={`weekdays_a${idx}`} className='energyPlanningSlider'>
                    <div id={`weekdays_a_slider_${idx}`} />
                  </td>))}
                </tr>
                <tr className='energyPlanningPrices'>
                  {_weekdays.map((weekday, idx) => (<td key={`weekdays_b${idx}`} className='top-aligned'>
                    <Select key={`weekdays_b${idx}_select`} label={null}
                      onChange={this.mainPricingChange.bind(this, idx)} value={`${energyCosts.planningBase[idx]}` || '0'}>
                      {energyCosts.prices.map((price, idx2) => (
                        <option key={`weekdays_b${idx}_select_${idx2}`} value={idx2}>{idx2 === 0 ? 'Base' : `#${idx2}`}</option>
                      ))}
                    </Select>

                    {energyCosts.planningOthers[idx].map((area, idx2) => (
                      <Select key={`weekdays_b${idx}_select_${idx2}`}
                        onChange={this.otherPricingChange.bind(this, idx, idx2)} value={`${area.pricing}` || '0'}>
                        {energyCosts.prices.map((price, idx3) => (
                          <option key={`weekdays_b${idx}_select_${idx2}_${idx3}`} value={idx3}>{idx3 === 0 ? 'Base' : `#${idx3}`}</option>
                        ))}
                      </Select>
                    ))}
                  </td>))}
                </tr>
              </tbody>
            </table>
          </Row>
        </div>
      </div>
    )
  }

  onLocationChanged (event, value) {
    if (event.clientX) {
      // use onLocationChoosed trigger instead
      return
    }
    const instance = M.Autocomplete.getInstance($(event.currentTarget))

    this._socket.emit('getCities', value, (answer) => {
      if (this._mounted) {
        answer = answer.map((loc) => ({ title: `${loc.name} (${loc.country})`, ...loc }))
        this.setState({ currentLocation: { name: value }, locationSearch: answer })
        instance.updateData(answer.reduce((acc, loc) => {
          acc[loc.title] = null
          return acc
        }, {}))
      }
    })
  }

  onLocationChoosed (value) {
    const city = this.state.locationSearch.find((loc) => loc.title === value)
    const location = { name: city.name, latitude: city.lat, longitude: city.lon }
    this.setState({
      currentLocation: location
    })

    $('#domotics_settings .autocomplete').val(location.name)

    this.props.serverStorage.setItem('settings-domotics-location', location)
    this._socket.emit('rescheduleAllTriggers')
    this.props.showRefreshButton()
  }

  pricingChange (idx, event) {
    const prices = [...this.state.energyCosts.prices]
    prices[idx] = parseFloat(event.currentTarget.value)
    this.setState({
      energyCosts: {
        prices,
        planningBase: this.state.energyCosts.planningBase,
        planningOthers: this.state.energyCosts.planningOthers
      }
    })
    this.energyCostsDebouncer()
    this.props.showRefreshButton()
  }

  mainPricingChange (weekdayIdx, event) {
    const planningBase = [...this.state.energyCosts.planningBase]
    planningBase[weekdayIdx] = parseInt(event.currentTarget.value)
    const energyCosts = {
      prices: this.state.energyCosts.prices,
      planningBase,
      planningOthers: this.state.energyCosts.planningOthers
    }
    this.setState({ energyCosts })
    this.props.serverStorage.setItem('settings-domotics-energy-costs', energyCosts)
    this.props.showRefreshButton()
  }

  otherPricingChange (weekdayIdx, areaIdx, event) {
    const planningOthers = [...this.state.energyCosts.planningOthers]
    planningOthers[weekdayIdx][areaIdx].pricing = parseInt(event.currentTarget.value)
    const energyCosts = {
      prices: this.state.energyCosts.prices,
      planningBase: this.state.energyCosts.planningBase,
      planningOthers: planningOthers
    }
    this.setState({ energyCosts })
    this.props.serverStorage.setItem('settings-domotics-energy-costs', energyCosts)
    this.props.showRefreshButton()
  }

  changeEnergyCostsPlanning (weekdayIdx, values) {
    const planningOthers = [...this.state.energyCosts.planningOthers]
    const planningBase = [...this.state.energyCosts.planningBase]

    const areaHours = values.slice(1) // exclude first area (base pricing): keep only 'Others'
      .map((v) => (parseInt(v.split(':')[0]) * 60) + parseInt(v.split(':')[1])) // parse to get start hour of each area

    let i = 0
    for (const startHour of areaHours) {
      if (i === areaHours.length - 1) { // the last knob case
        if (startHour < 1440) { // area to create at the end
          planningOthers[weekdayIdx].push({ hour: startHour, pricing: 0 })
          break
        }
      } else {
        if (startHour === 1440) { // areas to remove from index i to the end
          planningOthers[weekdayIdx].splice(i)
          break
        } else if (startHour === 0) { // areas to remove from start to index i included. pricing of area i to slide to base pricing
          planningBase[weekdayIdx] = planningOthers[weekdayIdx][i].pricing
          planningOthers[weekdayIdx].splice(0, i + 1)
          break
        } else if (startHour === areaHours[i + 1]) { // remove only this area
          if (startHour === planningOthers[weekdayIdx][i].hour) {
            planningOthers[weekdayIdx][i + 1].hour = startHour
          }
          planningOthers[weekdayIdx].splice(i, 1)
          break
        } else {
          planningOthers[weekdayIdx][i].hour = startHour
        }
      }

      i++
    }

    this.props.serverStorage.setItem('settings-domotics-energy-costs', this.state.energyCosts)
    this.setState({
      energyCosts: {
        prices: this.state.energyCosts.prices,
        planningBase: planningBase,
        planningOthers: planningOthers
      }
    })
    this.props.showRefreshButton()
  }
}

DomoticsSettings.propTypes = {
  theme: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired,
  privateSocket: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired,
  animationLevel: PropTypes.number.isRequired
}

DomoticsSettings.tabName = 'Domotics'

export default DomoticsSettings
