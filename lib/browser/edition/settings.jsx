'use strict'

/* global $, plugins */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Tab, Tabs } from 'react-materialize'

import Display from './settings-display'
import UserInterface from './settings-ui'

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this._activeTabIndex = 0

    // Plugin settings panels
    this.pluginSettingsPanels = (process.env.ASTERISM_SETTINGS_PANELS || []).map((toRequire) => {
      return {
        'Panel': plugins.settingsPanels[toRequire.module].default,
        'privateSocket': props.socketManager.connectPrivateSocket(toRequire.privateSocket),
        'publicSockets': toRequire.publicSockets.reduce((acc, namespace) => {
          acc[namespace] = props.socketManager.connectPublicSocket(namespace)
          return acc
        }, {}),
        'serverStorage': props.serverStorage.createSubStorage(toRequire.libName)
      }
    })
  }

  componentDidMount () {
    $('#settings-modal').modal({
      dismissible: false,
      opacity: 0.5,
      inDuration: this.props.animationLevel >= 2 ? 300 : 0,
      outDuration: this.props.animationLevel >= 2 ? 300 : 0,
      endingTop: '10%',
      ready: () => {
        $('#settings-modal .modal-content > div.row > div.col > ul.tabs').tabs({ onShow: (p) => {
          $(`#settings-modal .modal-content > div.row > div.col > ul.tabs > li.tab > a[href^='#']`).each((idx, el) => {
            if ($(el).attr('href') === p.selector) {
              this._activeTabIndex = idx
            }
          })
        } })

        // Select first tab
        $('#settings-modal .modal-content > div.row > div.col > ul.tabs > li:first > a').click()
      }
    })
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    const { theme, localStorage, serverStorage, itemManager, animationLevel } = this.props

    return (
      <div id='settings-modal' className={cx('modal', theme.backgrounds.body)}>
        <div className='modal-content thin-scrollable'>
          <div className={cx('coloring-header', theme.backgrounds.editing)}>
            <div>
              <button id='settings-modal-refresh-button'
                className={cx(
                  'right btn hide',
                  { 'waves-effect waves-light': animationLevel >= 2 },
                  theme.actions.edition
                )}
                onClick={this.reloadPage.bind(this)}>
                <span className='hide-on-med-and-down'>Close and reload screen</span>
                <span className='hide-on-small-only hide-on-large-only'>Close &amp; reload</span>
                <span className='hide-on-med-and-up'>Close</span>
              </button>
              <a href='javascript:void(0)' id='settings-modal-close-button'
                className={cx(
                  'right modal-action modal-close btn-flat',
                  { 'waves-effect waves-light': animationLevel >= 2 }
                )}>Close</a>
              <h4>
                <Icon small>settings</Icon>
                <span className='hide-on-small-only'>Settings</span>
              </h4>
            </div>
          </div>

          <Tabs>
            <Tab title='Display' active={this._activeTabIndex === 0}>
              <Display theme={theme} itemManager={itemManager} serverStorage={serverStorage}
                animationLevel={animationLevel}
                showRefreshButton={this.showRefreshButton.bind(this)} />
            </Tab>
            <Tab title='User interface' active={this._activeTabIndex === 1}>
              <UserInterface localStorage={localStorage} theme={theme} animationLevel={animationLevel}
                showRefreshButton={this.showRefreshButton.bind(this)} />
            </Tab>
            {this.pluginSettingsPanels.map(({ Panel, privateSocket, publicSockets, serverStorage }, idx) => (
              <Tab title={Panel.tabName || idx} key={idx + 2} active={this._activeTabIndex === idx + 2}>
                <Panel localStorage={localStorage} theme={theme} animationLevel={animationLevel}
                  serverStorage={serverStorage} showRefreshButton={this.showRefreshButton.bind(this)}
                  privateSocket={privateSocket} publicSockets={publicSockets} />
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    )
  }

  showRefreshButton () {
    $('#settings-modal-refresh-button').removeClass('hide')
    $('#settings-modal-close-button').addClass('hide')
  }

  reloadPage () {
    window.location.reload()
  }
}

Settings.propTypes = {
  theme: PropTypes.object.isRequired,
  localStorage: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired,
  itemManager: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired
}

export default Settings
