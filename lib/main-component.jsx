'use strict'

import React from 'react'
import { Gridifier } from 'react-gridifier/dist/materialize'
import { Navbar, NavItem, Icon } from 'react-materialize'

import OrderHandler from './order-handler'

import 'react-gridifier/dist/styles.css'
import './styles.css'

class MainComponent extends React.Component {
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
        <Navbar fixed brand='&nbsp;&nbsp;⁂&nbsp;&nbsp;' href={null} right>
          <NavItem onClick={this.toggleEditMode.bind(this)}><Icon>edit</Icon> Turn edit mode</NavItem>
        </Navbar>
        <Gridifier editable={this.state.editMode} sortDispersion orderHandler={this.orderHandler} />
      </div>
    )
  }

  toggleEditMode () {
    this.setState({ editMode: !this.state.editMode })
  }
}

MainComponent.propTypes = {

}

MainComponent.defaultProps = {

}

export default MainComponent

export { MainComponent }
