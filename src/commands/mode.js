
// /mode chan|nick [mode [mode parameters]]

var ink = require('../ui/ink');

module.exports = {
    name: "mode",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length >= 1 ) {
        // chan|nick [mode [mode parameters]]
        client.send.apply(client, ['mode'].concat(args));
      } else {
        module.exports.help.call(this);
        return;
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /mode Syntax:');
      session.window.print(ink.etag + '   /mode <your nick>|<channel> [<mode> [<mode options>]]');
    },
    about: function () {
    }
};
