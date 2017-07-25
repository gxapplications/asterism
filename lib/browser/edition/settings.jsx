'use strict'

/*global $ */
import cx from 'classnames'
import debounce from 'debounce'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon } from 'react-materialize'

import UserInterface from './settings-ui'
import Display from './settings-display'

const debouncedResizeHandler = (delay) => debounce(() => {
  console.log('resized')
  $('#settings-modal .carousel.carousel-slider').carousel({
    fullWidth: true,
    indicators: true,
    noWrap: true
  })
  $(window).one('resize', debouncedResizeHandler(delay))
}, delay)

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showRefreshButton: false
    }
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

    // debounced onresize event
    $(window).one('resize', debouncedResizeHandler(1080 / Math.pow(this.props.animationLevel, 2)))
  }

  render () {
    const { theme, localStorage, serverStorage, orderHandler } = this.props
    const { showRefreshButton } = this.state
    return (
      <div id='settings-modal' className={cx('modal', theme.backgrounds.body)}>
        <div className='modal-content'>
          <div className={cx('coloring-header', theme.backgrounds.editing)}>
            <div>
              {showRefreshButton
                ? <button className={cx('right waves-effect waves-light btn', theme.actions.edition)}
                  onClick={this.reloadPage.bind(this)}>
                  <span className='hide-on-med-and-down'>Close and reload screen</span>
                  <span className='hide-on-small-only hide-on-large-only'>Close &amp; reload</span>
                  <span className='hide-on-med-and-up'>Close</span>
                </button>
                : <a href='#!' className='right modal-action modal-close waves-effect waves-light btn-flat'>Close</a>
              }
              <h4>
                <Icon small>settings</Icon>
                Settings
              </h4>
            </div>
          </div>

          <div className='carousel carousel-slider center'>
            <Display theme={theme} orderHandler={orderHandler} serverStorage={serverStorage}
              showRefreshButton={() => this.setState({ showRefreshButton: true })} />
            <UserInterface localStorage={localStorage} theme={theme}
              showRefreshButton={() => this.setState({ showRefreshButton: true })} />
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
  orderHandler: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired
}

export default Settings
