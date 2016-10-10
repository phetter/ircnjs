// commands.js - Parse IRC commands

var ink = require('../ui/ink');

exports.parse = parse;
exports.getLength = getLength;

// TODO: invite, ctcp, kill, notice, whois, channellist
// /ban /query, /away
// new window, new server

var cmds = {
  // IRC comamnds
              join:       require('./join'),
              j:          require('./join'),
              part:       require('./part'),
              p:          require('./part'),
              connect:    require('./connect'),
              disconnect: require('./disconnect'),
              quit:       require('./quit'),
              msg:        require('./msg'),
              nick:       require('./nick'),
              ping:       require('./ping'),
              op:         require('./op'),
              deop:       require('./deop'),
              oper:       require('./oper'),
              mode:       require('./mode'),
              names:      require('./names'),
              n:          require('./names'),
              kick:       require('./kick'),
              k:          require('./kick'),
              voice:      require('./voice'),
              topic:      require('./topic'),
              t:          require('./topic'),
              action:     require('./action'),
              me:         require('./action'),
              fswatch:    require('./fswatch'),
              fsw:        require('./fswatch'),
              emsg:       require('./emsg'),
              help:       {run: function() { cmds[selector].help(); } }
  // Window commands
};

function getLength() {
  var n = 0;
  for(var key in cmds) ++n;
  return n;
}

function parse(cmd) {
  var session = this;
  var args = cmd.split(' ');
  var selector = args.shift();
  selector = selector.slice(1, selector.length); // trim leading /

  if(cmds[selector]) cmds[selector].run.call(session, args);
  else session.window.print(ink.etag + ' Command not found. Try /help');
}
