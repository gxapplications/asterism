'use strict'

import React from 'react'

import { Item, TemperatureProgrammer } from 'asterism-plugin-library'

class TemperatureProgrammerItem extends Item {
  constructor (props) {
    super(props)
    this.scenariiService = this.props.context.services['asterism-scenarii']
  }

  render () {
    const { mainState, theme } = this.props.context
    const { animationLevel } = mainState()

    // TODO
    return (
      <TemperatureProgrammer theme={theme} animationLevel={animationLevel}
        scaleOffset={14} scaleAmplitude={8} title={'pouet'} temperaturesGetter={() => {}}
        plannerGetter={() => {}} onTemperaturesChange={() => {}} onPlannerChange={() => {}}
        onForceModeChange={() => {}}
      />
    )
  }
}

export default TemperatureProgrammerItem
