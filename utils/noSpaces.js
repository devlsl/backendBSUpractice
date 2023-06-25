const noSpaces = (str, where = 'end') => {
  if (where === 'all') return str.replace(/\s/g, '')
  if (where === 'end') return str.trimEnd()
  if (where === 'start') return str.trimStart()
  if (where === 'trim') return str.trim()
}

module.exports = noSpaces
