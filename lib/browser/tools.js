'use strict'

const sleep = function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const thenSleep = function thenSleep (ms) {
  return (res) => {
    return new Promise((resolve) => setTimeout(() => resolve(res), ms))
  }
}

export { sleep, thenSleep }
