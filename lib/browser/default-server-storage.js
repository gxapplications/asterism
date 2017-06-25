'use strict'

/* global fetch */

const handleJsonResponse = (res) => {
  if (!res.ok) {
    return Promise.reject({ // eslint-disable-line prefer-promise-reject-errors
      status: res.status,
      statusText: res.statusText,
      url: res.url
    })
  }

  return res.json()
  .catch((error) => {
    if (error.message === 'Unexpected end of JSON input') {
      return Promise.resolve('') // no body in response.
    }

    const contentType = res.headers.get('content-type')
    if (!contentType || contentType.indexOf('application/json') === -1) {
      throw new Error(`No JSON received from ${res.url}`)
    }
  })
}

class DefaultServerStorage {
  constructor (prefix) {
    this.prefix = prefix
    const location = window.document.location
    this.baseUrl = `${location.protocol}//${location.host}`
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  getItem (keyName) {
    return fetch(`${this.baseUrl}/data/${this.prefix}§§${keyName}`, { method: 'GET', headers: this.headers })
    .then(handleJsonResponse)
  }

  setItem (keyName, value) {
    return fetch(`${this.baseUrl}/data/${this.prefix}§§${keyName}`, { method: 'PUT', headers: this.headers, body: JSON.stringify(value) })
    .then(handleJsonResponse)
  }

  removeItem (keyName) {
    return fetch(`${this.baseUrl}/data/${this.prefix}§§${keyName}`, { method: 'DELETE', headers: this.headers })
    .then(handleJsonResponse)
  }

  createSubStorage (prefix) {
    return new DefaultServerStorage(`${this.prefix}_${prefix}`)
  }
}

export default DefaultServerStorage
