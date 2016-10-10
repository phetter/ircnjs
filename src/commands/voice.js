
// /voice nick

var ink = require('../ui/ink');

module.exports = {
    name: "voice",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length >= 1 ) {
        // chan modes args
        args.forEach(function(arg){
          client.send('mode', session.window.target.name, '+v', arg);
        });
      } else {
        module.exports.help.call(this);
        return;
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /voice Syntax:');
      session.window.print(ink.etag + '   /voice nick [anothernick] [...]');
    },
    about: function () {
    }
};
