'use strict'

import NoSQL from 'nosql'
import Path from 'path'

const _db = NoSQL.load(Path.resolve('.', 'var', 'db.nosql'))

export default class DataHandler {
  constructor (prefix, logger) {
    this.prefix = prefix
    this.logger = logger
    this.db = _db
  }

  getItem (keyName, forcePrefix, path) {
    return new Promise((resolve, reject) => {
      this.db.find().make((builder) => {
        builder
        .first()
        .and()
          .where('prefix', forcePrefix || this.prefix)
          .where('keyName', keyName)
          .where('path', path || false)
        .end()
        .callback((err, result) => {
          if (err) {
            this.logger.error('DATA GET ERROR', err)
            return reject(err)
          }

          if (result && result.select !== Date.now()) {
            this.db.modify({ select: Date.now() }).make((builder) => {
              builder
              .first()
              .and()
                .where('prefix', forcePrefix || this.prefix)
                .where('keyName', keyName)
                .where('path', path || false)
              .end()
              .callback((err, count) => {
                if (err) {
                  this.logger.error('DATA TOUCH ERROR', err)
                }
              })
            })
          }

          return resolve((result && result.item) || undefined)
        })
      })
    })
  }

  setItem (keyName, value, forcePrefix, path = false) {
    if (value === undefined) {
      return this.removeItem(keyName, forcePrefix, path)
    } else {
      return new Promise((resolve, reject) => {
        const toUpdate = { item: value, prefix: forcePrefix || this.prefix, keyName, path, update: Date.now(), select: Date.now() }
        const toInsert = { ...toUpdate, creation: Date.now() }
        this.db.modify(toUpdate, toInsert).make((builder) => {
          builder
          .first()
          .and()
            .where('prefix', forcePrefix || this.prefix)
            .where('keyName', keyName)
            .where('path', path || false)
          .end()
          .callback((err, count) => {
            if (err) {
              this.logger.error('DATA PUT ERROR', err)
              return reject(err)
            }
            return resolve(count === 1)
          })
        })
      })
    }
  }

  removeItem (keyName, forcePrefix, path) {
    return new Promise((resolve, reject) => {
      this.db.remove().make((builder) => {
        builder
        .first()
        .and()
          .where('prefix', forcePrefix || this.prefix)
          .where('keyName', keyName)
          .where('path', path || false)
        .end()
        .callback((err, count) => {
          if (err) {
            this.logger.error('DATA DELETE ERROR', err)
            return reject(err)
          }
          return resolve(count === 1)
        })
      })
    })
  }

  listItems (filter, forcePrefix, path) {
    return new Promise((resolve, reject) => {
      this.db.find().make((builder) => {
        builder = builder
        .and()
          .where('prefix', forcePrefix || this.prefix)
          .where('path', path || false)
          .filter(filter)
        .end()
        .callback((err, result) => {
          if (err) {
            this.logger.error('DATA GET ERROR', err)
            return reject(err)
          }

          return resolve(result || [])
        })
      })
    })
  }

  createSubStorage (prefix) {
    return new DataHandler(`${this.prefix}_${prefix}`, this.logger)
  }
}
