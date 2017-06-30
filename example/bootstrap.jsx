'use strict'

import React from 'react'
import { render } from 'react-dom'

import { MainComponent } from '../lib/browser/main-component.jsx'

import './example.css'

render(<MainComponent />, document.getElementById('app'))
