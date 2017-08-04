'use strict'

import React from 'react'

import AdditionalItem from '../additional-item'
import RefreshButtonSettingPanel from './refresh-button/setting-panel'
import SocketLoggerSettingPanel from './socket-logger/setting-panel'

// TODO !8: make a itemFactoryBuilder, and extends/use it here
class DeveloperToolsItemFactory {
  constructor ({ localStorage, serverStorage, mainState }) {
    this.items = {
      'refresh_button': {
        additionalItem: new AdditionalItem(
          this, 'refresh_button',
          'Refresh button',
          AdditionalItem.categories.DEVELOPMENT,
          'Just a refresh button for the whole page.'
        ),
        newInstance: () => ({
          item: <div>New refresh btn</div>,
          preferredHeight: 1,
          preferredWidth: 1,
          settingPanel: new RefreshButtonSettingPanel()
        }), // newInstance this way OR an initial ItemSettingPanel instance instead
        dimensions: [
          { w: 1, h: 1 },
          { w: 2, h: 1 },
          { w: 1, h: 2 },
          { w: 2, h: 2 }
        ]
      },
      'socket_logger': {
        additionalItem: new AdditionalItem(
          this, 'socket_logger',
          'Socket logger',
          AdditionalItem.categories.DEVELOPMENT,
          'Listen for messages going through main socket.'
        ),
        newInstance: () => new SocketLoggerSettingPanel(), // newInstance this way OR like refresh_button example
        dimensions: [
          { w: 2, h: 2 },
          { w: 3, h: 2 },
          { w: 2, h: 3 },
          { w: 3, h: 3 }
        ]
      }
    }
  }

  getAdditionalItems (category) {
    // here we can filter more depending on the context (if settings required before to show these items)
    return Object.values(this.items).map((i) => i.additionalItem).filter((ai) => ai.category === category)
  }

  instantiateNewItem (additionalItemId) {
    return this.items[additionalItemId].newInstance()
  }

  instantiateItem (instanceId) {
    // TODO !0: from instanceID, guess AdditionalItem ID, then:
    // TODO !1: return an existing component and its settingPanel
    return {
      item: <div>{instanceId}</div>,
      settingPanel: new RefreshButtonSettingPanel()
    }
  }

  removeItem (instanceId) {
    console.log(`Ok, item #${instanceId} is removed.`)
    // TODO !8: when needed, purge data server side for this instance? only if not used by another board !!! how to do ?
  }
}

export default DeveloperToolsItemFactory
