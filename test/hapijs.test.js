var assert = require('assert')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var suite = lab.suite
var test = lab.test
var before = lab.before

var Chairo = require('chairo');
var SenecaMiteWeb = require('..')
const Hapi = require('hapi')


suite('example suite tests ', function () {
  var server

  before({}, function (done) {

    server = new Hapi.Server()
    server.connection()

    server.register([Chairo, SenecaMiteWeb], function (err) {
      console.log('Server init')
      assert(!err)

      addSomeRoutes(server.seneca, function (err) {
        console.log('Routes added', err)
        assert(!err, 'No error while adding routes')

        server.start(function () {
          console.log('Server started')
          assert(!err)

          console.log('Server running at:', server.info.uri);
          done()
        })
      })
    })
  })

  function addSomeRoutes (seneca, done) {
    seneca.add('role:foo,cmd:zig', function (args, done) {
      done(null, {bar: 'zig'})
    })

    seneca.add('role:foo,cmd:bar', function (args, done) {
      done(null, {bar: 'bar'})
    })

    seneca.act('role:web', {use: {
      zig: {method: 'GET', alias: '/zig', act: {role: 'foo', cmd: 'zig'}},
      bar: {method: 'GET', alias: '/bar', act: {role: 'foo', cmd: 'bar'}}
    }}, done)
  }

  test('test route zig', function (done){
    server.inject('/zig', function(res) {
      assert.equal('zig', res.result.bar)
      done()
    })
  })

  test('test route bar', function (done){
    server.inject('/bar', function(res) {
      assert.equal('bar', res.result.bar)
      done()
    })
  })
})