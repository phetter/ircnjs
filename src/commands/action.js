
// /action action args

var ink = require('../ui/ink');

module.exports = {
    name: "action",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length >= 1 ) {
        // target message
        if(session.window.id !== session.window.parent.id) {
          var text = args.join(' ');
          client.action(session.window.target.name, text);
          session.window.print('* '.bold + session.userName.bold + ' ' + text);
        }
      } else {
        module.exports.help.call(this);
        return;
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /action Syntax:');
      session.window.print(ink.etag + '   /action action args');
    },
    about: function () {
    }
};
