// generate encrypted message to nick using dh
// /emsg nick

var crypto = require('crypto');
var ink = require('../ui/ink');

module.exports = {
    name: "emsg",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length >= 2) {
        var cipher = crypto.createCipher('aes192', 'a password');
        args.shift();
        var encrypted = cipher.update(args.join(' '), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        client.say(session.window.target.name, encrypted);
      } else {
        module.exports.help.call(this);
        return;
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /emsg Syntax:');
      session.window.print(ink.etag + '   /emsg <nick> <message text>');
    },
    about: function () {
    }
};
