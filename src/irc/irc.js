// irc.js - core IRC Layer

/*jshint esversion: 6 */

var irc         = require('irc');
var _           = require('underscore');
var date        = require('../date').get;
var ink         = require('../ui/ink');


module.exports = Irc;
function Irc(session) {
  var self = this;
  self.session = session;
  self.timer = false;
  var serverwindow = session.window.parent;

  //self.connected = false;
  //self.connecting = false;

  if(self.session.cfg.irc.options.autoConnect) {
    self.connecting = true;
    serverwindow.update(ink.itag+" Auto-Connecting to "+session.server.bold+" port "+session.port.toString().bold+"...",
        session.window.parent.id, ink.brkt(session.userName + ' status'));
  }

  self.client = new irc.Client(session.server, session.userName, session.cfg.irc.options);

  self.client.addListener('registered', function(){
    self.connected = true;
    self.connecting = false;
    serverwindow.update(ink.itag+" Connected and registered.".green.bold);

    if(session.cfg.irc.defaultUserModes) {
        self.client.send('mode', session.userName, session.cfg.irc.defaultUserModes);
      // var modes = session.cfg.irc.defaultUserModes.split('');
      // modes.forEach(function(mode){
      //   // TODO: remember to check that only user session modes are getting put in here
      //   self.client.send('mode', session.userName, mode);
      //   // if(!session.userModes.length) session.userModes.push('+');
      //   // session.userModes.push(mode);
      //   // serverwindow.setStatus();
      // });
    }
    var closeConn = function() {
      self.connected = false;
      serverwindow.print(ink.etag + ' Connection closed to ' + self.session.server.bold);
      if(self.session.cfg.irc.autoReconnect) self.connect(self.session.server, self.session.port);
    };
    self.client.conn.removeListener('close', closeConn);
    self.client.conn.addListener('close', closeConn);

    var endConn = function() {
      self.connected = false;
      serverwindow.print(ink.etag + ' Got FIN from ' + self.session.server.bold);
      // if(self.session.cfg.irc.autoReconnect) self.connect(self.session.server, self.session.port);
    };
    self.client.conn.removeListener('end', endConn);
    self.client.conn.addListener('end', endConn);

    var errorConn = function(msg) {
      serverwindow.print(ink.etag + ' Socket error: ' + msg.bold);
    };
    self.client.conn.removeListener('error', errorConn);
    self.client.conn.addListener('error', errorConn);

    // self.timer = true;
    //
    // self.timeout = setTimeout(function() {
    //   self.timer = false;
    //   self.connected = false;
    //   serverwindow.print(ink.etag + ' No PING from ' + server.bold + ' in 301 seconds, disconnecting');
    //   serverwindow.print(ink.etag + ' Connection lost to ' + server.bold);
    //   if(self.sesion.cfg.irc.autoReconnect) self.connect(self.session.server, self.session.port);
    // }, 301000); // 5 minutes and 1 seconds in milliseconds
  });

  self.client.addListener('ping', (server) => { // server ping - irc api automatically generates pong
    if(server === session.server) {
        if(self.session.cfg.irc.showServerPing) serverwindow.print(ink.wtag + ' ' + server + ': PING');

        // // Clear the timer, if present, for every PING server message and set a new one.
        // // If the timer callback runs, we've lost connection.
        // if(self.timer) clearTimeout(self.timeout);
        //
        // self.timer = true;
        //
        // self.timeout = setTimeout(function() {
        //   self.timer = false;
        //   self.connected = false;
        //   self.client.send('PING');
        //   serverwindow.print(ink.etag + ' No PING from ' + server.bold + ' in 301 seconds, disconnecting');
        //   // self.client.disconnect();
        //   serverwindow.print(ink.etag + ' Connection lost to ' + server.bold);
        //   if(self.session.cfg.irc.autoReconnect) self.connect(self.session.server, self.session.port);
        // }, 301000); // 5 minutes and 1 seconds in milliseconds
    }
  });

  // setup listener for message sent to any channel we are in
  self.client.addListener('message#', (nick, to, text, msg) => {
    if(to !== session.userName) {
        serverwindow.findTargetName(to).print('< '+nick+'> ' + text);
    }
  });

  // self.client.addListener('selfMessage', function(to, text) { // message sent FROM client
  //   var window = session.window.find(to);
  //   if(window.id !== serverwindow.id) window.update('<'+session.userName+'> ' + text);
  //   else {
  //     window = session.window.new(to, to, ink.brkt(session.userName + ' <=> ' + to));
  //     window.target = to;
  //     window.print('<'+session.userName+'> ' + text);
  //   }
  //   // session.irc.client.say('#test', 'window.id: '+window.id);
  // });

  // setup listener for private message to user
  self.client.addListener('pm', (nick, text, msg) => {
    var window = session.window.findTargetName(nick);
    if(window.id !== serverwindow.id) window.print('<'+nick+'> ' + text);
    else {
      window = session.window.new({name: nick, type: 'user', modes: ''});
      window.print('<'+nick+'> ' + text);
    }
  });

  // setup listener to handle channel joins by self and others
  self.client.addListener('join', function(chan, nick, msg) {
    var window = session.window.findTargetName(chan);
    // If a window exists with this id then we are already in that channel and a new user has joined so display a join msg.
    // Else we are joining a new channel so create a new window for it
    if(window.id !== serverwindow.id)
      window.print(ink.itag+' '+nick.green.bold + ' ' + ink.brkt(msg.user.green+'@'.green.bold+msg.host.green) +' joined '+chan.bold);
    else {
      window = session.window.new({name: chan, type: 'chan', modes: '', umodes: ''});
      window.print(ink.itag+' '+nick.green.bold + ' ' + ink.brkt(msg.user.green+'@'.green.bold+msg.host.green) +' joined '+chan.bold);

    }
  });

  // fires when a channel part occurs
  self.client.addListener('part', function(chan, nick, reason, msg) {
    var window = session.window.findTargetName(chan);
    if(nick === session.userName) { // we left chan
      if(window.id !== serverwindow.id) window.close();
    } else { // someone else left
      window.print(ink.etag+' '+nick.green.bold + ' ' + ink.brkt(msg.user.green+'@'.green.bold+msg.host.green) +' left '+chan.bold);
    }
  });

  // fires when a channel kick occurs
  self.client.addListener('kick', function(chan, nick, by, reason, msg) {
    var window = session.window.findTargetName(chan);
    if(nick === session.userName) { // we got kicked
      // if(window.id !== serverwindow.id) window.close();
      window.print(ink.etag+' '+nick.green.bold + ' ' + ink.brkt(msg.user.green+'@'.green.bold+msg.host.green) +
        ' was kicked from ' + chan.bold + ' by ' + by.bold + ink.brkt(reason));
      // TODO: do more stuff to update window status that we are no longer in channel
    } else { // someone else left
      window.print(ink.etag+' '+nick.green.bold + ' ' + ink.brkt(msg.user.green+'@'.green.bold+msg.host.green) +
        ' was kicked from ' + chan.bold + ' by ' + by.bold + ink.brkt(reason));
    }
  });


  self.client.addListener('quit', function(nick, reason, chans, msg) {
    chans.forEach(function(chan) {
      var window = session.window.findTargetName(chan);
      if(window.id !== serverwindow.id)
        window.print(ink.etag+' '+nick.green.bold + ' ' + ink.brkt(msg.user.green+'@'.green.bold+msg.host.green) +' quit '+ink.brkt(reason));
    });
  });

  // fires on any nick change
  self.client.addListener('nick', function(oldnick, newnick, chans, msg) {
    // TODO: fix issue with changing nick to one already in use
    if(oldnick === session.userName) { // find all user windows and update nick
      serverwindow.setStatus(ink.brkt(serverwindow.n+1+':'+newnick + ' status'));

      // find all the message windows (all non-chan windows) and update the status with the new nick
      var windows = session.window.findTargetType('user');

      session.userName = session.cfg.irc.options.userName = newnick;

      windows.forEach(function(win) {
        // if(win.id !== serverwindow.id) win.setStatus(ink.brkt(win.n+1+':'+newnick + ' <=> '+win.shortId));
        if(win.id !== serverwindow.id) win.setStatus();
      });
    }
    // find all the channel windows and update the status with the new nick
    chans.forEach(function(chan) {
      var window = session.window.findTargetName(chan);
      if(window.id !== serverwindow.id) {
        window.print(ink.wtag+' '+oldnick.green + ' is now '+newnick.green.bold);
        // if(oldnick === session.userName) window.setStatus(ink.brkt(window.n+1+':'+newnick + ' '+chan));
        window.setStatus();
      }
    });

  });

  self.client.addListener('names', function(chan, nicks) { // names list on chan join
    var window = session.window.findTargetName(chan);
    window.print(ink.brkt('Users '.green + chan.green.bold));
    var nickList = '';
    for(var key in nicks) nickList += ' ' + key;
    window.print(ink.brkt(nickList + ' '));
  });

  self.client.addListener('topic', function(chan, topic, nick, msg) { // topic changed or shown on chan join
    var window = session.window.findTargetName(chan);
    // if(window.id !== serverwindow.id) {
      window.print(ink.wtag + ' ' + nick + ' set topic for ' + chan.green + ': ' + topic);
    // }
  });

  self.client.addListener('action', function(from, to, text, msg) {
    var window = session.window.findTargetName(to);

    if(window.id !== serverwindow.id) {
      window.print('* '.bold + from.bold + ' ' + text);
    }
  });

  self.client.addListener('ctcp', function(from, to, text, type, msg) {
    serverwindow.print(from.green.bold+ink.brkt(msg.user.green+'@'.green.bold+msg.host.green)+
      ' requested CTCP '.green+type.green.bold+' from '.green+to.green.bold+': '+text);
  });

  self.client.addListener('ctcp-notice', function(from, to, text, msg) {
  });

  self.client.addListener('ctcp-privmsg', function(from, to, text, msg) {
  });

  self.client.addListener('ctcp-version', function(from, to, msg) {
  });

  // client error listener
  self.client.addListener('error', function(message) {
    serverwindow.print(ink.etag+' error: '.error + message.command + ' ' + message.args.join(' '));
  });

  self.client.addListener('+mode', function(chan, by, mode, arg, msg) { // this is only channel modes or users in channels
    var window = session.window.findTargetName(chan);

    if(window.id !== serverwindow.id) {
      if(arg) window.print(ink.wtag + ' mode(' + chan.green + ', +' + mode + ', '+arg+') by ' + by.bold);
      else window.print(ink.wtag + ' mode(' + chan.green + ', +' + mode + ') by ' + by.bold);

      if(arg === session.userName) { // setting mode on user in channel
        switch(mode) {
          case 'v':
            if(window.target.umodes.indexOf('+') === -1)
              window.target.umodes += '+';
            break;
          case 'o':
            if(window.target.umodes.indexOf('@') === -1)
              window.target.umodes += '@';
            break;
        }
        window.setStatus();
      }
      else { // setting mode on channel
        // only allow aiklmnpqrst to be set on channel status
        if(mode.match(/[aiklmnpqrst]/) && window.target.modes.indexOf(mode) === -1) {
          if(!window.target.modes.length) window.target.modes += '+';
          window.target.modes += mode;
          if(mode === 'k') window.target.key = arg;
          else if(mode === 'l') window.target.limit = arg;
          window.setStatus();
        }
      }
    }
  });

  self.client.addListener('-mode', function(chan, by, mode, arg, msg) { // only channel modes or users in channels
    var window = session.window.findTargetName(chan);

    if(window.id !== serverwindow.id) {
      if(arg) window.print(ink.wtag + ' mode(' + chan.green + ', -' + mode + ', '+arg+') by ' + by.bold);
      else window.print(ink.wtag + ' mode(' + chan.green + ', -' + mode + ') by ' + by.bold);

      if(arg === session.userName) { // removing mode on user in channel
        switch(mode) {
          case 'v':
            if(window.target.umodes.indexOf('+') !== -1)
              window.target.umodes = window.target.umodes.replace('+', '');
            break;
          case 'o':
            if(window.target.umodes.indexOf('@') !== -1)
              window.target.umodes = window.target.umodes.replace('@', '');
            break;
        }
        window.setStatus();
      }
      else { // removing mode on channel
        if(window.target.modes.indexOf(mode) !== -1) {
          window.target.modes = window.target.modes.replace(mode, '');
          if(window.target.modes.length === 1)
            window.target.modes = window.target.modes.replace('+', '');
          window.setStatus();
        }
      }
    }
  });

  self.client.addListener('raw', function(msg) {
    var chan, window, prefix, modes;

    if(session.cfg.irc.viewRawServerMsgs) { // TODO: data binding for view raw msgs feature
      if(msg.rawCommand === 'PRIVMSG') return;
      else if(msg.rawCommand === 'PING') return;
      // if(msg.rawCommand === 'NOTICE' && !self.connecting) return;
      prefix = msg.prefix ? msg.prefix + ': ' : '';
      // serverwindow.update(ink.wtag + self.session.server+':'+self.session.port+' ' + prefix.green + msg.rawCommand + ': ' + msg.args.join(' '));
      serverwindow.print(ink.wtag + ' ' + prefix.green + msg.rawCommand + ': ' + msg.args.join(' '));
    }
    // HANDLE CHANNEL MODES sent by the server
    // 'mode's format reported by raw event on channel join
    // rpl_channelmodeis nurb #dev +nt <- nick chan modes
    // rpl_channelmodeis == 324 in rawCommand (speeds up comparison)
    if(msg.rawCommand == '324' && msg.args.length >= 3) {
      chan            = msg.args[1];
      window          = session.window.findTargetName(chan);
      if(window.id !== serverwindow.id) {
        if(msg.args[2].length > 1) window.target.modes = msg.args[2];
        if(msg.args.length === 4) window.target.key = msg.args[3];
        window.setStatus();
      }
      // if(msg.args.length == 4) msg.args[2] = msg.args[2]+' '+msg.args[3]; // tack on channel key
      // if(msg.args[0] == session.userName) {
      //   // chanCfg.trackChannelModesOnJoin(msg.args[0], msg.args[1], msg.args[2]);
      // }
    }
    else if(msg.rawCommand == '331' && msg.args.length >= 3) { // RPL_NOTOPIC
      chan            = msg.args[1];
      window          = session.window.findTargetName(chan);
      // if(window.id !== serverwindow.id) {
        window.print(ink.wtag + ' ' + msg.args[2]);
      // }
    }
    else if(msg.rawCommand === 'MODE') {
      // prefix = msg.prefix ? msg.prefix + ': ' : '';
      // serverwindow.print(ink.wtag + ' ' + prefix.green + msg.rawCommand + ': ' + msg.args.join(' '));
      var n;
      if(msg.args.length === 2 && msg.args[0] === session.userName) { // user modes are being set
        if(msg.args[1][0] === '+') {
          modes = msg.args[1].split('');
          modes.shift();
          if(!session.userModes.length) session.userModes.push('+');
          modes.forEach(function(mode) {
            if(session.userModes.indexOf(mode) === -1) session.userModes.push(mode);
          });
          serverwindow.setStatus();
        }
        else if(msg.args[1][0] === '-') {
          modes = msg.args[1].split('');
          modes.shift();
          modes.forEach(function(mode) {
            if((n = session.userModes.indexOf(mode)) != -1) session.userModes.splice(n, 1);
          });
          if(session.userModes.length === 1) session.userModes.pop(); // remove '+'
          serverwindow.setStatus();
        }
      }
    }
    // else if(msg.rawCommand == '324' && msg.args.length >= 3) {
    // }
  });
}

Irc.prototype.connect = function(server, port) {
  var self = this;
  var serverwindow = self.session.window.parent;
  self.session.server = server;
  if(port && (!isNaN(port)))
    self.session.port = self.session.cfg.irc.options.port = port;
  else {
    self.session.port = self.session.cfg.irc.options.port;
    serverwindow.print(ink.itag+" No port provided, assuming config file default: "+self.session.port);
  }
  if(self.session.port == 7000) self.session.cfg.irc.options.secure = true;
  else self.session.cfg.irc.options.secure = false;

  serverwindow.setId();
  serverwindow.setTitle();
  serverwindow.setStatus(ink.brkt(serverwindow.n+1+':'+self.session.userName + ' status'));

  self.session.irc = new Irc(self.session);
  self.client = self.session.irc.client;

  if(!self.session.cfg.irc.options.autoConnect) {
    serverwindow.print(ink.itag+" Connecting to "+server.bold+" port "+self.session.port.toString().bold+"...");
    self.session.irc.connecting = true;
    self.client.connect();
  }
}
