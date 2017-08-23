'use strict'

/* global $ */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Icon } from 'react-materialize'

import ItemSettingPanel from '../../plugins/item-setting-panel'
import { thenSleep } from '../tools'

const categories = [
  {
    id: 'domotics',
    title: 'Domotics',
    icon: 'touch_app',
    condition: true,
    additionalItems: []
  },
  {
    id: 'security',
    title: 'Security & access',
    icon: 'notifications_active',
    condition: true,
    additionalItems: []
  },
  {
    id: 'screening',
    title: 'Screening & safety',
    icon: 'videocam',
    condition: true,
    additionalItems: []
  },
  {
    id: 'communication',
    title: 'Communication',
    icon: 'question_answer',
    condition: true,
    additionalItems: []
  },
  {
    id: 'information',
    title: 'Information',
    icon: 'info',
    condition: true,
    additionalItems: []
  },
  {
    id: 'development',
    title: 'Dev tools',
    icon: 'bug_report',
    condition: (process.env.NODE_ENV !== 'production'),
    className: 'purple white-text',
    additionalItems: [
      {
        title: 'Debug log',
        isNew: true
      },
      {
        title: 'Other old thing'
      }
    ]
  }
]

class AddCategoryButtons extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      clazz: '',
      modal: null
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

  componentDidUpdate () {
    const { animationLevel } = this.props
    if (this.state.modal) {
      const bullet = $('#category-modal-bullet')

      $('#category-modal').modal({
        dismissible: true,
        opacity: 0.5,
        inDuration: animationLevel >= 2 ? 300 : 0,
        outDuration: animationLevel >= 2 ? 300 : 0,
        startingTop: bullet.css('top'),
        endingTop: '10%',
        // ready: function(modal, trigger) { },
        complete: () => {
          this.setState({
            modal: null
          })
        }
      })

      if (this.props.animationLevel >= 3) {
        const screenHeight = $(window).height()
        const headerTop = (screenHeight * 0.1) + 24
        const bullet = $('#category-modal-bullet')
        const ripple = $('#category-modal .ripple')

        bullet.show({ queue: true }).css({ top: headerTop, left: '50%', transform: 'scale(1.8)' }).hide({ queue: true, duration: 0 })
        $('#category-modal').modal('open')

        $('.fixed-action-btn.vertical.active').closeFAB()
        ripple.addClass('rippleEffect')
      } else {
        $('#category-modal').modal('open')
        $('.fixed-action-btn.vertical.active').closeFAB()
      }
    }
  }

  categorySelect (category, event) {
    const buttonCoords = $(event.nativeEvent.target).offset()
    const bullet = $('#category-modal-bullet')
    bullet.css({ top: buttonCoords.top, left: buttonCoords.left, transform: 'scale(1)' })

    this.setState({
      modal: category
    })
  }

  additionalItemSelect (additionalItem) {
    $('#category-modal').modal('close')
    additionalItem.instantiateNewItem(this.props.itemManager.settingPanelClosed)
    .then(thenSleep(500)) // wait for modal to close
    .then((settingOrItem) => {
      if (settingOrItem instanceof ItemSettingPanel) {
        // initial setting panel before to render the item
        this.mainComponent.setState({ itemSettingPanel: settingOrItem })
        // TODO !4: animation from clicked button to setting panel ?
      } else {
        // item can be added directly
        const { id, item, preferredHeight, preferredWidth, settingPanel } = settingOrItem
        this.props.itemManager.addNewItem(id, item, preferredHeight, preferredWidth, settingPanel)
        // TODO !4: animation from clicked button to the new item in the grid ?
      }
    })
  }

  render () {
    const { theme, animationLevel, itemFactories } = this.props
    const { modal, clazz } = this.state
    const waves = animationLevel >= 2 ? 'light' : undefined
    const modalCategory = modal ? categories.find((i) => i.id === modal) : null

    categories.forEach((category) => { category.additionalItems = [] }) // reset items
    itemFactories.forEach((factory) => {
      categories.forEach((category) => {
        category.additionalItems = category.additionalItems.concat(factory.getAdditionalItems(category.id))
      })
    })

    return (
      <div>
        {modal ? (
          <div id='category-modal' className={cx('modal modal-fixed-footer', theme.backgrounds.body)}>
            <div className='modal-content'>
              <div className={cx('coloring-header', { [modalCategory.className || theme.backgrounds.card]: animationLevel < 3 })}>
                {animationLevel >= 3 ? (<div className={cx('ripple', modalCategory.className || theme.backgrounds.card)} />) : null}
                <div className={animationLevel >= 3 && (modalCategory.className || theme.backgrounds.card).endsWith('white-text') ? 'white-text' : null}>
                  <h4>
                    <Icon small>{modalCategory.icon}</Icon>
                    {modalCategory.title}
                  </h4>
                </div>
              </div>
              <div className='collection additional-items-list'>
                {modalCategory.additionalItems.map((item, idx) => (
                  <a className='collection-item avatar lighter-background waves-effect waves-light' key={idx} href='#'
                    onClick={this.additionalItemSelect.bind(this, item)}>
                    <Icon className='circle'>{item.icon || modalCategory.icon}</Icon>
                    <h4 className='title'>{item.name}</h4>
                    <p>{item.description}</p>
                    <div className='secondary-content'><Icon circle>insert_chart</Icon> TODO</div>
                  </a>
                ))}
              </div>
            </div>
            <div className={cx('modal-footer', theme.backgrounds.body)}>
              <a href='#!' className='modal-action modal-close waves-effect waves-light btn-flat'>Close</a>
            </div>
          </div>
        ) : null}

        {animationLevel >= 3 ? (
          <div id='category-modal-bullet' className={cx('btn-floating', (modalCategory && modalCategory.className) || theme.backgrounds.card)} />
        ) : null}

        <Button large floating fab='vertical' icon='add_box' waves={waves} className={cx(theme.actions.edition, clazz)}>
          {Array.from(categories).reverse().map((value, idx) => (
            value.condition ? (
              <Button key={idx}
                floating icon={value.icon} waves={waves}
                className={cx(value.className || theme.actions.secondary, { pulse: value.additionalItems.find((i) => i.isNew) })}
                onClick={this.categorySelect.bind(this, value.id)}
              />
            ) : null
          ))}
        </Button>
      </div>
    )
  }
}

AddCategoryButtons.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  itemManager: PropTypes.object.isRequired,
  itemFactories: PropTypes.array
}

AddCategoryButtons.defaultTypes = {
  itemFactories: []
}

export default AddCategoryButtons
