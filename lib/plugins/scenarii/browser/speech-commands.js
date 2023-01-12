export default ({
  scenariiService,
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
  switch (language) {
    case 'en-US': {
      const enCommands = {}

      return reduceCommands(enCommands)
    }
    case 'fr-FR': {
      const frCommands = {
        Test: { // TODO !1
          matches: ['test', 'test test'],
          action: () => speak(thesaurus('oks'), () => {})
        }
      }

      return reduceCommands(frCommands)
    }
    default:
      return {}
  }
}
