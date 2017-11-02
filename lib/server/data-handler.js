'use strict'

import NoSQL from 'nosql'
import Path from 'path'

const _db = NoSQL.load(Path.resolve('.', 'var', 'db.nosql'))

export default class DataHandler {
  constructor (prefix, logger) {
    this.prefix = prefix
    this.logger = logger
    this.db = _db

    /*
    this.db.on('insert', (doc) => {
      this.logger.log('NOSQL INSERT', doc)
    })
    this.db.on('modify', (doc) => {
      this.logger.log('NOSQL MODIFIY', doc)
    })
    this.db.on('remove', (doc) => {
      this.logger.log('NOSQL REMOVE', doc)
    })
    this.db.on('update', (doc) => {
      this.logger.log('NOSQL UPDATE', doc)
    })
    */
  }

  getItem (keyName) {
    return new Promise((resolve, reject) => {
      this.db.find().make((builder) => {
        builder
        .first()
        .and()
          .where('prefix', this.prefix)
          .where('keyName', keyName)
        .end()
        .callback((err, result) => {
          if (err) {
            this.logger.error('DATA GET ERROR', err)
            return reject(err)
          }
          this.logger.log(`DATA GET on ${this.prefix}§§${keyName}`, result)

          if (result && result.select !== Date.now()) {
            this.db.modify({ select: Date.now() }).make((builder) => {
              builder
              .first()
              .and()
                .where('prefix', this.prefix)
                .where('keyName', keyName)
              .end()
              .callback((err, count) => {
                if (err) {
                  this.logger.error('DATA TOUCH ERROR', err)
                }
                this.logger.log(`DATA TOUCH on ${this.prefix}§§${keyName}`)
              })
            })
          }

          return resolve((result && result.item) || undefined)
        })
      })
    })
  }

  setItem (keyName, value) {
    if (value === undefined) {
      return this.removeItem(keyName)
    } else {
      return new Promise((resolve, reject) => {
        const toUpdate = { item: value, prefix: this.prefix, keyName, update: Date.now(), select: Date.now() }
        const toInsert = { ...toUpdate, creation: Date.now() }
        this.db.modify(toUpdate, toInsert).make((builder) => {
          builder
          .first()
          .and()
            .where('prefix', this.prefix)
            .where('keyName', keyName)
          .end()
          .callback((err, count) => {
            if (err) {
              this.logger.error('DATA PUT ERROR', err)
              return reject(err)
            }
            this.logger.log(`DATA PUT on ${this.prefix}§§${keyName}`, value)
            return resolve(count === 1)
          })
        })
      })
    }
  }

  removeItem (keyName) {
    return new Promise((resolve, reject) => {
      this.db.remove().make((builder) => {
        builder
        .first()
        .and()
          .where('prefix', this.prefix)
          .where('keyName', keyName)
        .end()
        .callback((err, count) => {
          if (err) {
            this.logger.error('DATA DELETE ERROR', err)
            return reject(err)
          }
          this.logger.log(`DATA DELETE on ${this.prefix}§§${keyName}`, count)
          return resolve(count === 1)
        })
      })
    })
  }

  createSubStorage (prefix) {
    return new DataHandler(`${this.prefix}_${prefix}`, this.logger)
  }
}
