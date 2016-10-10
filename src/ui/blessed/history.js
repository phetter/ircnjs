// history.js -- manage ui command history

// var cfg     = require('../config.js');

// var maxhist = cfg.OPTS.OPS.MAX_COMMAND_HISTORY;

var maxhist = 100;

var list = [];
var index = list.length; // initialize to the end


exports.selected        = selected;
exports.unselect        = unselect;
exports.add             = add;
exports.getLatestAsObj  = getLatestAsObj;
exports.selectNext      = selectNext;
exports.selectPrev      = selectPrev;
exports.selectFirst     = selectFirst;


function selected() { // check if a history item is selected
  if(list[index]) return list[index]; else return false;
}

function unselect() { // remove any selections - cause selected() to return false
  index = list.length;
}

function add(cmd) { // add command to history
  var o         = {};
  o.num         = list.length;
  o.cmd         = cmd;
  o.formatted   = o.num + ": " + cmd;

  if((maxhist > 0) && (list.length >= maxhist)) list.shift();

  list.push(o);
  unselect();
}

function getLatestAsObj() { // return the latest command as a json object
  var cmd       = list[list.length-1].cmd;
  var cmdparts  = cmd.split(" ");
  var arg0      = cmdparts.shift();
  var args      = [];

  cmdparts.forEach(function(part) {
    if(part) args.push(part);
  });
  return {"cmd": arg0, "args": args};
}

function selectNext() {
  if(index < list.length) index++;
  return list[index];
}

function selectPrev() {
  if(index > 0) index--;
  return list[index];
}

function selectFirst() { index = 0; }
