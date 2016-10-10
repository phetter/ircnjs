// window.js - abstract window management class

var _       = require('underscore');
var Ui      = require('./register').getUi();
var date    = require('../date').get;
var ink     = require('./ink');

module.exports = Window;

function Window(id, title, status, prompt, session, ui) {
  this.uiWindow     = ui;
  this.session      = session;
  this.allwindows   = this.session.allwindows;
  this.n            = this.allwindows.length;
  this.id           = id;
  this.shortId      = '';
  this.title        = title;
  this.status       = status;
  this.prompt       = prompt;
  this.target       = {
    name: '',   // defines target for data, such as channel or user name
    type: '',   // is target 'chan' or 'user'?
    modes: '',  // what are the channel modes of the target, if applicable?
    umodes: '', // what are the user modes, if in chan? (v, @, etc)
    key: '',    // channel key, if any
    limit: ''   // channel user limit, if any
    // TODO: add limit count to statusbar - irc.js already sets this prop if present
  }
  this.activity     = [];   // activity indicator

  // set the parent of all new windows to the first created
  if(!this.allwindows.length) this.parent = this;
  else this.parent = this.session.window.parent;

  this.session.allwindows.push(this);
}


Window.prototype = {
  new: function(target) {
    var prompt = '', statusStr, ui;
    var self = this;

    self.uiWindow.hide();

    if(target.type === 'chan')
      statusStr = ink.brkt(self.allwindows.length + 1 + ':' + target.umodes + self.session.userName + ink.brkt(self.session.userModes.join('')) + ' ' +
        target.name + ink.brkt(target.modes + ' ' + target.key));

    else if(target.type === 'user')
      statusStr = ink.brkt(self.allwindows.length + 1 + ':' + self.session.userName + ' <=> ' + target.name);

    ui = new Ui(self.session.server + ':' + self.session.port + '/' + target.name, statusStr);

    self.session.window = new Window(self.session.server+':'+self.session.port+'/'+target.name,
      self.session.server+':'+self.session.port+'/'+target.name, statusStr, prompt, self.session, ui);

    self.session.window.target  = target;
    self.session.window.shortId = target.name;

    // this.session.window.uiWindow.print(date()+': created new window: '+this.session.window.title);
    ui.focus();

    // this.allwindows.forEach(function(win){
    //   self.session.window.parent.uiWindow.print('allwindows: '+win.n+':'+win.title);
    // });
    return self.session.window;
  },
  close: function() {
    var n = this.n;
    if(n === 0) return;
    this.uiWindow.close();

    this.allwindows.splice(n,1);
    // adjust this.n of all windows, after the spliced one, to ensure next()/prev() work
    this.allwindows.forEach(function(win){
      if(win.n > n) {
        win.n--;
        win.status = ink.lbk+(win.n+1)+win.status.substring(win.status.indexOf(":"));
        win.setStatus(win.status);
      }
    });
    this.prev();
  },
  update: function(data, title, status, prompt) {
    if(title) this.title = title;
    if(status) this.status = status;
    if(prompt) this.prompt = prompt;

    this.uiWindow.update(this, data);
  },
  print: function(msg) {
    if(this !== this.session.window) this.addActivity();

    this.uiWindow.print(date()+' '+msg);
  },
  setId: function(id) {
    if(id) this.id = this.session.server+':'+this.session.port+'/'+id;
    else this.id = this.session.server+':'+this.session.port+'/';
  },
  setTitle: function(title) {
    if(title) this.title = title;
    else this.title = this.id;
  },
  setStatus: function(status) {
    if(status)
      this.status = status;
    else {
      var statusStr, modeStr = '';
      if(this.target.type === 'chan') {
        if(this.target.umodes)
          statusStr = this.n + 1 + ':' + this.target.umodes + this.session.userName + ink.brkt(this.session.userModes.join('')) + ' ' +
            this.target.name;
        else
          statusStr = this.n + 1 + ':' + this.session.userName + ink.brkt(this.session.userModes.join('')) + ' ' +
            this.target.name;
        if(this.target.modes) modeStr = this.target.modes;
        if(this.target.key) modeStr += ' ' + this.target.key;
        statusStr = ink.brkt(statusStr + ink.brkt(modeStr));
        this.status = statusStr;
      }
      else if(this.target.type === 'user') {
        statusStr = ink.brkt(this.n + 1 + ':' + this.session.userName + ' <=> ' + this.target.name);
        this.status = statusStr;
      }
      else { // server status window
        if(this.session.userModes.length) this.status = ink.brkt(this.n+1+':'+this.session.userName+ink.brkt(this.session.userModes.join('')) + ' status')
        else this.status = this.status;
      }
    }
    this.uiWindow.update(this);
  },
  setTarget: function(name, type, modes) {
    if(name) this.target.name = name;
    if(type) this.target.type = type;
    if(modes) this.target.modes = modes;
  },
  addActivity: function() {
    var self = this;
    this.allwindows.forEach(function(win) {
      if((win.n !== self.n) && (_.indexOf(win.activity, self.n+1) === -1)) {
        win.activity.push(self.n + 1);
        win.setStatus();
      }
    });
  },
  clearActivity: function() {
    var self = this;
    this.allwindows.forEach(function(win) {
      var i = _.indexOf(win.activity, self.n+1)
      if((win.n !== self.n) && (i !== -1)) {
        win.activity.splice(i, 1);
        win.setStatus();
      }
    });
  },
  find: function(id) {
    var window = _.where(this.allwindows, {id: this.session.server+':'+this.session.port+'/'+id});
    if(window.length > 1) this.parent.update('Found duplicate windows!!!!');

    if(window.length) return window[0];
    else return this.parent;
  },
  findTargetName: function(name) {
    var re = new RegExp(name, 'i');

    var window = _.filter(this.allwindows, function(win){
      // if(win.target.name === name) return win;
      if(win.target.name.match(re)) return win;
    });
    if(window.length > 1) this.parent.print('Found duplicate windows!!!!');

    if(window.length) return window[0];
    else return this.parent;
  },
  findTargetType: function(type) {
    var windows = _.filter(this.allwindows, function(win){
      if(win.target.type === type) return win;
    });
    return windows;
  },
  reFindShortId: function(re) {
    //var re = /^[^#]+/i;
    var windows = _.filter(this.allwindows, function(win) {
      if(win.shortId.match(re)) return win;
    });
    return windows;
  },
  findN: function(n) {
    if(this.allwindows[n]) return this.allwindows[n];
    else return null;
  },
  next: function() {
    var i = this.n;
    if(i == (this.allwindows.length-1)) { // at end
      i = 0;
    }
    else i++;

    if(this.session.window === this.session.allwindows[i]) return;

    this.uiWindow.hide();
    this.session.window = this.session.allwindows[i];
    this.session.window.uiWindow.focus();
    this.session.window.clearActivity();
  },
  prev: function() {
    var i = this.n;
    if(!i) { // at beginning
      i = this.allwindows.length-1;
    }
    else i--;

    if(this.session.window === this.session.allwindows[i]) return;

    this.uiWindow.hide();
    this.session.window = this.allwindows[i];
    this.allwindows[i].uiWindow.focus();
    this.session.window.clearActivity();
  },
  show: function(n) {
    if(this.allwindows[n]) {
      if(this.session.window === this.allwindows[n]) return;

      this.uiWindow.hide();
      this.session.window = this.allwindows[n];
      this.allwindows[n].uiWindow.focus();
      this.session.window.clearActivity();
    }
  }
};
