'use strict'

import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Input, Row } from 'react-materialize'
import uuid from 'uuid'

class BrowserProcedureEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      deleteSequenceConfirm: null
    }
  }

  render () {
    const { instance } = this.props
    return (
      <div>
        <Row className='section card form'>
          <Input placeholder='Give a name to quickly identify your action' s={12} label='Name'
            defaultValue={instance.data.name} onChange={(e) => { instance.data.name = e.currentTarget.value }} />
        </Row>

        <Row className='section procedurePanel'>
          {this.renderScript(instance.data.script)}
        </Row>
      </div>
    )
  }

  renderScript (script) {
    const { deleteSequenceConfirm } = this.state
    const waves = this.props.animationLevel >= 2 ? 'waves-effect waves-light' : undefined
    const deleteWaves = this.props.animationLevel >= 2 ? 'btn-flat waves-effect waves-red' : 'btn-flat'
    const deleteWavesConfirm = (this.props.animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${this.props.theme.actions.negative}`

    const sequences = Object.entries(script).map(([sequenceKey, sequence]) => this.renderSequence(sequence, sequenceKey))
    return (
      <ul>
        {sequences.map((sequence, idx) => (
          <li key={uuid.v4()}>
            <div className={cx('remove sequence', (deleteSequenceConfirm === sequence) ? deleteWavesConfirm : deleteWaves)}
              onClick={this.deleteSequence.bind(this, script, sequence, idx)}>
              <i className='material-icons'>delete</i>
            </div>
            {sequence}
          </li>
        ))}
        {sequences.length < 32 ? (
          <li className={cx('add sequence', waves)} onClick={this.addSequence.bind(this, script)}><i className='material-icons'>add</i>Add a parallelized sequence</li>
        ) : null}
      </ul>
    )
  }

  renderSequence (sequence, key) {
    const { deleteSequenceConfirm } = this.state
    const waves = this.props.animationLevel >= 2 ? 'waves-effect waves-light' : undefined
    const deleteWaves = this.props.animationLevel >= 2 ? 'btn-flat waves-effect waves-red' : 'btn-flat'
    const deleteWavesConfirm = (this.props.animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${this.props.theme.actions.negative}`

    const scriptsOrActions = sequence.map((e) => (typeof e === 'string') ? this.renderAction(e) : this.renderScript(e))
    return (
      <ol data-sequenceKey={key}>
        {scriptsOrActions.map((scriptOrAction) => (
          <li key={uuid.v4()}>
            <div className='orderHandler'><i className='material-icons'>reorder</i></div>
            {scriptOrAction}
          </li>
        ))}

        <li>
          <div className='orderHandler'><i className='material-icons'>reorder</i></div>
          <ul>
            <li>
              <div className={cx('remove sequence', (deleteSequenceConfirm === sequence) ? deleteWavesConfirm : deleteWaves)}
                onClick={this.deleteSequence.bind(this, sequence, 0)}>
                <i className='material-icons'>delete</i>
              </div>
              <ol>
                <li>
                  <div className='orderHandler'><i className='material-icons'>reorder</i></div>
                  <ul>
                    <li>
                      <div className={cx('remove sequence', (deleteSequenceConfirm === sequence) ? deleteWavesConfirm : deleteWaves)}
                        onClick={this.deleteSequence.bind(this, sequence, 0)}>
                        <i className='material-icons'>delete</i>
                      </div>
                      <ol>
                        <li>test</li>
                        <li className='add action'>ADD a new action // TODO !0</li>
                        <li className='add script'><i className='material-icons'>add</i>Add a script</li>
                      </ol>
                    </li>
                    <li className={cx('add sequence', waves)} onClick={() => {}}><i className='material-icons'>add</i>Add a parallelized sequence</li>
                  </ul>
                </li>
                <li className='add action'>ADD a new action // TODO !0</li>
                <li className='add script'><i className='material-icons'>add</i>Add a script</li>
              </ol>
            </li>
            <li className={cx('add sequence', waves)} onClick={() => {}}><i className='material-icons'>add</i>Add a parallelized sequence</li>
          </ul>
        </li>
        <li>
          <div className='orderHandler'><i className='material-icons'>reorder</i></div>
          <ul>
            <li>
              <div className={cx('remove sequence', (deleteSequenceConfirm === sequence) ? deleteWavesConfirm : deleteWaves)}
                onClick={this.deleteSequence.bind(this, sequence, 0)}>
                <i className='material-icons'>delete</i>
              </div>
              <ol>
                <li className='add action'>ADD a new action // TODO !0</li>
                <li className='add script'><i className='material-icons'>add</i>Add a script</li>
              </ol>
            </li>
            <li className={cx('add sequence', waves)} onClick={() => {}}><i className='material-icons'>add</i>Add a parallelized sequence</li>
          </ul>
        </li>

        {scriptsOrActions.length < 32 ? (
          <li className={cx('add action', waves)}>ADD a new action // TODO !0: actions dropdown</li>
        ) : null}
        {scriptsOrActions.length < 32 ? (
          <li className={cx('add script', waves)} onClick={this.addScript.bind(this, sequence)}><i className='material-icons'>add</i>Add a script</li>
        ) : null}
      </ol>
    )
  }

  renderAction (actionId) {
    // TODO !0: call action edit-form, and add a "delete" button in the corner...
    return `Action #${actionId}`
  }

  deleteAction (actionId) {
    // TODO !0
  }

  addScript (sequence) {
    // TODO !1
  }

  deleteScript (sequence, script) {
    // TODO !1
  }

  addSequence (script) {
    // TODO !2
  }

  deleteSequence (script, sequence, index) {
    // TODO !2: confirm feature
    // TODO !2: do the job
  }

  reorderSequence () {
    // TODO !2
  }
}

BrowserProcedureEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired
}

BrowserProcedureEditForm.label = 'Basic procedure'

export default BrowserProcedureEditForm
