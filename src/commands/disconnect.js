// /disconnect [msg]

var ink = require('../ui/ink');

module.exports = {
    name: "disconnect",
    run: function (args) {
      var session = this;
      var client = session.irc.client;
      if(session.irc.connected || session.irc.connecting) {
        client.disconnect(args.length ? args.join(' ') : session.quitMsg);
        // session.irc.client = null;
        session.irc.connected = session.irc.connecting = false;
        session.window.parent.update(ink.itag + ' Disconnected.'.green.bold);
      }
      else {session.window.parent.update('trying to disconnect');}
    },
    help: function () {
    },
    about: function () {
    }
};
