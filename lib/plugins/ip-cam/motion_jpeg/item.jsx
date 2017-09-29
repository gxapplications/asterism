'use strict'

/* global $ */
import React from 'react'
import 'jquery-network-camera/jquery.network-camera.js'

import Item from '../../item'

import styles from '../styles.scss'

class MjpegCameraItem extends Item {
  render () {
    return (
      <div>
        <div id='myCamera' className={styles.ipCam} />
        TODO !0 dev this; then test dist in prod mode...
        https://www.npmjs.com/package/jquery-network-camera
        https://github.com/fsandx/camelopard
      </div>
    )
  }

  componentDidMount () {
    $('#myCamera').networkCamera({
      'url': 'http://212.162.177.75/mjpg/video.mjpg'
    })
  }
}

export default MjpegCameraItem
