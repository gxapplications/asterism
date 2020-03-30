'use strict'

const sleep = function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const thenSleep = function thenSleep (ms) {
  return (res) => {
    return new Promise((resolve) => setTimeout(() => resolve(res), ms))
  }
}

const hasCookie = function hasCookie (name) {
  var value = '; ' + window.document.cookie
  var parts = value.split('; ' + name + '=')
  return (parts.length === 2)
}

const deleteCookie = function deleteCookie (name) {
  window.document.cookie = name + '=; Max-Age=-99999999;'
}

export { sleep, thenSleep, hasCookie, deleteCookie }
