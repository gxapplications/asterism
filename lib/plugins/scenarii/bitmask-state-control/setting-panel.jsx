'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, TextInput, Row } from 'react-materialize'

import { Scenarii, IconPicker, ItemSettingPanel } from 'asterism-plugin-library'

import BitmaskStateControlItem from './item'

const { StatesDropdown } = Scenarii

class BitmaskStateControlSettingPanel extends ItemSettingPanel {
  constructor (props) {
    super(props)
    this.scenariiService = this.props.context.services['asterism-scenarii']

    this.state.stateInstance = null
  }

  componentWillMount () {
    this.scenariiService.getStateInstance(this.state.params.bitmaskState)
    .then((stateInstance) => {
      this.setState({ stateInstance })
    })
    .catch(() => {})
  }

  componentWillUpdate (nextProps, nextState) {
    if (this.state.params.bitmaskState !== nextState.params.bitmaskState) {
      this._bitmaskState.setState({ currentId: nextState.params.bitmaskState })

      this.scenariiService.getStateInstance(nextState.params.bitmaskState)
      .then((stateInstance) => {
        this.setState({ stateInstance })
      })
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true // needed for titles loop to work...
  }

  render () {
    const { theme, mainState } = this.props.context
    const { params, stateInstance } = this.state
    const { title = '', bitmaskState = '', titles = [], icons = [] } = params
    const { animationLevel } = mainState()

    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div id='bitmaskStateControlItemSettingDiv' className='clearing padded'>
        <Row className='padded card'>
          <StatesDropdown defaultStateId={bitmaskState} onChange={this.stateChange.bind(this)}
            ref={(c) => { this._bitmaskState = c }} theme={theme} animationLevel={animationLevel}
            services={() => this.props.context.services} label={null}
            typeFilter={(e) => e.id === 'bitmask-state'} instanceFilter={(e) => e.typeId === 'bitmask-state'} />

          <TextInput s={12} label='Label' ref={(c) => { this._title = c }}
            value={title} onChange={this.handleEventChange.bind(this, 'title')} />
        </Row>

        {stateInstance && stateInstance.data.colors.map((color, idx) => (
          <Row key={idx} className='padded card'>
            <IconPicker theme={{ ...theme, actions: { ...theme.actions, inconspicuous: `${color} lighten-1 black-text` } }}
              animationLevel={animationLevel} defaultIcon={icons[idx] || ''} onChange={this.handleIconChange.bind(this, idx)} />
            <TextInput s={12} m={10} l={10} label='Label' ref={(c) => { this[`_title_${idx}`] = c }}
              value={titles[idx] || ''} onChange={this.handleTitleChange.bind(this, idx)} />
          </Row>
        ))}

        <Button waves={waves} className={cx('right btn-bottom-sticky', theme.actions.primary)} onClick={this.save.bind(this)}>
          Save &amp; close
        </Button>
      </div>
    )
  }

  stateChange (value) {
    this.handleValueChange('bitmaskState', value)
    if (!this.state.params.title) {
      this.scenariiService.getStateInstance(value)
      .then((bitmaskState) => {
        this._title.setState({ value: bitmaskState.data.name })
        this.handleValueChange('title', bitmaskState.data.name)
      })
    }
  }

  handleTitleChange (position, event) {
    const value = event.currentTarget.value
    const titles = this.state.params.titles || []
    titles[position] = value
    this.handleValueChange('titles', titles)
  }

  handleIconChange (position, value) {
    const icons = this.state.params.icons || []
    icons[position] = value
    this.handleValueChange('icons', icons)
  }

  save () {
    this.next(BitmaskStateControlItem, this.state.params)
  }
}

export default BitmaskStateControlSettingPanel
