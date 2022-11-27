'use strict'

import { AdditionalItem, ItemFactoryBuilder } from 'asterism-plugin-library'

const builder = new ItemFactoryBuilder()
/*  .newItemType('refresh_button', AdditionalItem.categories.DEVELOPMENT)
  .withDescription('Refresh button', 'Just a refresh button for the whole page.')
  .settingPanelWithHeader('Refresh button settings', 'touch_app') // optional override, but always before *Instance*() calls...
  .newInstanceWithoutInitialSetting(RefreshButtonItem, 1, 2, RefreshButtonSettingPanel)
  .existingInstance(RefreshButtonItem, RefreshButtonSettingPanel)
  .acceptDimensions([
    { w: 1, h: 1 },
    { w: 2, h: 1 },
    { w: 1, h: 2 },
    { w: 2, h: 2 }
  ])
  .build()
*/
class MonitorItemFactory extends builder.build() {
  // more custom functions here if needed...
}

export default MonitorItemFactory
