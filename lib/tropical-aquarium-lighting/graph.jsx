'use strict'

import Chart from 'chart.js'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Row, Select } from 'react-materialize'

import AstralData from './astral-data'

class LightingGraph extends React.Component {
  constructor(props) {
    super(props)
    this._id = 42 // TODO: props

    this.latitude = 48.842205 // TODO: props
    this.longitude = 2.69802 // TODO: props
    this.astralData = new AstralData(this.latitude, this.longitude, 0)
    this.useMoon = true // TODO: props

    this.state = {
      date: new Date('2022-06-01'),
      sunNormalizationRate: 0.6, // TODO: state
      useMoonFraction: true, // TODO: state
      minBlueRate: 0.03, // TODO: state
      maxRedRatio: 0.25, // TODO: state
      minRedRatio: 0.15, // TODO: state
      redMainFactor: 1, // TODO: state
      blueMainFactor: this.useMoon ? 1.3 : 0, // TODO: state
      whiteMainFactor: 1, // TODO: state
    }

    this._chart = null
    this._mounted = false
  }

  componentDidMount () {
    this._mounted = true
    this.updateChart()
  }

  componentWillUnmount () {
    this._mounted = false
    if (this._chart) {
      this._chart.destroy()
    }
  }

  render () {
    const { date } = this.state

    return (
      <div className='lightingGraph'>
        {this.useMoon && (<div>Fraction lune: {Math.round(this.astralData.getMoonFraction(date) * 100)}%</div>)}

        START
        <canvas id={`lighting-chart-${this._id}`} className='chart'/>
        END
      </div>
    )
  }

  updateChart () {
    const { date } = this.state
    if (this._chart) {
      this._chart.destroy()
    }

    const sunAltitudes = this.astralData.getDatesSeries(60, date)
      .map((x) => ({ x: x.getTime(), y: Math.max(-1, this.astralData.getSunAltitude(x)) }))
      .filter(({y}) => y >= 0)

    const moonAltitudes = this.astralData.getDatesSeries(60, date)
      .map((x) => ({ x: x.getTime(), y: Math.max(-1, this.astralData.getMoonAltitude(x)) }))
      .filter(({y}) => y >= 0)

    const moments = [
      { x: this.astralData.getSunRiseTime(date).getTime(), y: 0.5, label: 'Sunrise' },
      { x: this.astralData.getSunsetTime(date).getTime(), y: 0.5, label: 'Sunset' },
      { x: this.astralData.getNightTime(date).getTime(), y: 0.5, label: 'Night' },
      { x: this.astralData.getNightEndTime(date).getTime(), y: 0.5, label: 'Night end' },
    ]

    const lights = this.astralData.getDatesSeries(15, date)
        .map((x) => ({ x: x.getTime(), values: this.astralData.getLights(x, this.state) }))

    const redLight = lights.map(({ x, values }) => ({ x, y: values.red }))
    const blueLight = lights.map(({ x, values }) => ({ x, y: values.blue }))
    const whiteLight = lights.map(({ x, values }) => ({ x, y: values.white }))

    // http://www.chartjs.org/docs/latest

    const element = document.getElementById(`lighting-chart-${this._id}`)
    if (element) {
      const ctx = element.getContext('2d')
      this._chart = new Chart(ctx, {
        data: {
          datasets: [
            {
              type: 'line',
              data: sunAltitudes,
              borderColor: '#ff9922',
              pointStyle: 'star',
              radius: 7,
              fill: false,
              showLine: false,
              yAxisID: 'astral',
            },
            { // TODO !1: hide if !this.useMoon
              type: 'line',
              data: moonAltitudes,
              borderColor: '#77aaff',
              pointStyle: 'circle',
              radius: 4,
              fill: false,
              showLine: false,
              yAxisID: 'astral',
            },
            {
              type: 'bar',
              data: moments,
              backgroundColor: '#333',
              borderWidth: 0,
              barThickness: 1,
              fill: false,
              yAxisID: 'astral',
            },
            {
              type: 'line',
              data: redLight,
              borderColor: '#ff1111',
              radius: 0,
              fill: false,
              yAxisID: 'lights',
            },
            { // TODO !1: hide if !this.useMoon
              type: 'line',
              data: blueLight,
              borderColor: '#3366bb',
              radius: 0,
              fill: false,
              yAxisID: 'lights',
            },
            {
              type: 'line',
              data: whiteLight,
              borderColor: '#eeeebb',
              radius: 0,
              fill: false,
              yAxisID: 'lights',
            },
          ]
        },
        options: {
          legend: { display: false },
          tooltips: { enabled: false },
          parsing: false,
          scales: {
            y: {
              suggestedMin: 0,
              suggestedMax: 1.6,
              min: 0,
              max: 1.6,
            },
            yAxes: [
              {
                id: 'astral',
                display: false,
                beginAtZero: true,
                ticks: {
                  suggestedMax: 1.6 // min amplitude for y
                },
                suggestedMin: 0,
                suggestedMax: 1.6,
                min: 0,
                max: 1.6,
              },
              {
                id: 'lights',
                display: true,
                beginAtZero: true,
                ticks: {
                  callback: (value) => ((value * 100) + '%'),
                  suggestedMax: 1 // min amplitude for y
                },
                suggestedMin: 0,
                suggestedMax: 1,
                min: 0,
                max: 1,
              }
            ],
            xAxes: [{
              type: 'time',
              display: true,
              time: {
                unit: 'hour',
                displayFormats: {
                  hour: 'H'
                }
              },
              min: 1673222400000,  // TODO !1: what is this ?
              max: 1673308800000,
            }]
          },
          layout: {
            padding: 5
          },
          animation: {
            duration: 0
          },
          hover: {
            animationDuration: 0
          },
          responsiveAnimationDuration: 0,
          responsive: true,
          maintainAspectRatio: false,
          plugins: { crosshair: false }
        }
      })
    }
  }
}

export default LightingGraph
