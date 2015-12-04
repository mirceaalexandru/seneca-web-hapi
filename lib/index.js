'use strict'

// Declare internals

const internals = {
  actions: {}
}


exports.register = function (server, options, next) {
  server.dependency('chairo')

  internals.server = server
  internals.seneca = server.seneca
  internals.actions.init()

  next()
}


exports.register.attributes = {
  pkg: require('../package.json')
}


internals.actions = {
  init: function () {
    internals
      .seneca
      .add({role: 'web'}, internals.actions.web_use)
      .add({role: 'web', list: 'route'}, internals.actions.web_route)
      .add('role:web, stats:true', internals.actions.action_stats)
  },

  web_route: function (args, done) {
    var srv_info = internals.server.table()

    var mapping = []
    for (var i in srv_info[0].table) {
      var data = srv_info[0].table[i]

      mapping.push({
        method: data.method,
        url: data.path
      })
    }

    done(null, mapping)
  },

  web_use: function (args, done) {
    if (!args.use) {
      return done('Invalid data')
    }

    for (var i in args.use) {
      var route = args.use[i]
      addRoute(route)
    }
    done()

    function addRoute (route) {
      var hapi_route = {
        method: route.method,
        path: route.alias,
        handler: function (request, reply) {
          request.seneca.act(route.act, function (err, result) {
            if (err) {
              return reply(err)
            }

            return reply(result)
          })
        }
      }
      console.log(hapi_route)
      internals.server.route(hapi_route)
    }
  },

  action_stats: internals.actions.web_route
}

