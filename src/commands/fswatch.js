// /fswatch <file>|<dir> [<stop>]

// TODO: add feature to do customizable actions on fswatch events
// Currently, only prints to active or server window

var fs = require('fs');
var ink = require('../ui/ink');

var watchlist = [];

module.exports = {
    name: "fswatch",
    run: function (args) {
      var session = this;

      if(args.length) {
        if(args[0][0] === '/' || args[0][0] === '.') {
          var watcher = fs.watch(args[0], function (event, filename) {
            // console.log('event is: '+event);
            if(event === 'rename') {
              if(session.cfg.fswatch.announceRenameEvents) {
                session.window.print(ink.wtag + ' fswatch detected file rename:');
                session.window.print(ink.wtag + ' ' + filename);
              }
            } else if(event === 'change') {
              if(session.cfg.fswatch.announceModificationEvents) {
                session.window.print(ink.wtag + ' fswatch detected file modification:');
                session.window.print(ink.wtag + ' ' + filename);
              }
              if(session.cfg.fswatch.announceFileContents) {
                session.window.print(ink.wtag + ' fswatch: new file contents in: ' + filename);
                fs.readFile(args[0], 'utf8', function(err, data) {
                  if(err) session.window.print(ink.etag + ' Error' + err);
                  else session.window.print(ink.wtag + ' ' + data);
                });
              }
            }
            if (filename) {
              // console.log('filename provided:' + filename);
            } else {
              // console.log('filename not provided');
            }
          });
          watchlist.push({'watcher': watcher, 'path': args[0]});
          session.window.print(ink.wtag + ' Adding watch for path: ' + args[0]);
        }
        else { // no path provided, args[0] should be stopall
          if(args[0].toLowerCase() === 'stopall') {
            watchlist.forEach(function(o){
              o.watcher.close();
            });
            watchlist = [];
            session.window.print(ink.wtag + ' All watches have stopped.');
          }
        }
      } else { // no args provided, so list all the paths being watched
        if(watchlist.length) session.window.print(ink.wtag + ' Paths on watch:');
        else session.window.print(ink.wtag + ' No paths on watch.');
        watchlist.forEach(function(o){
          session.window.print(ink.wtag + ' ' + o.path);
        });
      }
    },
    help: function () {
      var session = this;
      session.window.print(ink.wtag + ' /fswatch Syntax:');
      session.window.print(ink.wtag + '   /fswatch [<file>|<dir> [<stop>]] [<stopall>]\n');
      session.window.print(ink.wtag + ' If no arguments are provided, fswatch will list all watched files/dirs.');
      session.window.print(ink.wtag + ' <file> or <dir> argument must begin with a path specification like . or /');
    },
    about: function () {
    }
};
