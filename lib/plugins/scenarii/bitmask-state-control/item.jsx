'use strict'

import cx from 'classnames'
import React from 'react'
import { Icon, Row } from 'react-materialize'

import { Item } from 'asterism-plugin-library'

class BitmaskStateControlItem extends Item {
  constructor (props) {
    super(props)

    this.scenariiService = this.props.context.services['asterism-scenarii']

    this.state.bitmaskState = null
    this.state.stateListenerId = null
    this.state.currentvalue = 0

    this.receiveNewParams(this.state.params)
  }

  receiveNewParams (params) {
    if (params.bitmaskState) {
      this.scenariiService.getStateInstance(params.bitmaskState)
      .then((bitmaskState) => {
        this.setState({
          params,
          bitmaskState,
          currentValue: bitmaskState.data.state,
          stateListenerId: this.scenariiService.addStateListener(bitmaskState, this.updateState.bind(this))
        })
      })
    }
  }

  componentWillUnmount () {
    if (this.state.stateListenerId) {
      this.scenariiService.removeStateListener(this.state.bitmaskState, this.state.stateListenerId)
    }
  }

  render () {
    const { theme } = this.props.context
    const { title = '', titles = [], icons = [] } = this.state.params
    const { bitmaskState, currentValue } = this.state

    return bitmaskState ? (
      <div className={cx('fluid bitmaskStateItem', theme.backgrounds.card)}>
        {title && title.length > 0 && (
          <Row className='col s12 mainTitle'>
            <div className='fluid'>
              <div className='truncate'>{title}</div>
            </div>
          </Row>
        )}

        <Row className='col s12 switches thin-scrollable'>
          {bitmaskState.data.colors.map((color, idx) => (
            <div key={idx} className='fluid switch vertical-switch'>
              <label>
                <input type='checkbox' name={`switch-${idx}`} value={`switch-${idx}`} checked={currentValue & (2 ** idx)}
                  onChange={this.changePosition.bind(this, idx)} />
                <span className={cx('lever', color, { 'titled': titles[idx] && titles[idx].length > 0 })}>
                  {icons[idx] && icons[idx].length > 0 && [
                    <Icon key={0}>{icons[idx]}</Icon>,
                    <Icon key={1}>{icons[idx]}</Icon>
                  ]}
                  {titles[idx] && titles[idx].length > 0 && [
                    <br key={2} />,
                    <span key={3} className='truncate'>{titles[idx]}</span>
                  ]}
                </span>
              </label>
            </div>
          ))}
        </Row>
      </div>
    ) : (
      <div />
    )
  }

  changePosition (position, event) {
    const way = event.currentTarget.checked
    const oldState = this.state.bitmaskState.data.state
    const shift = 2 ** position

    const newStateValue = way ? (oldState | shift) : (oldState & ~shift)
    this.scenariiService.setStateState(this.state.bitmaskState, newStateValue)
    .then((state) => this.scenariiService.setStateInstance(state))
    .then(() => {
      this.state.bitmaskState.data.state = newStateValue
    })
    .catch((error) => {
      console.log(error)
    })
  }

  updateState (value, bitmaskState) {
    this.setState({
      bitmaskState: Object.assign(this.state.bitmaskState, bitmaskState),
      currentValue: value
    })
  }
}

export default BitmaskStateControlItem
