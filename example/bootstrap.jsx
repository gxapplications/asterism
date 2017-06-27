'use strict'

import React from 'react'
import { render } from 'react-dom'

import { Asterism } from '../lib/index.jsx'

import './example.css'

class App extends React.Component {
  render () {
    return (
      <div>
        <Asterism />
      </div>
    )
  }
}

render(<App />, document.getElementById('app'))
