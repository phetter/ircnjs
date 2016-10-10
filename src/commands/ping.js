
// /msg #channel|nick [msg]

var ink = require('../ui/ink');

module.exports = {
    name: "ping",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length === 1) {
        // client.send('ping', args[0]);
        var ts = new Date().getTime();
        client.ctcp(args[0], 'privmsg', 'PING '+ts);
        session.window.print(ink.brkt('ctcp'.yellow+'('+args[0].yellow.bold+')')+' PING '+ts);
      } else {
        module.exports.help.call(this);
        return;
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /ping Syntax:');
      session.window.print(ink.etag + '   /ping <nick>|<chan>');
    },
    about: function () {
    }
};
