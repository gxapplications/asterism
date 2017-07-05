'use strict'

/*global $ */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'react-materialize'

class AddCategoryButtons extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      clazz: ''
    }
  }

  componentWillEnter (callback) {
    this.setState({
      clazz: 'scale-transition scale-out'
    })
    return callback()
  }

  componentDidEnter () {
    window.setTimeout(() => {
      this.setState({
        clazz: 'scale-transition scale-in'
      })
    }, 50)
  }

  componentWillLeave (callback) {
    this.setState({
      clazz: 'scale-transition scale-out'
    })
    return window.setTimeout(callback, 200)
  }

  categorySelect (category, event) {
    const buttonCoords = $(event.nativeEvent.target).offset()
    console.log(category, buttonCoords)
    // TODO
  }

  render () {
    const { theme } = this.props
    return (
      <Button large floating fab='vertical' icon='add_box' waves='light' className={cx(theme.actions.edition, this.state.clazz)}>
        {(process.env.NODE_ENV !== 'production') ? (
          <Button floating icon='bug_report' waves='light' className='grey pulse' onClick={this.categorySelect.bind(this, 'development')} />
        ) : null}

        <Button floating icon='info' waves='light' className={theme.actions.secondary} onClick={this.categorySelect.bind(this, 'information')} />
        <Button floating icon='question_answer' waves='light' className={theme.actions.secondary} onClick={this.categorySelect.bind(this, 'communication')} />
        <Button floating icon='videocam' waves='light' className={theme.actions.secondary} onClick={this.categorySelect.bind(this, 'screening')} />
        <Button floating icon='notifications_active' waves='light' className={theme.actions.secondary} onClick={this.categorySelect.bind(this, 'security')} />
        <Button floating icon='touch_app' waves='light' className={theme.actions.secondary} onClick={this.categorySelect.bind(this, 'domotics')} />
      </Button>
    )
  }
}

AddCategoryButtons.propTypes = {
  theme: PropTypes.object.isRequired
}

export default AddCategoryButtons
