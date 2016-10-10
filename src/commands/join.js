// /join <channel>[,<channel> [<key>[,<key>]]]

var ink     = require('../ui/ink');
var _       = require('underscore');

module.exports = {
    name: 'join',
    run: function (args) {
      var session = this;
      var client = session.irc.client;

      if(!session.irc.connected) {
        session.window.update(ink.etag+' You are not connected.');
        return;
      }

      if(args.length >= 1) {
        var chans = args[0].split(',');

        chans = _.map(chans, function(chan){
          if(chan[0] !== '#' && chan[0] !== '&') return '#'+chan;
          else return chan;
        });
        chans = chans.join(',');
        var jargs = ['join', chans];

        if(args.length === 2) jargs.push(args[1]);
        client.send.apply(client, jargs);
        // do the following to loop and send each join separately
        // var keys = [];
        // if(args.length === 2) keys = args[1].split(',');
        // var i = 0;
        // chans.forEach(function(chan){
        //   if(keys[i]) client.send('join', chan, keys[i]);
        //   else client.send('join', chan);
        //   i++;
        // });
      }
    },
    help: function () {
    },
    about: function () {
    }
};
