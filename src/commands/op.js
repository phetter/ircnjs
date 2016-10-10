
// /op nick

var ink = require('../ui/ink');

module.exports = {
    name: "op",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length === 1 ) {
        // chan modes args
        client.send('mode', session.window.target.name, '+o', args[0]);
      } else {
        module.exports.help.call(this);
        return;
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /op Syntax:');
      session.window.print(ink.etag + '   /op nick');
    },
    about: function () {
    }
};
