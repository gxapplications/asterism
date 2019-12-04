'use strict'

import express from 'express'
import Path from 'path'
import cookieParser from 'cookie-parser'
import uuid from 'uuid'
import forge from 'node-forge'

const cookieSecret = uuid.v4() // statefull, random at each node boot.

export default class AuthenticationService {
  constructor (dataHandler) {
    this.dataHandler = dataHandler
    this.volatileAccessTokens = { admin: [], readOnly: [] }

    const keys = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001 })
    this.passwordEncoder = forge.pki.publicKeyToPem(keys.publicKey)
    this.passwordDecoder = keys.privateKey
  }

  pushTemporaryAccessToken (el, scope) {
    this.volatileAccessTokens[scope].push(el)
    setTimeout(() => {
      this.volatileAccessTokens[scope] = this.volatileAccessTokens[scope].filter((e) => e !== el)
    }, 360000)
  }

  isAuthenticationEnabled () {
    return this.dataHandler.getItem('security-admin') // testing admin pattern is sufficient since readOnly exists only if admin exists.
    .then((p) => !!p)
  }

  testPassword (encodedPassword) {
    try {
      let password = forge.util.decodeUtf8(this.passwordDecoder.decrypt(forge.util.hexToBytes(encodedPassword)))
      password = password.split('$')[0]
      return this.dataHandler.getItem('security-admin')
      .then((securityAdmin) => {
        if (securityAdmin && (securityAdmin.pattern === password)) {
          return 'admin'
        }

        return this.dataHandler.getItem('security-readOnly')
        .then((securityReadOnly) => {
          if (securityReadOnly && (securityReadOnly.pattern === password)) {
            return 'readOnly'
          }

          return false
        })
      })
    } catch (error) {
      console.error(error)
      return Promise.resolve(false)
    }
  }

  middlewares () {
    const redirectIfNotAuth = () => {
      const router = express.Router()
      router.use(express.urlencoded({ extended: true })) // activates x-www-form-urlencoded parsing from post
      router.use(cookieParser(cookieSecret))

      router.post('/login', (req, res, next) => {
        const encodedPassword = req.body.password

        if (!encodedPassword) {
          return next()
        }

        return this.testPassword(encodedPassword)
        .then((scope) => {
          if (!scope) {
            return next()
          }

          res.clearCookie('admin-access-token')
          res.clearCookie('readOnly-access-token')
          res.clearCookie('password-encoder')

          const accessToken = uuid.v4()
          this.pushTemporaryAccessToken(accessToken, scope)

          res.cookie(`${scope}-access-token`, accessToken, { maxAge: 360000, signed: true })
          res.redirect(decodeURIComponent(req.query.then || '/'))
        })
      })

      router.all('/login', (req, res) => {
        return this.isAuthenticationEnabled()
        .then((enabled) => {
          if (!enabled) {
            return res.redirect(decodeURIComponent(req.query.then || '/'))
          }

          res.clearCookie('admin-access-token')
          res.clearCookie('readOnly-access-token')
          res.clearCookie('password-encoder')
          res.cookie('password-encoder', this.passwordEncoder, { maxAge: 60000, signed: false })
          res.sendFile(Path.join(__dirname, '..', '..', 'assets', process.env.NODE_ENV || 'development', 'login.html'))
        })
      })

      router.all('*', (req, res, next) => {
        if (req.url.startsWith('/favicon.ico') || req.url.startsWith('/certificate/') || req.url.startsWith('/manifest.json')) {
          return next()
        }

        if (req.url.startsWith('/__webpack_hmr') || req.url.startsWith('/socket.io/')) {
          return next()
        }

        return this.isAuthenticationEnabled()
        .then((enabled) => {
          if (!enabled) {
            return next()
          }

          if (this.volatileAccessTokens['admin'].includes(req.signedCookies['admin-access-token'])) {
            return next()
          }

          if (this.volatileAccessTokens['readOnly'].includes(req.signedCookies['readOnly-access-token'])) {
            if (req.url === '/data/asterism/security-admin') {
              return res.status(403).end() // avoid admin password to be fetched when not admin scoped :)
            }
            return next()
          }

          if (req.url.startsWith('/data/') || req.url.startsWith('/data-path/')) {
            return next()
          }

          return res.redirect(`/login?then=${encodeURIComponent(req.url)}`)
        })
      })

      return router
    }

    const middlewares = {
      '/': redirectIfNotAuth()
    }

    return middlewares
  }
}
