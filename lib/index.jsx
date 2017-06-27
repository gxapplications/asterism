'use strict'

import React from 'react'
import { Gridifier } from 'react-gridifier/dist/materialize'

import OrderHandler from './order-handler'

import 'react-gridifier/dist/styles.css'
import './styles.css'

class Asterism extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      editMode: false
    }

    this.orderHandler = new OrderHandler(window.localStorage, 'asterism-order-handler')
  }

  render () {
    return (
      <div className='asterism'>
        <Gridifier editable={this.state.editMode} sortDispersion orderHandler={this.orderHandler} />
      </div>
    )
  }
}

Asterism.propTypes = {

}

Asterism.defaultProps = {

}

export default Asterism

export { Asterism }
