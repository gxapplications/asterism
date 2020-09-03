'use strict'

import { AdditionalItem, ItemFactoryBuilder } from 'asterism-plugin-library'

import GoToPathButtonItem from './go-to-path-button/item'
import GoToPathButtonSettingPanel from './go-to-path-button/setting-panel'

const builder = new ItemFactoryBuilder()
  .newItemType('go_to_path_button', AdditionalItem.categories.INFORMATION)
  .withDescription('Dashboards navigation button', 'A button to navigate through different dashboards.')
  .settingPanelWithHeader('Navigation button settings', 'link') // optional override, but always before *Instance*() calls...
  .newInstanceFromInitialSetting(1, 1, GoToPathButtonSettingPanel)
  .existingInstance(GoToPathButtonItem, GoToPathButtonSettingPanel)
  .acceptDimensions([
    { w: 1, h: 1 },
    { w: 2, h: 1 },
    { w: 3, h: 1 },
    { w: 1, h: 2 },
    { w: 2, h: 2 },
    { w: 3, h: 2 },
    { w: 1, h: 3 },
    { w: 2, h: 3 }
  ])
  .build()

class NavigationToolsItemFactory extends builder.build() {
  // more custom functions here if needed...
}

export default NavigationToolsItemFactory
