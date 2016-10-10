// /quit [msg]

var ink = require('../ui/ink');

module.exports = {
    name: "quit",
    run: function (args) {
      var session = this;
      var client = session.irc.client;
      if(client && (session.irc.connected || session.irc.connecting)) {
        client.disconnect(args.length ? args.join(' ') : session.quitMsg);
        session.irc.connected = false;
        session.window.parent.update(ink.itag + ' Disconnected.'.green.bold);
      }
      process.exit(0);
    },
    help: function () {
    },
    about: function () {
    }
};
