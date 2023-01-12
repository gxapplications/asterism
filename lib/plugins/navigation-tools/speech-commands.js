export default ({
  navigationToolsService,
  privateSocket
}) => ({
  language,
  logger,
  buildNext,
  buildYesNo,
  speak,
  thesaurus,
  reduceCommands
}) => {
  const directNavigationCommands = { // TODO !0: construire dynamiquement
    lien: {
      matches: ['lien', 'liens'],
      action: () => speak(thesaurus('oks'), () => { window.location.href = '/lien' })
    }
  }
  const directNavigations = {  // TODO !0: construire dynamiquement
    'lien': '/lien',
    'liens': '/lien'
  }
  switch (language) {
    case 'en-US': {
      const enCommands = {}

      return reduceCommands(enCommands)
    }
    case 'fr-FR': {
      const frCommands = {
        Naviguer: {
          matches: ['naviguer', 'navigation', 'aller sur la page', 'va sur la page', 'voir la page'],
          action: buildNext('Vers quelle page?', 'Vers quelle page ?', directNavigationCommands),
        },
        NaviguerVers: {
          matches: ['naviguer vers *page', 'aller sur (la page) *page', 'va sur (la page) *page', 'voir (la page) *page'],
          action: (page) => {
            if (directNavigations[page]) {
              speak(thesaurus('oks'), () => { window.location.href = directNavigations[page] })
            } else {
              buildNext('Vers quelle page?', 'Vers quelle page ?', directNavigationCommands)()
            }
          }
        }
      }

      return reduceCommands(frCommands)
    }
    default:
      return {}
  }
}
