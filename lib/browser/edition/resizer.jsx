'use strict'

/* global $ */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal } from 'react-materialize'

class Resizer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: { w: props.initialWidth, h: props.initialHeight }
    }
  }

  componentDidMount () {
    const theme = this.props.mainComponent.props.theme
    $('.modal[id^="resizer-"]').addClass(theme.backgrounds.body)
  }

  render () {
    const { itemId } = this.props
    const { selected } = this.state
    const theme = this.props.mainComponent.props.theme
    const animationLevel = this.props.mainComponent.state.animationLevel

    const bgColorHex = theme.palette[theme.backgrounds.highlight]
    const backgroundColor = (w, h) => {
      if (w === selected.w && h === selected.h) {
        return { backgroundColor: bgColorHex, opacity: 0.7 }
      }
      if (w <= selected.w && h <= selected.h) {
        return { backgroundColor: bgColorHex, opacity: 0.4 }
      }
      return { }
    }

    return (
      <Modal id={`resizer-${itemId.substr(-36)}`} header='Size'>
        <div className='resizer'>
          <table className='background'>
            <tbody>
              {[1, 2, 3, 4, 5].map((h) => (
                <tr key={`0-${h}`}>
                  {[1, 2, 3].map((w) => (
                    <td key={`${w}-${h}`}><div style={backgroundColor(w, h)} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <tbody>
              {[1, 2, 3, 4, 5].map((h) => (
                <tr key={`0-${h}`}>
                  {[1, 2, 3].map((w) => (
                    <td key={`${w}-${h}`}>
                      <button
                        className={cx('btn btn-floating btn-small',
                          animationLevel >= 2 ? 'waves-effect waves-light' : '',
                          { disabled: !this.isDimensionAvailable(w, h) }
                        )}
                        onClick={this.selectSize.bind(this, w, h)}
                      >
                        {w}-{h}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    )
  }

  isDimensionAvailable (w, h) {
    const search = (this.props.acceptedDimensions || []).find((dimension) => dimension.w === w && dimension.h === h)
    return !!search
  }

  selectSize (w, h) {
    if (!this.isDimensionAvailable(w, h)) {
      return
    }
    this.setState({ selected: { w, h } })
    $(`#resizer-${this.props.itemId.substr(-36)}`).modal('close')
    this.props.mainComponent.itemManager.resizeItem(this.props.itemId, h, w)
  }
}

Resizer.propTypes = {
  itemId: PropTypes.string.isRequired,
  mainComponent: PropTypes.object.isRequired,
  initialHeight: PropTypes.number.isRequired,
  initialWidth: PropTypes.number.isRequired,
  acceptedDimensions: PropTypes.array.isRequired
}

export default Resizer
