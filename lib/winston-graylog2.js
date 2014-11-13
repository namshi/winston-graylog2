'use strict';
var util = require('util'),
  winston = require('winston'),
  graylog2 = require('graylog2'),
  levelMap = {
    emerg: 'emergency',
    fatal: 'emergency',
    alert: 'alert',
    crit: 'critical',
    error: 'error',
    warning: 'warning',
    warn: 'warning',
    notice: 'notice',
    info: 'info',
    debug: 'debug'
  };
// ### @private function _messageLevelHelper ()
// Returns a function getMessageLevel() to give level

function getMessageLevel(winstonLevel) {
  winstonLevel = winstonLevel||"";
  var levels = levelMap;
  return levels[winstonLevel.toString()] || levels.info||'info';
}


var Graylog2 = winston.transports.Graylog2 = function(options) {
  options = options || {};
  options.graylog = options.graylog || {
    servers: [{
      'host': 'localhost',
      port: 12201
    }]
  };

  this.name = options.name || 'graylog2';
  this.level = options.level || 'info';
  this.silent = options.silent || false;
  options.levelMap = options.levelMap||{};
  levelMap = util._extend(options.levelMap,levelMap);
  // passing empty options.levelMap (options.levelMap={}) will result in all messages going to graylog2 as info
  this.handleExceptions = options.handleExceptions || false;

  this.getMessageLevel=getMessageLevel
  this.graylog2 = new graylog2.graylog(options.graylog);

  this.graylog2.on('error', function(error) {
    console.error('Error while trying to write to graylog2:', error);
  });
};

util.inherits(Graylog2, winston.Transport);

Graylog2.prototype.log = function(level, msg, meta, callback) {
  this.graylog2[this.getMessageLevel(level)](msg);
  callback(null, true);
};

module.exports = Graylog2;