const hellos = {
  'en-US': 'Hello!',
  'fr-FR': 'Bonjour!',
  'zh-CN': '你好！'
}

const listens = {
  'en-US': 'Yep?',
  'fr-FR': 'Oui ?',
  'zh-CN': '什么？'
}

const oks = {
  'en-US': 'Okay.',
  'fr-FR': 'D\'accord.',
  'zh-CN': '好的。'
}

const nomatches = {
  'en-US': 'I cannot understand your request.',
  'fr-FR': 'Je ne comprends pas votre demande.',
  'zh-CN': '我不明白你的要求。'
}

const repeats = {
  'en-US': 'Can you repeat please?',
  'fr-FR': 'Pouvez-vous répéter s\'il vous plaît ?',
  'zh-CN': '您能重复一遍吗？'
}

const gones = {
  'en-US': 'I didn\'t hear you.',
  'fr-FR': 'Je ne vous ai pas entendu.',
  'zh-CN': '我没有听到你的消息。'
}

const errors = {
  errorNetwork: {
    'en-US': 'I got a network error...',
    'fr-FR': 'J\'ai perdu la connexion internet...',
    'zh-CN': '我有一个网络错误...'
  },
  errorPermissionBlocked: {
    'en-US': 'You should give me the permission to listen to you.',
    'fr-FR': 'J\'ai besoin de l\'autorisation d\'écouter.',
    'zh-CN': '你应该允许我听你的。'
  },
  errorPermissionDenied: {
    'en-US': 'I do not have the permission to listen to you!',
    'fr-FR': 'Je n\'ai pas eu l\'autorisation d\'écouter !',
    'zh-CN': '我没有权限听你的！'
  }
}

/* Words to listen */

const abortKeywords = {
  'en-US': ['stop', 'cancel'],
  'fr-FR': ['stop', 'arrête', 'arrêter', 'arrêtez'],
  'zh-CN': ['停止', '取消']
}

const keywords = {
  yes: {
    'en-US': ['Yes', 'yep', 'yeah', 'okay', 'ok'],
    'fr-FR': ['Oui', 'affirmatif', 'exact', 'd\'accord'],
    'zh-CN': ['是的', '实', '肯定', '行']
  },
  no: {
    'en-US': ['No', 'nope'],
    'fr-FR': ['Non'],
    'zh-CN': ['不是', '不', '假', '取消']
  }
}

export { hellos, listens, errors, nomatches, abortKeywords, oks, repeats, gones, keywords }
