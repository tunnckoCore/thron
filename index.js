/*!
 * thron <https://github.com/tunnckoCore/thron>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var get = require('get-value')
var set = require('set-value')
var matcher = require('is-match')
var isObject = require('is-extendable')
var extend = require('extend-shallow')

module.exports = function thron (schema, opts) {
  if (!isObject(schema)) {
    throw new TypeError('thron expect `schema` to be object')
  }
  opts = isObject(opts) ? opts : {}
  opts = extend({}, opts)

  return function (data, options) {
    if (!isObject(data)) {
      throw new TypeError('thron expect `data` to be object')
    }
    options = isObject(options) ? options : {}
    options = extend(opts, options)
    var res = {}

    Object.keys(schema).forEach(function (key) {
      var isMatch = matcher(schema[key], options)
      var value = get(data, key)

      if (isMatch(value)) {
        set(res, key, value)
      }
    })

    return res
  }
}
