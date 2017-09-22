'use strict'

/* global $, plugins */
import cx from 'classnames'
import debounce from 'debounce'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon } from 'react-materialize'

import Display from './settings-display'
import Theme from './settings-theme'
import UserInterface from './settings-ui'

const debouncedResizeHandler = (delay) => debounce(() => {
  const slider = $('#settings-modal .carousel.carousel-slider').first()
  if (!slider.length) {
    return
  }
  slider.carousel({
    fullWidth: true,
    indicators: true,
    noWrap: true
  })
  $(window).one('resize', debouncedResizeHandler(delay))
}, delay + 100)

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showRefreshButton: false
    }

    // Plugin settings panels
    this.pluginSettingsPanels = (process.env.ASTERISM_SETTINGS_PANELS || []).map((toRequire) => {
      return {
        'Panel': plugins.settingsPanels[toRequire.module].default,
        'privateSocket': props.socketManager.connectPrivateSocket(toRequire.privateSocket), // TODO !0: tester
        'publicSockets': toRequire.publicSockets.reduce((acc, namespace) => {
            acc[namespace] = props.socketManager.connectPublicSocket(namespace)
            return acc
        }, {})
      }
    })

    // debounced onresize event
    $(window).one('resize', debouncedResizeHandler(this, 1080 / Math.pow(this.props.animationLevel, 2)))
  }

  componentDidMount () {
    $('#settings-modal').modal({
      dismissible: false,
      ready: () => {
        $('#settings-modal .carousel.carousel-slider').carousel({
          fullWidth: true,
          indicators: true,
          noWrap: true
        })
      }
    })
  }

  render () {
    const { theme, localStorage, serverStorage, itemManager, animationLevel } = this.props
    const { showRefreshButton } = this.state
    return (
      <div id='settings-modal' className={cx('modal', theme.backgrounds.body)}>
        <div className='modal-content'>
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
                Settings
              </h4>
            </div>
          </div>

          <div className='carousel carousel-slider center'>
            <Display theme={theme} itemManager={itemManager} serverStorage={serverStorage} animationLevel={animationLevel}
              showRefreshButton={() => this.setState({ showRefreshButton: true })} />
            <Theme localStorage={localStorage} theme={theme} animationLevel={animationLevel}
              showRefreshButton={() => this.setState({ showRefreshButton: true })} />
            <UserInterface localStorage={localStorage} theme={theme}
              showRefreshButton={() => this.setState({ showRefreshButton: true })} />

            {this.pluginSettingsPanels.map(({ Panel, privateSocket, publicSockets }, idx) => (
              <Panel key={idx} localStorage={localStorage} theme={theme}
                showRefreshButton={() => this.setState({ showRefreshButton: true })}
                privateSocket={privateSocket} publicSockets={publicSockets} />
            ))}
          </div>

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
