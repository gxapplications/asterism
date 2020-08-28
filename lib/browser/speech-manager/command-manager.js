'use strict'

import mainCommands from './main-commands'
import { nomatches, abortKeywords, repeats, gones, keywords } from './thesaurus' // eslint-disable-line import/no-duplicates
import * as thesaurusLib from './thesaurus' // eslint-disable-line import/no-duplicates

export default class CommandManager {
  constructor (annyang, continuousMode, mainState, speak, setLanguage, continueDialog, stopDialog, logger) {
    this.continuousMode = continuousMode
    this.mainState = mainState
    this.speak = speak
    this.setLanguage = setLanguage
    this.continueDialog = continueDialog
    this.stopDialog = stopDialog
    this.logger = logger
    this.nextCommands = null // the commands to listen after a previous partial one
    this.currentCommands = null // the commands from nextCommands, but during the process
    this.nothing = false

    // TODO !4: continuousMode to handle

    this.annyang = annyang
    annyang.addCallback('resultNoMatch', (possiblePhrases) => {
      this.logger.log('No match for the speech command:', possiblePhrases, this.rootCommands)
      this.nothing = false

      // during an engaged dialog, ask again
      if (this.currentCommands) {
        this.speak(repeats[this.language], () => {
          this.continueDialog()
        })
        this.nextCommands = this.currentCommands
        this.currentCommands = null
      } else {
        this.speak(nomatches[this.language])
        this.abort()
      }
    })
    annyang.addCallback('resultMatch', (userSaid, commandText) => {
      this.logger.log(`Found a match for the command: "${userSaid} => ${commandText}"`, '; Next commands:', this.nextCommands)
      this.nothing = false

      if (!this.nextCommands) {
        this.abort()
      }
    })
    annyang.addCallback('start', () => {
      this.nothing = true
    })
    annyang.addCallback('end', () => {
      if (this.nothing) {
        if (this.currentCommands) {
          this.speak(repeats[this.language], () => {
            this.continueDialog()
          })
          this.nextCommands = this.currentCommands
          this.currentCommands = null
        } else {
          this.speak(nomatches[this.language])
          this.nextCommands = null
          this.stopDialog()
        }
      }
    })
    annyang.addCallback('error', (error) => {
      this.logger.warn(error.error)

      // when user does not finish a dialog
      if (error.error === 'no-speech' && this.currentCommands) {
        this.speak(gones[this.language])
        this.nextCommands = null
        this.currentCommands = null
        this.stopDialog()
      }
    })
  }

  get language () {
    return this.annyang.getSpeechRecognizer().lang
  }

  buildNextCommand (answer, question, alternatives) {
    return () => {
      const keys = Object.keys(alternatives)
      this.nextCommands = keys.reduce((acc, key) => {
        alternatives[key].matches.forEach((match) => {
          if (acc[match]) {
            this.logger.error('There is duplicates in the commands!', alternatives)
          }
          acc[match] = alternatives[key].action
          acc[' ' + match] = alternatives[key].action
        })
        return acc
      }, {})
      this.speak(answer, () => this.continueDialog(question, keys))
    }
  }

  buildYesNo (answer, question, yesAction, noAction = this.abort.bind(this)) {
    return () => {
      this.nextCommands = {}
      keywords.yes[this.language].forEach((yes) => {
        this.nextCommands[yes] = yesAction
      })
      keywords.no[this.language].forEach((no) => {
        this.nextCommands[no] = noAction
      })
      this.speak(answer, () => this.continueDialog(question, [keywords.yes[this.language][0], keywords.no[this.language][0]]))
    }
  }

  getThesaurus (...path) {
    let c = thesaurusLib
    path.forEach((p) => {
      c = c ? c[p] : null
    })
    if (!c) {
      return []
    }
    c = c[this.language] ? c[this.language] : c['en-US']
    return c
  }

  reduceCommands (commands) {
    return Object.entries(commands).reduce((acc, [key, value]) => {
      value.matches.forEach(match => { acc[match] = value.action })
      return acc
    }, {})
  }

  get rootCommands () {
    if (this.rootCommandsCache) {
      return this.rootCommandsCache
    }

    // TODO !5: add root commands from plugins!
    this.rootCommandsCache = {
      ...mainCommands(
        this.language,
        this.logger,
        this.mainState,
        this.buildNextCommand.bind(this),
        this.buildYesNo.bind(this),
        this.speak,
        this.getThesaurus.bind(this),
        this.reduceCommands.bind(this),
        (lang) => { this.setLanguage(lang); this.rootCommandsCache = null }
      )
    }
    return this.rootCommandsCache
  }

  loadCommands () {
    if (this.nextCommands) {
      this.currentCommands = this.nextCommands
      this.nextCommands = null
      return this.currentCommands
    }

    return this.rootCommands
  }

  start () {
    this.annyang.removeCommands() // remove all
    this.annyang.addCommands(this.loadCommands())

    if (this.nextCommands || this.currentCommands) {
      abortKeywords[this.language].forEach((keyword) => {
        this.annyang.addCommands({ [keyword]: this.abort.bind(this) })
      })
    }
    const recognitionOptions = { autoRestart: false, paused: false }
    this.annyang.start(recognitionOptions)
  }

  abort () {
    this.annyang.abort()
    this.nextCommands = null
    this.currentCommands = null
    this.stopDialog()
  }
}
