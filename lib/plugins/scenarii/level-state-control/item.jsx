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
  }

  componentDidMount () {
    if (this.state.params.levelState) {
      this.scenariiService.getStateInstance(this.state.params.levelState)
      .then((levelState) => {
        this.setState({
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
    const { title = '', icon = 'error', color = 'primary' } = this.state.params
    const { levelState } = this.state

    const btnMoreColor = (levelState) ? `${levelState.data.colors[levelState.data.state]}-text` : 'white-text'
    const btnLessColor = (levelState) ? `${levelState.data.colors[levelState.data.state - 2]}-text` : 'white-text'
    const stateColor = (levelState) ? levelState.data.colors[levelState.data.state - 1] : 'black'

    return levelState ? (
      <div className={cx(stateColor, 'fluid levelStateItem')}>
        <Button waves={animationLevel >= 2 ? 'light' : null} disabled={levelState.data.state >= levelState.data.max}
          className={cx(theme.actions[color], 'truncate')} onClick={this.click.bind(this, 1)}>
          <Icon className={btnMoreColor}>keyboard_arrow_up</Icon>
        </Button>

        <div>
          <span><Icon>{icon}</Icon> {title || 'TODO'} ({levelState.data.state})</span>
        </div>

        <Button waves={animationLevel >= 2 ? 'light' : null} disabled={levelState.data.state <= 1}
          className={cx(theme.actions[color], 'truncate')} onClick={this.click.bind(this, -1)}>
          <Icon className={btnLessColor}>keyboard_arrow_down</Icon>
        </Button>
      </div>
    ) : (
      <div />
    )
  }

  updateLevel (level, levelState) {
    // TODO !0
    console.log('###1', level, levelState)
  }

  click (delta) {
    // TODO !0
    console.log('###2', delta)
  }
}

export default LevelStateControlItem
