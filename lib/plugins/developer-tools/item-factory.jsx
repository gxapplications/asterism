'use strict'

import AdditionalItem from '../additional-item'
import ItemFactoryBuilder from '../item-factory-builder'

import RefreshButtonItem from './refresh-button/item'
import RefreshButtonSettingPanel from './refresh-button/setting-panel'
import SocketLoggerItem from './socket-logger/item'
import SocketLoggerSettingPanel from './socket-logger/setting-panel'

const builder = new ItemFactoryBuilder()
.newItemType('refresh_button', AdditionalItem.categories.DEVELOPMENT)
  .withDescription('Refresh button', 'Just a refresh button for the whole page.')
  .newInstanceWithoutInitialSetting(RefreshButtonItem, 1, 2, RefreshButtonSettingPanel)
  .existingInstance(RefreshButtonItem, RefreshButtonSettingPanel)
  .acceptDimensions([
    { w: 1, h: 1 },
    { w: 2, h: 1 },
    { w: 1, h: 2 },
    { w: 2, h: 2 }
  ])
  .build()
.newItemType('socket_logger', AdditionalItem.categories.DEVELOPMENT)
  .withDescription('Socket logger', 'Listen for messages going through main socket.')
  .newInstanceFromInitialSetting(2, 2, SocketLoggerSettingPanel)
  .existingInstance(SocketLoggerItem, SocketLoggerSettingPanel)
  .acceptDimensions([
    { w: 2, h: 2 },
    { w: 3, h: 2 },
    { w: 2, h: 3 },
    { w: 3, h: 3 }
  ])
  .build()

class DeveloperToolsItemFactory extends builder.build() {
  // more custom functions here if needed...
}

export default DeveloperToolsItemFactory
