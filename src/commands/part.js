
// /part #channel [msg]

module.exports = {
    name: "part",
    run: function (args) {
      var session = this;
      var client = session.irc.client;
      if(client && args.length) {
        if(args[0][0] === '#')  { // if hash, a channel is specified
          // args[0] = '#' + args[0];
          client.part(args.shift(), (args.length >= 1 ? args.join(' ') : null));
        } else { // no channel specified, assume args are part message
          client.part(session.window.target.name, (args.length >= 1 ? args.join(' ') : null));
        }
      }
      else if(!args.length) {
        client.part(session.window.target.name);
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /part Syntax:');
      session.window.print(ink.etag + '   /part #chan');
      session.window.print(ink.etag + '   /part #chan nsa says i cant chill here');
      session.window.print(ink.etag + '   /part im leaving the current channel with this message');
    },
    about: function () {
    }
};
