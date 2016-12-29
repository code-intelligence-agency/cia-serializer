const protochain = require('protochain')
const builtinLibNames = require('builtin-modules')

var stringify = require('json-stringify-safe')
const builtinLibs = builtinLibNames.map((libName) => {
  return require(libName)
})

function flattenProtoProps (obj = {}) {
  const chain = protochain(obj)
  .filter(obj => obj !== Object.prototype)
  return [obj]
  .concat(chain)
  .map(item => Object.getOwnPropertyNames(item))
  .reduce((result, names) => {
    names.forEach(name => {
      result[name] = obj[name]
    })
    return result
  }, {})
}

function checkBuiltIn (value) {
  if (builtinLibs.indexOf(value) !== -1) {
    return {
      __node_builtin__: builtinLibNames[builtinLibs.indexOf(value)]
    }
  }
}

const toType = function (obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1]
}

function stringifyWithLimit (obj, maxLength) {
  let countedLength = 0
  const builtInPossibly = checkBuiltIn(obj)
  if (builtInPossibly) {
    return stringify(builtInPossibly)
  }

  return stringify(flattenProtoProps(obj), (key, value) => {
    if (countedLength > maxLength) {
      return `__na_${toType(value)}__`
    }
    const builtInPossibly = checkBuiltIn(value)
    if (builtInPossibly) {
      return builtInPossibly
    }
    if (typeof value === 'function') {
      return value.toString()
    }
    countedLength += key.length
    let addedLength = 0
    if (typeof value === 'string') {
      countedLength += value.length
      addedLength = value.length
    } else if (typeof value === 'undefined') {
      const replacement = `__undefined__`
      countedLength -= addedLength - replacement.length
      return replacement
    } else {
      const stringifiedLength = stringify(value).length
      countedLength += stringifiedLength
      addedLength = stringifiedLength
    }
    if (countedLength > maxLength) {
      const replacement = `__na_${toType(value)}__`
      countedLength -= addedLength - replacement.length
      return replacement
    }
    return value
  })
}

module.exports = {
  stringify: stringifyWithLimit,
  parse (str) {
    let result = JSON.parse(str, (key, value) => {
      if (toType(value) === 'Object' && value.__node_builtin__ && Object.keys(value).length === 1) {
        return builtinLibs[builtinLibNames.indexOf(value.__node_builtin__)]
      }
      if (value === '__undefined__') {
        return undefined
      }
      return value
    })
    if (toType(result) === 'Object' && result.__node_builtin__ && Object.keys(result).length === 1) {
      return builtinLibs[builtinLibNames.indexOf(result.__node_builtin__)]
    }
    return result
  }
}
