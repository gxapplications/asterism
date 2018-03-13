'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Icon } from 'react-materialize'

import { Item } from 'asterism-plugin-library'

class LevelStateControlItem extends Item {
  constructor (props) {
    super(props)

    this.scenariiService = this.props.context.services['asterism-scenarii']

    this.state.levelState = null
    this.state.stateListenerId = null
    this.state.currentLevel = 0

    this.receiveNewParams(this.state.params)
  }

  receiveNewParams (params) {
    if (params.levelState) {
      this.scenariiService.getStateInstance(params.levelState)
      .then((levelState) => {
        this.setState({
          params,
          levelState,
          currentLevel: levelState.data.state,
          stateListenerId: this.scenariiService.addStateListener(levelState, this.updateLevel.bind(this))
        })
      })
    }
  }

  componentWillUnmount () {
    if (this.state.stateListenerId) {
      this.scenariiService.removeStateListener(this.state.levelState, this.state.stateListenerId)
    }
  }

  render () {
    const { mainState, theme } = this.props.context
    const { animationLevel } = mainState()
    const { title = '', icon = 'error', color = 'inconspicuous' } = this.state.params
    const { levelState, currentLevel } = this.state

    const btnMoreColor = (levelState) ? `${levelState.data.colors[levelState.data.state]}-text` : 'white-text'
    const btnLessColor = (levelState) ? `${levelState.data.colors[levelState.data.state - 2]}-text` : 'white-text'
    const stateColor = (levelState) ? levelState.data.colors[levelState.data.state - 1] : 'black'

    return levelState ? (
      <div className={cx(stateColor, 'fluid levelStateItem')}>
        <Button waves={animationLevel >= 2 ? 'light' : null} disabled={currentLevel >= levelState.data.max}
          className={cx(theme.actions[color], 'truncate')} onClick={this.click.bind(this, 1)}>
          <Icon className={btnMoreColor}>keyboard_arrow_up</Icon>
        </Button>

        <div>
          <span><Icon>{icon}</Icon> {title || levelState.data.name} ({currentLevel})</span>
        </div>

        <Button waves={animationLevel >= 2 ? 'light' : null} disabled={currentLevel <= 1}
          className={cx(theme.actions[color], 'truncate')} onClick={this.click.bind(this, -1)}>
          <Icon className={btnLessColor}>keyboard_arrow_down</Icon>
        </Button>
      </div>
    ) : (
      <div />
    )
  }

  updateLevel (level, levelState) {
    this.setState({
      levelState,
      currentLevel: level
    })
  }

  click (delta) {
    this.state.levelState.data.state = this.state.currentLevel + delta
    this.scenariiService.setStateInstance(this.state.levelState)
  }
}

export default LevelStateControlItem
