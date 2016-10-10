

exports.get = function() {
  var d = new Date();
  var day = d.getDate().toString().length == 1 ? "0" + d.getDate() : d.getDate();
  var hours = d.getHours().toString().length == 1 ? "0" + d.getHours() : d.getHours();
  var mins = d.getMinutes().toString().length == 1 ? "0" + d.getMinutes() : d.getMinutes();
  var secs = d.getSeconds().toString().length == 1 ? "0" + d.getSeconds() : d.getSeconds();
  return day+'.'+hours+':'+mins+':'+secs;
}
