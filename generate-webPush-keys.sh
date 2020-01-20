#!/usr/bin/nodejs

const webpush = require('web-push')
const fs = require('fs')
const path = require('path')

const keys = webpush.generateVAPIDKeys()
const webPushKeys = { publicVapidKey: keys.publicKey, privateVapidKey: keys.privateKey, email: 'mailto:test@gmail.com' }

fs.writeFileSync(path.join('.', 'var', 'webPush.json'), JSON.stringify(webPushKeys, null, 2))
