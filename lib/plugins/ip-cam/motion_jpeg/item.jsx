'use strict'

import React from 'react'

import Item from '../../item'

import styles from '../styles.scss'

class MjpegCameraItem extends Item {
  render () {
    return (
      <div id='myCamera' className={styles.ipCam}>
        <object type='image/jpg' data='http://192.168.1.33/videostream.cgi'>
          <div>
            AAA
          </div>
        </object>
      </div>
    )
  }

  // TODO !0 dev this; then test dist in prod mode...
  // https://www.npmjs.com/package/jquery-network-camera
  // https://github.com/fsandx/camelopard

  /* componentDidMount () {
    const url = 'http://192.168.1.33/videostream.cgi'
  } */
}

export default MjpegCameraItem
