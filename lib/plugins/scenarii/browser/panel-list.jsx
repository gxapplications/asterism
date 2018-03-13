'use strict'

/* global $ */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'

class PanelList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      instances: null, // is dynamic, can be refreshed
      types: [], // should be static, no refresh provided
      deleteConfirm: null
    }

    this._mounted = false
    this._deleteTimer = null
  }

  editInstance (instance) {
    this.props.applyEditForm(instance)
  }

  componentDidMount () {
    this._mounted = true
    this.props.getTypes().then((types) => {
      this.setState({ types: types.map((type) => {
        return {
          type: type.type,
          onClick: () => {
            return this.props.createInstance(type.id)
            .then(this.editInstance.bind(this))
          }
        }
      })})
    })
    .then(() => this.forceUpdate())
  }

  componentWillUnmount () {
    this._mounted = false
  }

  forceUpdate () {
    if (!this._mounted) {
      return Promise.resolve(true)
    }

    this.props.getInstances().then((instances) => {
      if (this._mounted) {
        this.setState({
          instances: instances.map((instance) => ({
            instance: instance,
            onClick: () => {
              if (instance.EditForm) {
                this.editInstance(instance)
              }
            },
            onDelete: (event) => {
              event.stopPropagation()
              if (this.state.deleteConfirm === instance) {
                clearTimeout(this._deleteTimer)
                this.props.deleteInstance(instance)
                .catch((error) => {
                  $('#scenarii-persistence-error-modal p').html(error.message)
                  $('#scenarii-persistence-error-modal').modal('open')
                })
                .then(() => {
                  this.forceUpdate()
                })
                this.setState({ deleteConfirm: null })
              } else {
                this.setState({ deleteConfirm: instance })
                clearTimeout(this._deleteTimer)
                this._deleteTimer = setTimeout(() => {
                  if (this._mounted) {
                    this.setState({ deleteConfirm: null })
                  }
                }, 3000)
              }
            },
            testing: null, // null: not testing, undefined: testing, true: tested and succeed, false: tested and failed
            onTest: this.props.testInstance ? (event) => {
              event.stopPropagation()

              this.setState({ instances: this.state.instances.map((i) => {
                if (i.instance === instance) {
                  i.testing = undefined
                }
                return i
              }) })

              this.props.testInstance(instance)
              .catch(() => false)
              .then((success) => {
                if (this._mounted) {
                  this.setState({
                    instances: this.state.instances.map((i) => {
                      if (i.instance === instance) {
                        i.testing = success
                      }
                      return i
                    })
                  })

                  setTimeout(() => {
                    if (this._mounted) {
                      this.setState({
                        instances: this.state.instances.map((i) => {
                          if (i.instance === instance) {
                            i.testing = null
                          }
                          return i
                        })
                      })
                    }
                  }, 2000)
                }
              })
            } : null
          }))
        })
      }
      // super.forceUpdate() // seems not useful as setState will trigger a new render
    })
  }

  render () {
    const { instances, types, deleteConfirm } = this.state
    const { animationLevel, theme } = this.props
    const waves = animationLevel >= 2 ? 'waves-effect waves-light' : undefined
    const deleteWaves = animationLevel >= 2 ? 'btn-flat waves-effect waves-red' : 'btn-flat'
    const deleteWavesConfirm = (animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${theme.actions.negative}`
    const testingWaves = (animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${theme.actions.inconspicuous}`
    const testingWavesPositive = (animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${theme.feedbacks.success}`
    const testingWavesNegative = (animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${theme.feedbacks.error}`

    if (instances === null || types.length === 0) {
      return (<div />)
    }

    return (
      <div className={cx('collection', { 'with-header': instances.length === 0 })}>
        {instances.length === 0 ? this.props.children : null}
        {instances.map(({ instance, onClick, onDelete, onTest, testing }, idx) => instance ? (
          <a key={instance.instanceId} href='javascript:void(0)' onClick={onClick}
            className={cx('collection-item', waves)}>
            <div onClick={onDelete}
              className={cx('secondary-content', (deleteConfirm === instance) ? deleteWavesConfirm : deleteWaves)}>
              <i className='material-icons'>delete</i>
            </div>
            {onTest ? (
              <div href='javascript:void(0)' onClick={onTest}
                className={cx(
                  'secondary-content',
                  testing === true ? testingWavesPositive : (testing === false ? testingWavesNegative : (testing === undefined ? testingWaves : `btn-flat ${waves}`))
                )}>
                <i className='material-icons'>play_arrow</i>
              </div>
            ) : null}
            <span className='title truncate'>{instance.name}</span>
            <span className='truncate'>{instance.shortLabel}</span>
          </a>
        ) : null)}
        {types.map(({ type, onClick }, idx) => (
          <a key={type.name} href='javascript:void(0)' onClick={onClick}
            className={cx('collection-item active avatar', waves)}>
            <i className='material-icons circle'>add</i>
            <span className='title truncate'>{type.shortLabel || type.fullLabel || type.name}</span>
            {(type.shortLabel && type.fullLabel) ? (
              <span>{type.fullLabel}</span>
            ) : null}
          </a>
        ))}
      </div>
    )
  }
}

PanelList.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  getInstances: PropTypes.func.isRequired,
  getTypes: PropTypes.func.isRequired,
  createInstance: PropTypes.func.isRequired,
  deleteInstance: PropTypes.func.isRequired,
  testInstance: PropTypes.func,
  applyEditForm: PropTypes.func.isRequired
}

PanelList.defaultProps = {
  testInstance: null
}

export default PanelList
