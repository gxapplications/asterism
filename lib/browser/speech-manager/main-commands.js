'use strict'

export default (language, logger, next, yesNo, speak) => {
  switch (language) {
    // TODO !2: to replace with real ones
    case 'en-US':
      return {
        'hello': next('Hello there! How are you?', 'How are you?', {
          'Fine': {
            matches: ['fine'],
            action: () => speak('Glad to know this!')
          },
          'Sad': {
            matches: ['bad', 'sad'],
            action: () => speak('Sorry to hear that...')
          }
        })
      }
    case 'fr-FR':
      return {
        'bonjour': next('Bonjour à toi ! Comment puis-je aider ?', 'Comment puis-je aider ?', {
          'Rafraîchit la page': {
            matches: ['rafraîchit la page (s\'il te plaît)'],
            action: () => speak('Je voudrais bien... Je ne sais pas encore le faire !')
          },
          'Redémarre': {
            matches: ['redémarre (s\'il te plaît)', 'redémarrer', 'reboot'],
            action: yesNo('En es-tu sûr ?', 'Redémarrer ?', () => speak('Je ne sais pas encore redémarrer... Mais c\'est prévu pour bientôt!'))
          }
        })
      }
    default:
      return {}
  }
}
