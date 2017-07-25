'use strict'

/* global fetch */

const handleJsonResponse = (res) => {
  const contentType = res.headers.get('content-type')
  if (!contentType || contentType.indexOf('application/json') === -1) {
    throw new Error(`No JSON received from ${res.url}`)
  }
  if (!res.ok) {
    return res.json()
    .then((error) => {
      return Promise.reject({
        error,
        status: res.status,
        statusText: res.statusText,
        url: res.url
      })
    })
  }
  return res.json()
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
    return fetch(`${this.baseUrl}/data/${keyName}`, { method: 'GET', headers: this.headers })
    .then(handleJsonResponse)
  }

  setItem (keyName, value) {
    return fetch(`${this.baseUrl}/data/${keyName}`, { method: 'PUT', headers: this.headers, body: JSON.stringify(value) })
    .then(handleJsonResponse)
  }

  removeItem (keyName) {
    return fetch(`${this.baseUrl}/data/${keyName}`, { method: 'DELETE', headers: this.headers })
    .then(handleJsonResponse)
  }
}

export default DefaultServerStorage
