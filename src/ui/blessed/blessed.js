/*  blessed window abstraction
    zui nodejs ui

    fetter (cc) 2015

    TODO: add max scrollback
*/

// var top     = require('./top');
var blessed = require('blessed');
var events  = require('events');
var history = require('./history');
var keycfg  = require('../../config/keys.json');
var date    = require('../../date').get;


var ee;
var screen = blessed.screen({
  smartCSR: true
});

ee = new events.EventEmitter();

module.exports = BlessedWindow;

function BlessedWindow(title, status) {
  var self              = this;
  this._title           = title;
  this._status          = status;
  this._output          = "";
  this._editedCmd       = false;
  this._userScrollPerc  = 100;

  this.uistate = {window: 'init', status: 'init', data: '', action: ''};

  self.prompt = blessed.Textbox({
    parent: screen,
    // bottom: 0,
    top: '100%-2',
    left: '0%',
    // height: '50',
    width: '100%',
    //height: '10',
    shrink: "shrink",
    tags: true,
    //keys: true,
    inputOnFocus: true,
    // inputOnFocus: true,
    label: self._status,
    autoFocus: false,
    // focused: true,
    border: {
      // type: 'line'
    },
    style: {
         fg: "white"
      ,  border: { fg: "red"}
      ,  hover:  { border: { fg: "green"}}
      ,  focus:  { border: { fg: "green"}}
      }
  });

  self.display = blessed.box({
    parent: screen,
    top: 0,
    left: '0%',
    width: '100%',
    height: '100%-1',
    //shrink: "grow",
    tags: true,
    scrollable: true,
    clickable: false,
    alwaysScroll: false,
    input: true,
    mouse: true,
    scrollbar: {
      ch: ' '
    },
    label: self._title,
    border: {
      // type: 'line'
    },
    style: {
         fg: "white"
      ,  border: { fg: "red"}
      ,  hover:  { border: { fg: "green"}}
      ,  focus:  { border: { fg: "green"}}

      ,  scrollbar: {
        // ch: '',
        // inverse: true
      }
      }
  });

  screen.append(self.display);
  screen.append(self.prompt);

  self.display.setScrollPerc(100);

  self.prompt.key('home', function(data) {
    self.display.setScrollPerc(0);
    self._userScrollPerc = 0;
    screen.render();
  });

  self.prompt.key('end', function(data) {
    self.display.setScrollPerc(100);
    self._userScrollPerc = 100;
    screen.render();
  });

  self.prompt.on('keypress', function(ch, key) {
    if(key.name != "up" && key.name != "down") { // handle editing command from history
      if(history.selected() && !self._editedCmd) {
        self._editedCmd = true;
        self.prompt.setValue(history.selected().cmd);
        screen.render();
      }
    }
    else self._editedCmd = false;
  });

  self.display.on('mouse', function(data) {
    if(data.action === 'wheelup') {
      self.display.scroll(-self.display.height);
      self._userScrollPerc = self.display.getScrollPerc();
      screen.render();
    } else if(data.action === 'wheeldown') {
      self.display.scroll(self.display.height);
      self._userScrollPerc = self.display.getScrollPerc();
      screen.render();
    }
  });

  // If box is focused, handle `enter`/`return` and give us some more content.
  self.prompt.key('enter', function(ch, key) {
    // if(history.selected()) {
    //   self.handleCmd(history.selected().cmd);
    //   self.prompt.setContent('');
    //   history.unselect();
    //   // self.prompt.focus();
    // }
    // else {
    //   self.readInput(self.handleCmd);
    //   self.prompt.clearValue();
    // }
    // self.print('enter press!');
    self.prompt.submit();
    // screen.render();
  });

  self.prompt.on('submit', function(data) {
    self.prompt.clearValue();
    screen.render();
    self.handleCmd(data);
    // the last command couldve hidden us if command was a window switch, so only focus if not
    // if(!self.prompt.focused && !self.prompt.hidden) self.prompt.focus();
    if(self.prompt.visible) self.prompt.focus();
  });

  self.prompt.on('show', function(){
    // self.print(date()+' show event '+self._title+'\n');
  });

  self.prompt.on('hide', function(){
    // self.print(date()+' hide event '+self._title+'\n');
  });

  self.prompt.on('focus', function(){
    // self.print(date()+' focus event '+self._title);
  });


  self.prompt.key('up', function(ch, key) {
    var o = history.selectPrev();

    if(o) {
      self.prompt.setContent(o.formatted);
      screen.render();
      self.readInput(self.handleCmd);
    }
  });

  self.prompt.key('down', function(ch, key) {
    var o = history.selectNext();

    if(o) {
      self.prompt.setContent(o.formatted);
      screen.render();
      self.readInput(self.handleCmd);
    }
    else {
      self.prompt.setContent('');
      screen.render();
    }
  });

  self.prompt.key('escape', function(ch, key) {
    // self.readInput(self.handleCmd);
    screen.render();
  });

  self.prompt.key([keycfg.window.previous], function(ch, key) {
    self.emitAction('window prev');
  });

  self.prompt.key([keycfg.window.next], function(ch, key) {
    self.emitAction('window next');
  });

  self.prompt.key([keycfg.window.new], function(ch, key) {
    self.emitAction('window new');
  });

  self.prompt.key([keycfg.window.kill], function(ch, key) {
    self.emitAction('window kill');
  });

  self.prompt.key(['M-1','M-2','M-3','M-4','M-5','M-6','M-7','M-8','M-9'], function(ch, key) {
    // self.print(ch + ' ' + key.name);
    self.emitAction(key.name);
  });

  self.prompt.key(['C-c'], function(ch, key) { // ctrl-c
    return process.exit(0);
  });

  self.prompt.key('pageup', function(data) {
    self.display.scroll(-self.display.height);
    self._userScrollPerc = self.display.getScrollPerc();
    screen.render();
  });

  self.prompt.key('pagedown', function(data) {
    self.display.scroll(self.display.height);
    self._userScrollPerc = self.display.getScrollPerc();
    screen.render();
  });

  screen.on('resize', function() { screen.render(); });

  screen.render();
}


BlessedWindow.prototype = {
  readInput: function(callback) {
    var self = this;
    self.prompt.readInput(function(err, data) {
      if(err) {
        self.print('Error: '+err);
        return;
      }

      if(history.selected()) history.unselect();

      // prompt.clearValue();
      screen.render();
      callback.call(self, data);
    });
  },
  // Share the user input with any command interperters, etc.
  emitInput: function(data) {
    var self = this;
    //if(uistate === undefined) uistate = {window: 'init', status: 'init', data: d};
    self.uistate.data = data;
    ee.emit('zuiCon', self.uistate);
    // var test = {window: 'init', status: 'init', data: data};
    // ee.emit('zuiCon', test);
  },
  emitAction: function(action) {
    var self = this;
    self.uistate.action = action;
    ee.emit('zuiCon', self.uistate);
    self.uistate.action = '';
  },
  handleCmd: function(cmd) {
    var self = this;
    if(cmd) {
      history.add(cmd);
      self.emitInput(cmd);// send cmd package to consumers
      //print(cmd);
    }
  },
  update: function(window, data) { // update ui
    var self = this;
    if(window.title) {
      self.display.setLabel({text: window.title});
      self._title = window.title;
    }

    if(window.status) {
      self.prompt.setLabel({text: window.status});
      self._status = window.status;
    }

    if(window.activity.length)
      self.prompt.setLabel({text: self._status + ' Act: ' + window.activity.join(', ')});

    if(data) self.print(date() + ' ' + data);
    screen.render();
  },
  print: function(data) { // send data to output display area with additional \n
    // TODO: add max scrollback config options in start(). Currently, infinite (eats mem)

    // var self = this;
    // self._output+=data+"\n";

    // self.display.setContent(self._output);
    this.display.pushLine(data);

    if(this._userScrollPerc === 100) this.display.setScrollPerc(100);
    screen.render();
  },
  write: function(data) { // send data to output display area with no additional \n
    // TODO: add max scrollback config options in start(). Currently, infinite (eats mem)
    var self = this;
    self._output+=data;

    self.display.setContent(self._output);

    if(self._userScrollPerc == 100) self.display.setScrollPerc(100);
    screen.render();
  },
  // Call this with a callback(data) to handle any input provided by user to zui.
  addListener: function(callback) {
    ee.on('zuiCon', callback);
    // ee.on('zuiData', callback);
  },
  removeListener: function (callback) {
    ee.removeListener('zuiCon', callback);
  },
  focus: function () {
    var self = this;
    // self.print(date()+' user attempting focus(ui): '+self._title+'\n');

    // if(!self.prompt.focused) { // !! FOCUS BEFORE SHOW TO AVOID DOUBLE ECHO BUG
    //   self.prompt.focus();
    //   // self.print(date()+' user focused(ui): '+self._title+'\n');
    // }

    if(!self.prompt.visible ) {
      self.prompt.focus();
      self.display.show();
      self.prompt.show();
      // self.print(date()+' user showed(ui): '+self._title+'\n');
    }
    screen.render();
  },
  hide: function (callback) {
    var self = this;
    // self.print(date()+' user attempting hide(ui): '+self._title+'\n');

    if(self.prompt.visible) {
      // self.print(date()+' user hid(ui): '+self._title+'\n');
      // if we don't focusPop(), hide() may rewindFocus() and cause double echo?
      screen.focusPop();
      self.display.hide();
      self.prompt.hide();
    }
    screen.render();
    if(callback) callback();
  },
  close: function() {
    this.display.destroy();
    this.prompt.destroy();
  }
}
