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
    this.currentPath = location.pathname
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  getItem (keyName) {
    return this.fetchJson(`/data/${this.prefix}/${keyName}`, { method: 'GET' })
  }

  setItem (keyName, value) {
    return this.fetchJson(`/data/${this.prefix}/${keyName}`, { method: 'PUT', body: JSON.stringify(value) })
  }

  removeItem (keyName) {
    return this.fetchJson(`/data/${this.prefix}/${keyName}`, { method: 'DELETE' })
  }

  getItemForPath (keyName) {
    return this.fetchJson(
      `/data-path/${this.prefix}/${keyName.replace(/\//g, '@')}/${this.currentPath}`,
      { method: 'GET' }
    )
  }

  setItemForPath (keyName, value) {
    return this.fetchJson(
      `/data-path/${this.prefix}/${keyName.replace(/\//g, '@')}/${this.currentPath}`,
      { method: 'PUT', body: JSON.stringify(value) }
    )
  }

  removeItemForPath (keyName) {
    return this.fetchJson(
      `/data-path/${this.prefix}/${keyName.replace(/\//g, '@')}/${this.currentPath}`,
      { method: 'DELETE' }
    )
  }

  fetchJson (path, options) {
    return fetch(`${this.baseUrl}${path}`, { headers: this.headers, ...options })
    .then(handleJsonResponse)
  }

  createSubStorage (prefix) {
    return new DefaultServerStorage(`${this.prefix}_${prefix}`)
  }
}

export default DefaultServerStorage
