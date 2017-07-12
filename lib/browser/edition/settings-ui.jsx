'use strict'

import PropTypes from 'prop-types'
import React from 'react'

class SettingsUserInterface extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='carousel-item' href='#ui!'>
        <h2>User interface</h2>
        TODO: colors to change theme;

        <div className='section left-align'>
          <h5>Animations</h5>
          <p>
            <input name='animationLevel' type='radio' value='3' id='animationLevel3'
              onClick={this.setAnimationLevel.bind(this, 3)} />
            <label htmlFor='animationLevel3' className='truncate'>High animation level, my device is strong enough!</label>
          </p>
          <p>
            <input name='animationLevel' type='radio' value='2' id='animationLevel2'
              onClick={this.setAnimationLevel.bind(this, 2)} />
            <label htmlFor='animationLevel2' className='truncate'>Medium animation level, need to be fluent.</label>
          </p>
          <p>
            <input className='with-gap' name='animationLevel' type='radio' value='1' id='animationLevel1'
              onClick={this.setAnimationLevel.bind(this, 1)} />
            <label htmlFor='animationLevel1' className='truncate'>Low animation level, my device is a dinosaur...</label>
          </p>
        </div>
      </div>
    )
  }

  setAnimationLevel (level) {
    // TODO
    this.props.showRefreshButton()
  }
}

SettingsUserInterface.propTypes = {
  theme: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired
}

export default SettingsUserInterface
