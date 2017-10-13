'use strict'

/* global $, plugins */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Tab, Tabs } from 'react-materialize'

import Display from './settings-display'
import Theme from './settings-theme'
import UserInterface from './settings-ui'

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showRefreshButton: false
    }

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

  render () {
    const { theme, localStorage, serverStorage, itemManager, animationLevel } = this.props
    const { showRefreshButton } = this.state

    return (
      <div id='settings-modal' className={cx('modal', theme.backgrounds.body)}>
        <div className='modal-content thin-scrollable'>
          <div className={cx('coloring-header', theme.backgrounds.editing)}>
            <div>
              {showRefreshButton
                ? <button className={cx('right btn', animationLevel >= 2 ? 'waves-effect waves-light' : null, theme.actions.edition)}
                  onClick={this.reloadPage.bind(this)}>
                  <span className='hide-on-med-and-down'>Close and reload screen</span>
                  <span className='hide-on-small-only hide-on-large-only'>Close &amp; reload</span>
                  <span className='hide-on-med-and-up'>Close</span>
                </button>
                : <a href='#!' className={cx('right modal-action modal-close btn-flat', animationLevel >= 2 ? 'waves-effect waves-light' : null)}>Close</a>
              }
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
                showRefreshButton={() => this.setState({ showRefreshButton: true })} />
            </Tab>
            <Tab title='Theme' active={this._activeTabIndex === 1}>
              <Theme localStorage={localStorage} theme={theme} animationLevel={animationLevel}
                showRefreshButton={() => this.setState({ showRefreshButton: true })} />
            </Tab>
            <Tab title='User interface' active={this._activeTabIndex === 2}>
              <UserInterface localStorage={localStorage} theme={theme} animationLevel={animationLevel}
                showRefreshButton={() => this.setState({ showRefreshButton: true })} />
            </Tab>
            {this.pluginSettingsPanels.map(({ Panel, privateSocket, publicSockets, serverStorage }, idx) => (
              <Tab title={Panel.tabName || idx} key={idx + 3} active={this._activeTabIndex === idx + 3}>
                <Panel localStorage={localStorage} theme={theme} animationLevel={animationLevel}
                  serverStorage={serverStorage} showRefreshButton={() => this.setState({ showRefreshButton: true })}
                  privateSocket={privateSocket} publicSockets={publicSockets} />
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    )
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
