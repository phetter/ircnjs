// ircnjs main.js

var Ui          = require('./ui/register').use('./blessed/blessed');
var ink         = require('./ui/ink');
var cfg         = require('./config/config.json');
var ui          = new Ui('Disconnected', 'Disconnected');

ui.print(cfg.name+' v'+cfg.version);
ui.print(ink.itag+' in k  im p o r t e d  '.trap.rainbow);
ui.print(ink.itag+' config imported '+' ........................  '.grey.bold+ink.brkt('OK'.green.bold));
ui.print(ink.itag+' zui initialized '+' ........................  '.grey.bold+ink.brkt('OK'.green.bold));

var commands    = require('./commands/commands');
ui.print(ink.itag+' commands imported ('+commands.getLength()+') ..................  '.grey.bold+ink.brkt('OK'.green.bold));

var Session     = require('./irc/session');
ui.print(ink.itag+' session imported '+' .......................  '.grey.bold+ink.brkt('OK'.green.bold));
ui.print(ink.itag+' S Y S T E M   R E A D Y'.trap.green.bold);

var session = new Session(cfg, ui);

ui.addListener(function(userInput) {
  if(userInput.action)
    session.action(userInput.action);
  else if(userInput.data[0] === '/')
    commands.parse.call(session, userInput.data);
  else if(session.window.target.name) {
    session.irc.client.say(session.window.target.name, userInput.data);
    var window = session.window.findTargetName(session.window.target.name);
    if(window.id !== session.window.parent.id) {
      var lab;
      if(window.target.type === 'user') lab = '<'; else lab = '< ';
      window.print(lab + session.userName+'> ' + userInput.data);
    }
  }
});
