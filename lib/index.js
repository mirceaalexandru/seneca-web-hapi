'use strict';

// Declare internals

const internals = {
  actions: {}
};


exports.register = function (server, options, next) {
  server.dependency('chairo');

  internals.server = server
  internals.seneca = server.seneca
  internals.actions.init()

  next()
};


exports.register.attributes = {
  pkg: require('../package.json')
};


internals.actions = {
  init: function () {
    internals
      .seneca
      .add({role: 'web', list: 'route'}, internals.actions.web_route)
      .add('role:web, stats:true', internals.actions.action_stats)
  },

  web_route: function (args, done) {
    var srv_info = internals.server.table()

    var mapping = []
    for (var i in srv_info[0].table) {
      var data = srv_info[0].table[i]
      console.dir(data)

      mapping.push({
        method: data.method,
        url: data.path
      })
    }

    done(null, mapping)
  },

  action_stats: internals.actions.web_route
}
