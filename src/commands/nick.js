
// /nick nick

var ink = require('../ui/ink');

module.exports = {
    name: "nick",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length === 1 ) {
        client.send('nick', args[0]);
      } else {
        module.exports.help.call(this);
        return;
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /nick Syntax:');
      session.window.print(ink.etag + '   /nick newnick');
    },
    about: function () {
    }
};
