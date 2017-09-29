'use strict'

import AdditionalItem from '../additional-item'
import ItemFactoryBuilder from '../item-factory-builder'

import MjpegCameraItem from './motion_jpeg/item'
import MjpegCameraSettingPanel from './motion_jpeg/setting-panel'

const builder = new ItemFactoryBuilder()
.newItemType('motion_jpeg_cam', AdditionalItem.categories.SCREENING)
  .withDescription('Motion-jpeg camera', 'Screening from Motion-jpeg IP camera.')
  .settingPanelWithHeader('Motion-jpeg camera selection', 'videocam') // optional override, but always before *Instance*() calls...
  .newInstanceFromInitialSetting(2, 2, MjpegCameraSettingPanel)
  .existingInstance(MjpegCameraItem, MjpegCameraSettingPanel)
  .acceptDimensions([
    { w: 1, h: 1 },
    { w: 2, h: 2 },
    { w: 3, h: 3 }
  ])
  .build()

class IpCamItemFactory extends builder.build() {
  // more custom functions here if needed...
}

export default IpCamItemFactory
