'use strict'

import PropTypes from 'prop-types'
import React from 'react'

class Item extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      params: { ...props.initialParams } // clone it, props are immutable unlike state
    }
  }

  receiveNewParams (params) {
    this.setState({ params })
    console.log(`New params received for item #${this.props.id}.`)
  }
}

Item.propTypes = {
  id: PropTypes.string.isRequired,
  initialParams: PropTypes.object
}

Item.defaultProps = {
  initialParams: {}
}

export default Item
