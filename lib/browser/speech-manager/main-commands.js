'use strict'

export default (language, logger, mainState, buildNext, buildYesNo, speak, thesaurus, reduceCommands, setLanguage) => {
  switch (language) {
    case 'en-US': {
      const enCommands = {}

      return {
        ...reduceCommands(enCommands), // commands directly available from root.
        hello: () => speak('Hello, master!'),

        bonjour: () => { setLanguage('fr-FR'); speak('En français, maintenant !') },
        french: () => { setLanguage('fr-FR'); speak('En français, maintenant !') },
        francais: () => { setLanguage('fr-FR'); speak('En français, maintenant !') }
      }
    }
    case 'fr-FR': {
      const frCommands = {
        'Rafraîchit la page': {
          matches: ['rafraîchit la page (s\'il te plaît)', 'rafraîchit', 'rafraîchir'],
          action: () => speak('C\'est parti !', window.location.reload)
        },
        Redémarre: {
          matches: ['redémarre (s\'il te plaît)', 'redémarrer', 'relance', 'relancer'],
          action: buildYesNo(
            'Redémarrer le serveur ?', 'Redémarrer le serveur ?',
            () => speak('Je ne sais pas encore redémarrer... Mais c\'est prévu pour bientôt!'),
            () => speak(thesaurus('oks'))
          )
        },
        Verrouille: {
          matches: ['verrouille (la page)', 'verrouiller', 'déloger'],
          action: () => speak(thesaurus('oks'), mainState.logout)
        }
      }

      return {
        ...reduceCommands(frCommands), // commands directly available from root.
        bonjour: buildNext('Bonjour Maître !', 'Comment puis-je aider ?', frCommands),
        salut: buildNext('Salut !', 'Comment puis-je aider ?', frCommands),
        aide: buildNext('Bonjour ! Voici ce que vous pouvez me demander.', 'Commandes disponibles', frCommands),
        'que sais-tu faire': buildNext('Bonjour ! Voici ce que vous pouvez me demander.', 'Commandes disponibles', frCommands),

        hello: () => { setLanguage('en-US'); speak('Speaking English now!') },
        anglais: () => { setLanguage('en-US'); speak('Speaking English now!') },
        english: () => { setLanguage('en-US'); speak('Speaking English now!') }
      }
    }
    default:
      return {}
  }
}
