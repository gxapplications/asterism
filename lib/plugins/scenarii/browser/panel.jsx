'use strict'

/* global $ */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Modal, Tab, Tabs } from 'react-materialize'

import PanelList from './panel-list'

import styles from '../scenarii.scss'

class ScenariiEditPanel extends React.Component {
  constructor (props) {
    super(props)

    this._tabs = [ null, null, null, null ]
    this._editInstance = null
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      EditForm: null,
      currentTab: 0
    }
  }

  componentDidMount () {
    $('#scenarii-edit-panel.coloring-header-tabs div.row > div.col:first-of-type').addClass(this.props.theme.backgrounds.editing)
  }

  shouldComponentUpdate (nextState) {
    return (this.state.EditForm !== nextState.EditForm && this.state.currentTab !== nextState.currentTab)
  }

  render () {
    const { theme, animationLevel, services } = this.props
    const { EditForm, currentTab } = this.state
    return (
      <div id='scenarii-edit-panel' className={cx(styles.ScenariiEditPanel, { 'editFormOpened': !!EditForm }, 'coloring-header-tabs thin-scrollable')}>
        <Tabs onChange={this.tabChanged.bind(this)}>
          <Tab title={(<span><Icon>offline_pin</Icon> <span className='hide-on-small-only'>Scenarii</span></span>)} active={currentTab === 0}>
            <div ref={(c) => { this._tabs[0] = c }}>Scenarii, to do...</div>
          </Tab>
          <Tab title={(<span><Icon>help</Icon> <span className='hide-on-small-only'>Conditions</span></span>)} active={currentTab === 1}>
            <PanelList theme={theme} animationLevel={animationLevel}
              getInstances={this.scenariiService.getConditionInstances.bind(this.scenariiService)}
              getTypes={this.scenariiService.getConditionTypes.bind(this.scenariiService)}
              createInstance={this.scenariiService.createConditionInstance.bind(this.scenariiService)}
              deleteInstance={this.scenariiService.deleteConditionInstance.bind(this.scenariiService)}
              testInstance={this.scenariiService.testConditionInstance.bind(this.scenariiService)}
              applyEditForm={this.applyEditForm.bind(this)}
              ref={(c) => { this._tabs[1] = c }}>
              <div className='collection-header'>
                <Icon>lightbulb_outline</Icon>
                No condition yet. You can add one choosing a condition type below.<br />
                A condition is a configured test you can use in a scenario to run an action or not.
              </div>
            </PanelList>
          </Tab>
          <Tab title={(<span><Icon>error</Icon> <span className='hide-on-small-only'>Actions</span></span>)} active={currentTab === 2}>
            <PanelList theme={theme} animationLevel={animationLevel}
              getInstances={this.scenariiService.getActionInstances.bind(this.scenariiService)}
              getTypes={this.scenariiService.getActionTypes.bind(this.scenariiService)}
              createInstance={this.scenariiService.createActionInstance.bind(this.scenariiService)}
              deleteInstance={this.scenariiService.deleteActionInstance.bind(this.scenariiService)}
              testInstance={this.scenariiService.executeActionInstance.bind(this.scenariiService)}
              applyEditForm={this.applyEditForm.bind(this)}
              ref={(c) => { this._tabs[2] = c }}>
              <div className='collection-header'>
                <Icon>lightbulb_outline</Icon>
                No action yet. You can add one choosing an action type below.<br />
                An action is a configured intent you can trigger via a button, a dashboard item or a scenario.
              </div>
            </PanelList>
          </Tab>
          <Tab title={(<span><Icon>play_circle_filled</Icon> <span className='hide-on-med-and-down'>Triggers</span></span>)} active={currentTab === 3}>
            <PanelList theme={theme} animationLevel={animationLevel}
              getInstances={this.scenariiService.getTriggerInstances.bind(this.scenariiService)}
              getTypes={this.scenariiService.getTriggerTypes.bind(this.scenariiService)}
              createInstance={this.scenariiService.createTriggerInstance.bind(this.scenariiService)}
              deleteInstance={this.scenariiService.deleteTriggerInstance.bind(this.scenariiService)}
              applyEditForm={this.applyEditForm.bind(this)}
              ref={(c) => { this._tabs[3] = c }}>
              <div className='collection-header'>
                <Icon>lightbulb_outline</Icon>
                No trigger yet. You can add one choosing a trigger type below.<br />
                A trigger is a configured event you can use in a scenario to launch the scenario.
              </div>
            </PanelList>
          </Tab>
        </Tabs>
        <div className={cx('editForm', theme.backgrounds.body)}>
          {EditForm ? (
            <EditForm ref={(c) => { this._editFormInstance = c }}
              instance={this._editInstance} services={services}
              theme={theme} animationLevel={animationLevel}
            />
          ) : null}
        </div>

        <Modal id='scenarii-persistence-error-modal'
          header='Persistence error'>
          <p>No message</p>
        </Modal>
      </div>
    )
  }

  tabChanged (href) {
    $(`#scenarii-edit-panel > div.row > div.col > ul.tabs > li.tab > a[href^='#']`).each((idx, el) => {
      if ($(el).attr('href') === `#tab_${href}`) {
        /* if (this._tabs[idx].forceUpdate) {
          this._tabs[idx].forceUpdate()
        } */
        this.setState({ currentTab: idx })
      }
    })
  }

  saveInstance (instance) {
    return instance.save()
    .catch((error) => {
      $('#scenarii-persistence-error-modal p').html(error.message)
      $('#scenarii-persistence-error-modal').modal('open')
    })
    .then(() => {
      this._tabs.forEach((tab) => !!tab && tab.forceUpdate && tab.forceUpdate())
      this._editInstance = null
      if (this.state.EditForm) {
        this.setState({
          EditForm: null
        })
      }
    })
    .then(() => true) // modal will not close now
  }

  applyEditForm (instance) {
    if (instance.EditForm) {
      // open the EditForm sliding card
      this._editInstance = instance
      this.setState({
        EditForm: instance.EditForm
      })
    } else {
      // directly save the instance, and refresh list
      this.saveInstance(instance)
    }
  }

  handleCloseButton () {
    if (!this.state.EditForm) {
      // do not handle close button event: modal will close
      return Promise.reject(false) // eslint-disable-line prefer-promise-reject-errors
    }

    // try to save first, then close editForm sliding card: modal will not close now
    if (this._editFormInstance && this._editFormInstance.handleCloseButton) {
      return this._editFormInstance.handleCloseButton()
      .then(() => this.saveInstance(this._editInstance))
    } else {
      return this.saveInstance(this._editInstance)
    }
  }
}

ScenariiEditPanel.propTypes = {
  serverStorage: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  localStorage: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired
}

ScenariiEditPanel.label = 'Scenarii'
ScenariiEditPanel.icon = 'playlist_play'
ScenariiEditPanel.hideHeader = true

ScenariiEditPanel.onReady = () => {
  $('#scenarii-edit-panel > div.row > div.col > ul.tabs').tabs()
}

export default ScenariiEditPanel
