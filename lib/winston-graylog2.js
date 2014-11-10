'use strict';
var util = require('util'),
  winston = require('winston'),
  graylog2 = require('graylog2');

function getMessageLevel(winstonLevel) {
  var levels = {
    emerg: 'emergency',
    alert: 'alert',
    crit: 'critical',
    error: 'error',
    warning: 'warning',
    notice: 'notice',
    info: 'info',
    debug: 'debug'
  };

  return levels[winstonLevel] || levels.info;
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
  this.handleExceptions = options.handleExceptions || false;

  this.graylog2 = new graylog2.graylog(options.graylog);

  this.graylog2.on('error', function(error) {
    console.error('Error while trying to write to graylog2:', error);
  });
};

util.inherits(Graylog2, winston.Transport);

Graylog2.prototype.log = function(level, msg, meta, callback) {
  this.graylog2[getMessageLevel(level)](msg, meta);
  callback(null, true);
};

module.exports = Graylog2;