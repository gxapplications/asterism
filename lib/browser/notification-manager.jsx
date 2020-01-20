'use strict'

/* global fetch, process, navigator */
import cx from 'classnames'
import React from 'react'
import { NavItem } from 'react-materialize'

const _urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const _translateCss = (css, theme) => {
  switch (css) {
    case 'error':
      return theme.feedbacks.error
    case 'warning':
      return theme.feedbacks.warning
    default:
      return ''
  }
}

export default class NotificationManager {
  constructor (mainComponent, logger) {
    this.mainComponent = mainComponent
    this.logger = logger
    this.navItems = []
    this.webPushParams = process.env.ASTERISM_WEB_PUSH_PARAMS || {}
    console.log('######', process.env.ASTERISM_WEB_PUSH_PARAMS, navigator.serviceWorker)
    if ('serviceWorker' in navigator && this.webPushParams.publicVapidKey) {
      this.registerWebPushServiceWorker().catch(console.error)
    }
  }

  setCallback (func) {
    // works only once to avoid a replace.
    if (!this.callback) {
      this.callback = func
      Object.freeze(this.callback)
    }
  }

  update (socketMessages) {
    socketMessages.forEach((message) => {
      let animation = []
      switch (message.command) {
        case 'highlight':
          animation.push('animation wobble-scaled-80')
          setTimeout(() => {
            let item = this.navItems.find((i) => i.id === message.id) || {}
            delete item.animation
            this.mainComponent.setState({ notifications: this.navItems })
          }, 4000)

          // fall through
        case 'set':
          let item = this.navItems.find((i) => i.id === message.id) || {}
          if (!item.id) {
            this.navItems.push(item)
          }
          item.id = message.id
          item.icon = message.icon
          item.css = message.css
          item.animation = animation
          item.onClick = () => {
            this.callback(item.id, (serverResult) => {
              if (serverResult.success) {
                let item = this.navItems.find((i) => i.id === message.id) || {}
                item.feedback = 'animation rubberBand80'
                this.mainComponent.setState({ notifications: this.navItems })
                setTimeout(() => {
                  let item = this.navItems.find((i) => i.id === message.id) || {}
                  delete item.feedback
                  this.mainComponent.setState({ notifications: this.navItems })
                }, 2000)
              } else if (serverResult.error) {
                this.logger.error(serverResult.error)
                this.mainComponent.setState({ messageModal: { message: serverResult.error, icon: message.icon } })
              }
            })
          }
          break
        case 'remove':
          this.navItems = this.navItems.filter((i) => i.id !== message.id) || {}
          break
        default:
          this.logger.error('Notification update: Unknown command!')
      }
    })
    this.mainComponent.setState({ notifications: this.navItems })
  }

  getComponents ({ animationLevel, theme }) {
    return this.navItems.map((item, idx) => (
      <NavItem key={idx}
        className={cx(
          'notification-item',
          `notification-item-${item.id}`,
          animationLevel >= 2 ? 'waves-effect waves-light' : '',
          item.animation,
          item.feedback,
          _translateCss(item.css, theme)
        )}
        href='javascript:void(0)' onClick={item.onClick}
      >
        <i className={cx('material-icons', item.icon)}>{item.icon}</i>
      </NavItem>
    ))
  }

  registerWebPushServiceWorker () {
    this.logger.info('Registering web-push service worker...')
    return navigator.serviceWorker.register('/web-push-worker.js', {scope: '/'})
    .then((registration) => {
      this.logger.info('Registered web-push service worker. Registering web-push subscription...')

      registration.pushManager.subscribe({
        userVisibleOnly: true,
        // https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
        applicationServerKey: _urlBase64ToUint8Array(this.webPushParams.publicVapidKey)
      })
      .then((subscription) => {
        this.logger.info('Registered web-push subscription. Sending subscription to server...')

        fetch('/web-push-subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: { 'content-type': 'application/json' }
        })
        .then(() => {
          this.logger.info('Sent subscription to server.')
        })
      })
    })
  }
}
