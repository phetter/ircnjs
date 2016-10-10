
// /msg #channel|nick [msg]

var ink = require('../ui/ink');

module.exports = {
    name: "msg",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length > 1) {
        var nick = args.shift(), msg = args.join(' ');
        client.say(nick, msg);

        var window = session.window.find(nick);
        if(window.id !== session.window.parent.id) window.print('<'+session.userName+'> ' + msg);
        else {
          window = session.window.new({name: nick, type: 'user', modes: ''});
          window.print('<'+session.userName+'> ' + msg);
        }
      } else {
        module.exports.help.call(this);
        return;
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /msg Syntax:');
      session.window.print(ink.etag + '   /msg nick your message');
    },
    about: function () {
    }
};
