'use strict'

import express from 'express'
import Path from 'path'
import cookieParser from 'cookie-parser'
import uuid from 'uuid'

const cookieSecret = uuid.v4() // statefull, random at each node boot.

export default class AuthenticationService {
  constructor () {
    this.volatileAccessTokens = []
    this.passwordEncoder = 'my-encoder' // TODO !0: cle d'encryptage asymetrique, a mettre au demarrage aussi
    this.passwordDecoder = 'my-decoder' // TODO !0: cle de decryptage asymetrique, a mettre au demarrage, couplée à passwordEncoder
  }

  pushTemporaryAccessToken (el) {
    this.volatileAccessTokens.push(el)
    setTimeout(() => {
      this.volatileAccessTokens = this.volatileAccessTokens.filter((e) => e !== el)
    }, 360000)
  }

  get isAuthenticationEnabled () {
    return true // TODO !0: only if there is a password set in db
  }

  testPassword (encodedPassword) {
    console.log('###e', encodedPassword)
    return true // TODO !0: decode it with this.passwordDecoder, then test if matches the one in database
  }

  middlewares () {
    const redirectIfNotAuth = () => {
      const router = express.Router()
      router.use(express.urlencoded({ extended: true })) // activates x-www-form-urlencoded parsing from post
      router.use(cookieParser(cookieSecret))

      router.post('/login', (req, res, next) => {
        const encodedPassword = req.body.password
        const login = req.body.login

        if (!login || !encodedPassword) {
          return next()
        }

        if (!this.testPassword(encodedPassword)) {
          return next()
        }

        res.clearCookie('volatile-access-token')
        res.clearCookie('password-encoder')

        const accessToken = uuid.v4()
        this.pushTemporaryAccessToken(accessToken)

        res.cookie('volatile-access-token', accessToken, { maxAge: 360000, signed: true })
        res.redirect(decodeURIComponent(req.query.then || '/'))
      })

      router.all('/login', (req, res) => {
        res.clearCookie('volatile-access-token')
        res.clearCookie('password-encoder')
        res.cookie('password-encoder', this.passwordEncoder, { maxAge: 60000, signed: true })
        res.sendFile(Path.join(__dirname, '..', '..', 'assets', process.env.NODE_ENV || 'development', 'login.html'))
      })

      router.all('*', (req, res, next) => {
        if (req.url.startsWith('/favicon.ico') || req.url.startsWith('/certificate/')) {
          return next()
        }
        if (req.url.startsWith('/__webpack_hmr') || req.url.startsWith('/socket.io/')) {
          return next()
        }

        if (!this.isAuthenticationEnabled) {
          return next()
        }

        // console.log('WILL BLOCK FOR AUTH', req.url)

        if (this.volatileAccessTokens.includes(req.signedCookies['volatile-access-token'])) {
          return next()
        }

        return res.redirect(`/login?then=${encodeURIComponent(req.url)}`)
      })

      return router
    }

    const middlewares = {
      '/': redirectIfNotAuth()
    }

    return middlewares
  }
}
