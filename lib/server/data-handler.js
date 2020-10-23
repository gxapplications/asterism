'use strict'

import NoSQL from 'nosql'
import Path from 'path'

const _dbs = []

export default class DataHandler {
  constructor (prefix, logger) {
    this.prefix = prefix
    this.logger = logger

    if (!_dbs[prefix]) {
      _dbs[prefix] = NoSQL.load(Path.resolve('.', 'var', prefix + '.nosql'))
    }
    this.db = _dbs[prefix]
  }

  getItem (keyName, forcePrefix, path) {
    const db = forcePrefix ? _dbs[forcePrefix] : this.db
    return new Promise((resolve, reject) => {
      db.find().make((builder) => {
        builder
          .first()
          .and()
          .where('keyName', keyName)
          .where('path', path || false)
          .end()
          .callback((err, result) => {
            if (err) {
              this.logger.error('DATA GET ERROR', err)
              return reject(err)
            }

            if (result && result.select !== Date.now()) {
              db.modify({ select: Date.now() }).make((builder) => {
                builder
                  .first()
                  .and()
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
      const db = forcePrefix ? _dbs[forcePrefix] : this.db
      return new Promise((resolve, reject) => {
        const toUpdate = { item: value, keyName, path, update: Date.now(), select: Date.now() }
        const toInsert = { ...toUpdate, creation: Date.now() }
        db.modify(toUpdate, toInsert).make((builder) => {
          builder
            .first()
            .and()
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
    const db = forcePrefix ? _dbs[forcePrefix] : this.db
    return new Promise((resolve, reject) => {
      db.remove().make((builder) => {
        builder
          .first()
          .and()
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
    const db = forcePrefix ? _dbs[forcePrefix] : this.db
    return new Promise((resolve, reject) => {
      db.find().make((builder) => {
        builder = builder
          .and()
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

  getLastItemByT (quantity = 1, forcePrefix) {
    const db = forcePrefix ? _dbs[forcePrefix] : this.db
    return new Promise((resolve, reject) => {
      db.find().make((builder) => {
        builder
          .sort('t', true) // t, DESC (so, most recent one first)
          .skip(0)
          .take(+quantity)
          .callback((err, result) => {
            if (err) {
              this.logger.error('DATA GET ERROR', err)
              return reject(err)
            }

            return resolve(result || undefined)
          })
      })
    })
  }

  getItemsAfterDate (timestamp = Date.now() - (24 * 3600000), forcePrefix, fields = null, limit = 100) {
    const db = forcePrefix ? _dbs[forcePrefix] : this.db
    return new Promise((resolve, reject) => {
      db.find().make((builder) => {
        if (fields && fields.length) {
          builder = builder.fields(...fields, 't')
        }
        builder
          .sort('t', true) // t, DESC (so, most recent one first)
          .where('t', '>=', timestamp)
          .take(+limit || 100)
          .callback((err, result) => {
            if (err) {
              this.logger.error('DATA GET ERROR', err)
              return reject(err)
            }

            // reverse, to have less recent one first
            return resolve(result.reverse() || undefined)
          })
      })
    })
  }

  createSubStorage (prefix) {
    return new DataHandler(`${this.prefix}_${prefix}`, this.logger)
  }
}
