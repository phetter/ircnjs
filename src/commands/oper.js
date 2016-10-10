
// /oper name password

var ink = require('../ui/ink');

module.exports = {
    name: "oper",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length === 2 ) {
        // name password
        client.send('oper', args[0], args[1]);
      } else {
        module.exports.help.call(this);
        return;
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /oper Syntax:');
      session.window.print(ink.etag + '   /oper nick password');
    },
    about: function () {
    }
};
