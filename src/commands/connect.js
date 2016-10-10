// /connect server port

var ink = require('../ui/ink');
var commands    = require('./commands');

module.exports = {
    name: "connect",
    run: function (args) {
      var session = this;
      var client = session.irc.client;
      var server = args[0], port = args[1];

      if(!args.length) {
        if(session.cfg.irc.server) server = session.cfg.irc.server;
        else {
          module.exports.help.call(this);
          return;
        }
      }

      if(session.irc.connected || session.irc.connecting) { // disconnect first
        if(client) {
          var quitMessage;
          if(session.defaultQuitMessage) quitMessage = session.defaultQuitMessage;
          else quitMessage = 'nip v' + session.cfg.version;
          commands.parse.call(session, '/disconnect');
          // client.disconnect(quitMessage, function() {
          //   session.irc.connected = session.irc.connecting = false;
          //   session.window.parent.update(ink.itag + ' Disconnected.'.green.bold);
          //   session.irc.connect(server, port);
          // });
          session.irc.connect(server, port);
        }
      }
      else {
        session.irc.connect(server, port);
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /connect Syntax:');
      session.window.print(ink.etag + '   /connect server [port]');
    },
    about: function () {
    }
};
