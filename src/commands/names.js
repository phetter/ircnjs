
// /names [<channel>[,<channel> [<target>]]

var ink = require('../ui/ink');

module.exports = {
    name: "names",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      // if(args.length >= 1 ) {
        // [<channel>[,<channel> [<target>]]
        if(!args.length) client.send.apply(client, ['names', session.window.target.name].concat(args));
        else client.send.apply(client, ['names'].concat(args));
      // } else {
      //   module.exports.help.call(this);
      //   return;
      // }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /names Syntax:');
      session.window.print(ink.etag + '   /names [<channel>[,<channel> [<target>]]');
    },
    about: function () {
    }
};
