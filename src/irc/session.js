// session.js - Manage IRC sessions

var ink     = require('../ui/ink');
var Irc     = require('./irc');
var Window  = require('../ui/window');

var sessions = [];

module.exports = Session;
function Session(cfg, ui) {
  this.cfg                = cfg;
  this.ui                 = ui;
  this.sessions           = sessions;
  this.userName           = cfg.irc.options.userName;
  this.userModes          = [];
  this.realName           = cfg.irc.options.realName;
  this.server             = cfg.irc.server;
  this.port               = cfg.irc.options.port;
  this.chans              = cfg.irc.options.channels;
  this.viewRawServerMsgs  = true;

  if(cfg.irc.defaultQuitMessage.length) this.quitMsg = cfg.irc.defaultQuitMessage;
  else this.quitMsg = cfg.name + ' v' + cfg.version;

  this.allwindows = [];
  this.window = new Window(this.server+':'+this.port+'/', this.server+':'+this.port, 'status', 'prompt', this, ui);

  this.irc = new Irc(this);
  this.sessions.push(this);
}

Session.prototype.action = function(action) {
  switch(action) {
    case 'window next': this.window.next();
      break;
    case 'window prev': this.window.prev();
      break;
    case 'window new': // TODO: add new - binding already in blessed.js
      break;
    case 'window kill': // TODO: add kill - binding already in blessed.js
      if(this.window.target.type === 'chan') this.irc.client.part(this.window.target.name);
      this.window.close();
      break;
    default: // alt-number pressed to find window
      if(!isNaN(action)) this.window.show(action-1);
      break;
  }
}
