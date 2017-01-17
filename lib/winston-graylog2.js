'use strict';

var util = require('util');
var winston = require('winston');
var graylog2 = require('graylog2');
var _ = require('lodash');

/**
 * Remapping winston level on graylog
 *
 * @param  {String} winstonLevel
 * @return {String}
 */
var getMessageLevel = (function() {
  var levels = {
    emerg: 'emergency',
    alert: 'alert',
    crit: 'critical',
    error: 'error',
    warning: 'warning',
    warn: 'warning',
    notice: 'notice',
    info: 'info',
    debug: 'debug'
  };
  return function(winstonLevel) {
    return levels[winstonLevel] || levels.info;
  }
})();

/**
 * Preparing metadata for graylog
 * If we send a javascript `Error` object
 * to gray log we'll end up with the
 * `[object Object]` string.
 * To have our infos we need to get the stack out of the error.
 * Here we remap metadata to handle this kind of situation
 *
 * @param  {Object} meta
 * @return {Object}
 */
function prepareMeta(meta, staticMeta) {
  meta = meta || {};

  if (meta instanceof Error) {
    meta = {error: meta.stack};
  } else if (typeof meta === 'object') {
    meta = _.mapValues(meta, function(value) {
      if (value instanceof Error) {
        return value.stack;
      }

      return value;
    });
  }

  meta = _.merge(meta, staticMeta);

  return meta;
}

var Graylog2 = winston.transports.Graylog2 = function(options) {
  winston.Transport.call(this, options);

  options = options || {};
  this.graylog = _.get(options, 'graylog');
  if (!this.graylog) {
    this.graylog = {
      servers: [{
        host: 'localhost',
        port: 12201
      }]
    };
  }

  this.name = options.name || 'graylog2';
  this.silent = options.silent || false;
  this.handleExceptions = options.handleExceptions || false;
  this.prelog = (typeof options.prelog === 'function') ? options.prelog : _.identity;
  this.processMeta = (typeof options.processMeta === 'function') ? options.processMeta : _.identity;
  this.staticMeta = options.staticMeta || {};

  this.graylog2 = new graylog2.graylog(this.graylog);

  this.graylog2.on('error', function(error) {
    console.error('Error while trying to write to graylog2:', error);
  });
};

util.inherits(Graylog2, winston.Transport);

Graylog2.prototype.log = function(level, msg, meta, callback) {
  meta = this.processMeta(prepareMeta(meta, this.staticMeta));
  msg  = this.prelog(msg);

  this.graylog2[getMessageLevel(level)](msg.substring(0, 100), msg, meta);
  callback(null, true);
};

module.exports = Graylog2;
