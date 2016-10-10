
var ui;

exports.use = function(path) {

  ui = require(path);
  return ui;
}


exports.getUi = function() {
  return ui;
}
