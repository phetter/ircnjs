
// /kick [<channel>] <nicks> [<reason>]

var ink = require('../ui/ink');

module.exports = {
    name: "kick",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length >= 1 ) {
        // /kick [<channel>] <nicks> [<reason>]
        if(args[0][0] !== '#') client.send.apply(client, ['kick', session.window.target.name].concat(args));
        else client.send.apply(client, ['kick'].concat(args));
      } else {
        module.exports.help.call(this);
        return;
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /kick Syntax:');
      session.window.print(ink.etag + '   /kick [<channel>] <nicks> [<reason>]');
    },
    about: function () {
    }
};
