'use strict'

import React from 'react'
import { render } from 'react-dom'

import { MainComponent } from '../lib/main-component.jsx'

import './example.css'

class App extends React.Component {
  render () {
    return (
      <div>
        <MainComponent />
      </div>
    )
  }
}

render(<App />, document.getElementById('app'))
