
// /topic [channel] [topic]

var ink = require('../ui/ink');

module.exports = {
    name: "topic",
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }
      if(args.length >= 1 ) {
        var chan, topic;
        
        if(args[0][0] === '#')
          chan = args.shift();

        if(args.length >= 2) topic = args.join(' ');

        if(chan && topic)
          client.send('topic', chan, topic);
        else if(chan)
          client.send('topic', chan);
        else if(topic)
          client.send('topic', session.window.target.name, topic);
      }
      else if(!args.length) { // get topic
        if(session.window.id !== session.window.parent.id)
          client.send('topic', session.window.target.name);
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.etag + ' /topic Syntax:');
      session.window.print(ink.etag + '   /topic [channel] [topic]');
    },
    about: function () {
    }
};
