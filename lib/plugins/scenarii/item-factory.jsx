'use strict'

import { AdditionalItem, ItemFactoryBuilder } from 'asterism-plugin-library'

import ActionButtonItem from './action-button/item'
import ActionButtonSettingPanel from './action-button/setting-panel'

import LevelStateControlItem from './level-state-control/item'
import LevelStateControlSettingPanel from './level-state-control/setting-panel'

const builder = new ItemFactoryBuilder()
.newItemType('action_button', AdditionalItem.categories.DOMOTICS)
  .withDescription('Action button', 'A button that launches an action')
  .settingPanelWithHeader('Action button settings', 'touch_app') // optional override, but always before *Instance*() calls...
  .newInstanceFromInitialSetting(1, 2, ActionButtonSettingPanel)
  .existingInstance(ActionButtonItem, ActionButtonSettingPanel)
  .acceptDimensions([
    { w: 1, h: 1 },
    { w: 2, h: 1 },
    { w: 1, h: 2 },
    { w: 2, h: 2 }
  ])
  .build()
.newItemType('level_state_control', AdditionalItem.categories.DOMOTICS)
  .withDescription('Level state control', 'A control to change level state')
  .settingPanelWithHeader('Level state control settings', 'touch_app') // optional override, but always before *Instance*() calls...
  .newInstanceFromInitialSetting(3, 1, LevelStateControlSettingPanel)
  .existingInstance(LevelStateControlItem, LevelStateControlSettingPanel)
  .acceptDimensions([
    { w: 1, h: 2 },
    { w: 1, h: 3 },
    { w: 2, h: 2 },
    { w: 2, h: 3 }
  ])
  .build()

class ScenariiItemFactory extends builder.build() {
  // more custom functions here if needed...
}

export default ScenariiItemFactory
