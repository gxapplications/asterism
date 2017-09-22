'use strict'

const styles = {
  'container': {
    'padding': '0.5rem',
    'overflowX': 'hidden'
  },
  'logScroller': {
    'overflowY': 'scroll',
    'overflowX': 'hidden',
    'height': '100%',
    'display': 'flex',
    'flexDirection': 'column-reverse',
    'textAlign': 'left'
  },
  'logRow': {
    'marginTop': '4px',
    'marginBottom': '4px',
    'marginRight': '4px',
    'overflow': 'initial'
  },
  'logRowInset': {
    'display': 'block',
    'backgroundColor': 'rgba(255, 255, 255, 0.75)',
    'cursor': 'pointer',
    'color': 'rgba(0, 0, 0, 0.8)'
  },
  'logLevel': (theme) => [
    { 'borderLeft': `3px solid ${theme.palette[theme.feedbacks.progressing]}`, 'backgroundColor': theme.palette[theme.feedbacks.progressing] },
    { 'borderLeft': `3px solid ${theme.palette[theme.feedbacks.success]}`, 'backgroundColor': theme.palette[theme.feedbacks.success] },
    { 'borderLeft': `3px solid ${theme.palette[theme.feedbacks.warning]}`, 'backgroundColor': theme.palette[theme.feedbacks.warning] },
    { 'borderLeft': `3px solid ${theme.palette[theme.feedbacks.error]}`, 'backgroundColor': theme.palette[theme.feedbacks.error] }
  ]
}

export default styles
