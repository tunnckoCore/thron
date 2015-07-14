/*!
 * thron <https://github.com/tunnckoCore/thron>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var test = require('assertit')
var schema = require('./index')
var deepStrictEqual = require('is-equal-shallow')

test('thron', function () {
  test('should throw TypeError if `schema` is not object', function (done) {
    function fixture () {
      schema('foo')
    }

    test.throws(fixture, TypeError)
    test.throws(fixture, /expect `schema` to be object/)
    done()
  })
  test('should throw TypeError if `data` is not object', function (done) {
    function fixture () {
      var validate = schema({name: 'foo*'})
      validate('foo bar')
    }

    test.throws(fixture, TypeError)
    test.throws(fixture, /expect `data` to be object/)
    done()
  })
  test('should return function with accept `data` object', function (done) {
    test.equal(typeof schema({}), 'function')
    done()
  })
  test('should validate `data` object against given `schema` object', function (done) {
    var validate = schema({
      name: '*match',
      description: function (val) {
        return val.indexOf('Better glob matching') !== -1
      },
      version: '2.2.*',
      author: function (val) {
        return typeof val === 'object'
      },
      'author.name': ['Jon*', 'Charlike*'],
      'author.email': /.+@gmail.com/
    })
    var data = {
      name: 'micromatch',
      description: 'foo bar baz',
      version: '3.14.2',
      author: {
        name: 'Jerry Fox',
        email: 'foobar@mailcamp.com'
      }
    }

    var res = validate(data)
    deepStrictEqual(res, {name: 'micromatch'})
    done()
  })
  test('should validate objects when validator class given', function (done) {
    function Validator () {}
    Validator.prototype.name = function (val) { return typeof val === 'string' }
    Validator.prototype.age = function (val) { return typeof val === 'number' }

    var validate = schema(new Validator())
    var data = {name: 'foo', age: 'bar'}
    var res = validate(data)

    deepStrictEqual(res, {name: 'foo'})
    done()
  })
  test('should validate given class', function (done) {
    function Klass () {
      this.cache = {}
    }
    Klass.prototype.enable = function (val) {
      this.cache[val] = true
    }
    Klass.prototype.name = 'foobar'
    Klass.prototype.age = 'bar'

    var validate = schema({
      name: 'foo*',
      enable: /regexp/g,
      age: function (val) { return typeof val === 'number' }
    })

    var res = validate(new Klass())
    deepStrictEqual(res, {name: 'foobar'})
    done()
  })
  test('should validate class with validator class', function (done) {
    function Klass () {}
    Klass.prototype.name = 'foo'
    Klass.prototype.age = 22
    Klass.prototype.bar = 'baz'

    function Validator () {}
    Validator.prototype.name = function (val) { return typeof val === 'string' }
    Validator.prototype.age = function (val) { return typeof val === 'number' }

    var validate = schema(new Validator())
    var res = validate(new Klass())

    deepStrictEqual(res, { name: 'foo', age: 22 })
    done()
  })
  test('should validate objects with dots defined schema like `user.name`', function (done) {
    var validate = schema({
      user: function (val) { return typeof val === 'object' },
      'user.name': function (val) { return typeof val === 'string' },
      'user.age': function (val) { return typeof val === 'number' }
    })

    var res = validate({
      user: {
        name: 'foo',
        age: 'bar'
      }
    })

    deepStrictEqual(res, {user: {name: 'foo', age: 'bar'}})
    done()
  })
  test('usage example from README should work', function (done) {
    var validate = schema({
      name: 'foo*',
      username: ['jonschlin*', 'tunncko*'],
      info: function (val) {
        return typeof val === 'string' && val.indexOf('qux') !== -1
      },
      'user.age': /\d{2}/g,
      'user.name': 'Charlike'
    })
    var result = validate({
      name: 'foobar',
      username: 'tunnckoCore',
      info: 'foo bar baz',
      user: {
        age: 9,
        name: 'Jon'
      }
    })
    deepStrictEqual(result, {name: 'foobar', username: 'tunnckoCore'})
    done()
  })
})
