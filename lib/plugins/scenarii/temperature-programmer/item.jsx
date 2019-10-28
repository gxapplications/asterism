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
        scaleOffset={14} scaleAmplitude={8} title={'pouet'}
        temperaturesGetter={() => Promise.resolve({ ecoTemperature: 16, comfortTemperature: 19 })}
        plannerGetter={() => Promise.resolve({
          plannings: [
            (new Array(48)).fill(1),
            (new Array(48)).fill(0),
            (new Array(48)).fill(1),
            (new Array(48)).fill(0),
            (new Array(48)).fill(1),
            (new Array(48)).fill(0),
            (new Array(48)).fill(1)
          ],
          todayOverridenPlanning: (new Array(48)).fill(1)
        })}
        onTemperaturesChange={(eco, comfort) => { console.log('##', eco, comfort) }}
        onPlannerChange={(plannings, todayOverridenPlanning) => { console.log('## ##', plannings, todayOverridenPlanning) }}
        onForceModeChange={(forceMode, duration) => { console.log('## ## ##', forceMode, duration) }}
      />
    )
  }
}

export default TemperatureProgrammerItem
