'use strict'

import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Input, Row } from 'react-materialize'
import uuid from 'uuid'

import { Scenarii } from 'asterism-plugin-library'

const { ActionsDropdown } = Scenarii

class BrowserProcedureEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.scenariiService = props.services()['asterism-scenarii']

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
    const { theme, animationLevel, instance, services } = this.props
    // const { deleteSequenceConfirm } = this.state
    const waves = this.props.animationLevel >= 2 ? 'waves-effect waves-light' : undefined
    // const deleteWaves = this.props.animationLevel >= 2 ? 'btn-flat waves-effect waves-red' : 'btn-flat'
    // const deleteWavesConfirm = (this.props.animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${this.props.theme.actions.negative}`

    const scriptsOrActions = sequence.map((e) => (typeof e === 'string') ? this.renderAction(e) : this.renderScript(e))
    return (
      <ol data-sequenceKey={key}>
        {scriptsOrActions.map((scriptOrAction) => (
          <li key={uuid.v4()}>
            <div className='orderHandler'><i className='material-icons'>reorder</i></div>
            <div className='removeAction'><i className='material-icons'>delete</i></div>
            <div className='globalizeAction'><i className='material-icons'>public</i></div>
            {scriptOrAction}
          </li>
        ))}

        {scriptsOrActions.length < 32 ? (
          <li className='add action'>
            <ActionsDropdown onChange={this.addAction.bind(this, sequence)} theme={theme} animationLevel={animationLevel}
              services={services} parentIdForNewInstance={instance.instanceId}
              icon={null} label='Add a script' dropdownId={uuid.v4()} />
          </li>
        ) : null}
        {scriptsOrActions.length < 32 ? (
          <li className={cx('add script', waves)} onClick={this.addScript.bind(this, sequence)}><i className='material-icons'>add</i>Add a script</li>
        ) : null}
      </ol>
    )
  }

  addAction (sequence, actionId) {
    sequence.push(actionId)
    this.forceUpdate()
  }

  renderAction (actionId) {
    // TODO !0: add 2 btns: "delete" & "make it global" in the corner...

    if (this.state[`actionEditPanel-${actionId}`]) {
      const ActionEditForm = this.state[`actionEditPanel-${actionId}`].EditForm

      return (
        <ActionEditForm
          instance={this.state.actionEditPanels[actionId].action} services={this.props.services}
          theme={this.props.theme} animationLevel={this.props.animationLevel} />
      )
    } else {
      this.scenariiService.getActionInstance(actionId, true)
      .then((action) => {
        console.log('#######', action) // TODO !0 action et action.EditForm ?
      })

      return (
        <div>
          Loading (TODO !0)
        </div>
      )
    }
  }

  deleteAction (actionId) {
    // TODO !0: remove from instance.data, but also if action has instance ID as parentId, then remove from DB.
  }

  addScript (sequence) {
    // TODO !1
  }

  deleteScript (sequence, script) {
    // TODO !1: confirm feature
    // TODO !1: warning, cascading delete, make all in the right order...
  }

  addSequence (script) {
    // TODO !2
  }

  deleteSequence (script, sequence, index) {
    // TODO !2: confirm feature
    // TODO !2: do the job: warning, cascading delete, make all in the right order...
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
