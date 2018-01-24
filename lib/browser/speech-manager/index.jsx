'use strict'

/* global $ */
import annyang from 'annyang'
import cx from 'classnames'
import CommandManager from './command-manager'
import { NavItem, Icon } from 'react-materialize'
import React from 'react'
import { hellos, listens, errors } from './thesaurus'

export default class SpeechManager {
  constructor (mainComponent, localStorage, logger) {
    this.mainComponent = mainComponent
    this.logger = logger
    this.available = (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window)) &&
      ('speechSynthesis' in window)
    this.voice = false
    this.voiceReady = false
    this.continuousMode = localStorage.getItem('settings-speech-continuous-recognition') || false

    if (this.available) {
      this.commandManager = new CommandManager(
        this.initEngines(localStorage),
        this.continuousMode,
        this.speak.bind(this),
        this.setLanguage.bind(this),
        this.continueDialog.bind(this),
        this.stopDialog.bind(this),
        logger
      )
    }

    this.resultAnimating = false
    this.justStarted = false
    this.dialogMode = false
  }

  initEngines (localStorage) {
    annyang.init({ }, true)
    const recognition = annyang.getSpeechRecognizer()

    // init language (immutable)
    const defaultLanguage = localStorage.getItem('settings-speech-main-language') || 'en-US'
    this.setLanguage(defaultLanguage)
    window.speechSynthesis.onvoiceschanged = (e) => {
      this.setLanguage(defaultLanguage)
      if (!this.voiceReady) {
        this.speak(hellos[defaultLanguage])
        this.voiceReady = true
      }
    }

    // Events to manage UI
    annyang.addCallback('start', () => {
      if (!this.dialogMode) {
        $('#speech-popup').removeClass('hide')
        this.justStarted = true
        setTimeout(() => {
          $('#speech-popup .bubble').removeClass('hide')
          this.justStarted = false
        }, 20)
      } else {
        $('#speech-popup').removeClass('hide')
        $('#speech-popup-dialog-container').removeClass('hide')
        setTimeout(() => {
          $('#speech-popup-dialog-container .dialog').removeClass('hide')
        }, 20)
      }
    })
    annyang.addCallback('end', () => {
      if (!this.dialogMode) {
        if (this.justStarted) {
          // too short, maybe blocked...
          this.logger.warn('Annyang stops too quickly. Mic may be blocked.')
          this.speak(errors[this.voice.lang])
          $('#speech-popup .bubble').addClass('red-text')
          this.resultAnimating = setTimeout(() => {
            $('#speech-popup .bubble').addClass('hide')
            $('#speech-popup .bubble').removeClass('red-text')
            setTimeout(() => $('#speech-popup').addClass('hide'), 200)
            this.resultAnimating = false
          }, 1500)
        }
        if (!this.resultAnimating) {
          $('#speech-popup .bubble').addClass('hide')
          setTimeout(() => $('#speech-popup').addClass('hide'), 200)
        }
      } else {
        $('#speech-popup-dialog-container .dialog').addClass('hide')
        setTimeout(() => {
          $('#speech-popup-dialog-container').addClass('hide')
          $('#speech-popup').addClass('hide')
        }, 200)
      }
    })
    recognition.onspeechstart = () => {
      $('#speech-popup i.material-icons.microphone').addClass('viber')
    }
    recognition.onspeechend = () => {
      $('#speech-popup i.material-icons.microphone').removeClass('viber')
    }
    annyang.addCallback('result', () => {
      if (!this.dialogMode) {
        $('#speech-popup .bubble').addClass('green-text')
        this.resultAnimating = setTimeout(() => {
          $('#speech-popup .bubble').addClass('hide')
          $('#speech-popup .bubble').removeClass('green-text')
          setTimeout(() => $('#speech-popup').addClass('hide'), 200)
          this.resultAnimating = false
        }, 1500)
      } else {
        $('#speech-popup-dialog-container .dialog').addClass('hide')
        setTimeout(() => {
          $('#speech-popup-dialog-container').addClass('hide')
          $('#speech-popup').addClass('hide')
        }, 200)
      }
    })

    annyang.addCallback('error', () => {
      $('#speech-popup .bubble').addClass('hide')
      $('#speech-popup .bubble').removeClass('green-text')
      $('#speech-popup .bubble').removeClass('red-text')
      $('#speech-popup-dialog-container .dialog').addClass('hide')
      $('#speech-popup-dialog-container').addClass('hide')
      $('#speech-popup').addClass('hide')
      this.resultAnimating = false
    })
    annyang.addCallback('errorNetwork', () => {
      this.logger.error('Annyang errorNetwork')
      this.speak(errors.errorNetwork[this.voice.lang])
    })
    annyang.addCallback('errorPermissionBlocked', () => {
      this.logger.error('Annyang errorPermissionBlocked')
      this.speak(errors.errorPermissionBlocked[this.voice.lang])
      this.available = false
    })
    annyang.addCallback('errorPermissionDenied', () => {
      this.logger.error('Annyang errorPermissionDenied')
      this.speak(errors.errorPermissionDenied[this.voice.lang])
      this.available = false
    })

    return annyang
  }

  setLanguage (language) {
    // available on Mint: de-DE en-US (x2! M/F) en-GB es-ES es-US fr-FR
    // hi-IN id-ID it-IT ja-JP ko-KR nl-NL pl-PL pt-BR ru-RU zh-CN zh-HK zh-TW
    // ON Android, values are different: fr_FR, en_US... with UNDERSCORES! And specialities: zh_CN_#Hans
    const voices = [ ...window.speechSynthesis.getVoices().filter((v) => {
      return v.lang.startsWith(language) || v.lang.startsWith(language.replace('-', '_'))
    }), ...window.speechSynthesis.getVoices().filter((v) => {
      return v.lang.startsWith(language.substr(0, 2))
    }) ]

    if (voices.length) {
      this.voice = voices[0]
      annyang.setLanguage(language)
    }
  }

  startRecognition (animationLevel = 0) {
    if (!this.available) {
      return
    }
    this.logger.log('startRecognition step 0.')
    this.speak(listens[this.voice.lang])
    this.logger.log('startRecognition step 1.')

    if (animationLevel >= 3 && !this.dialogMode) {
      const bubbleContainer = $('.navbar-fixed ul.hide-on-med-and-down .speech-bubble-container')
      bubbleContainer.addClass('go')
      const bubbleContainerBounds = bubbleContainer[0].getBoundingClientRect()
      $('.speech-bubble', bubbleContainer).css({
        left: `calc(50vw - 32px - ${bubbleContainerBounds.left}px)`,
        top: `calc(50vh - 32px - ${bubbleContainerBounds.top}px)`
      })
      setTimeout(() => {
        bubbleContainer.removeClass('go')
        $('.speech-bubble', bubbleContainer).css({ left: '1px', top: '1px' })
      }, 460)

      setTimeout(() => { this.commandManager.start() }, 400)
    } else {
      setTimeout(() => { this.commandManager.start() }, 100)
    }
  }

  continueDialog (question, alternatives) {
    this.dialogMode = { question: question || this.dialogMode.question, alternatives: alternatives || this.dialogMode.alternatives }
    this.mainComponent.setState({ speechDialog: this.dialogMode })
    this.commandManager.start()
  }

  stopDialog () {
    this.dialogMode = false
    this.mainComponent.setState({ speechDialog: null })
  }

  abortRecognition () {
    this.dialogMode = false
    this.mainComponent.setState({ speechDialog: null })
    this.commandManager.abort()
  }

  speak (text, callback) {
    const ut = new window.SpeechSynthesisUtterance(text)
    ut.voice = this.voice
    window.speechSynthesis.speak(ut)
    if (callback) {
      ut.onend = callback
    }
  }

  getComponent () {
    return ({ animationLevel }) => (
      <NavItem className={cx(
          'notification-item-speech',
          this.available && animationLevel >= 2 ? 'waves-effect waves-light' : '',
          { 'speech-disabled': !this.available }
        )}
        href='javascript:void(0)' onClick={this.startRecognition.bind(this, animationLevel)}
      >
        {this.available ? (
          <span className='speech-bubble-container hide-on-med-and-down'>
            <span className='speech-bubble'>
              <Icon>mic</Icon>
            </span>
          </span>
        ) : null}
        <Icon>{this.available ? 'mic' : 'mic_off'}</Icon>
        <span className='hide-on-large-only'>Speak to control</span>
      </NavItem>
    )
  }
}
