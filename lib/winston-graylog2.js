'use strict';

const util = require('util');
const winston = require('winston');
const common = require('winston/lib/winston/common');
const graylog2 = require('graylog2');
const _ = require('lodash');

/**
 * Remapping winston level on graylog
 *
 * @param  {String} winstonLevel
 * @return {String}
 */
let getMessageLevel = (function() {
  let levels = {
    emerg: 'emergency',
    alert: 'alert',
    crit: 'critical',
    error: 'error',
    warning: 'warning',
    warn: 'warning',
    notice: 'notice',
    info: 'info',
    debug: 'debug',
  };
  return function(winstonLevel) {
    return levels[winstonLevel] || levels.info;
  };
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
 * @param  {Object} staticMeta
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

let Graylog2 = (winston.transports.Graylog2 = function(options) {
  winston.Transport.call(this, options);

  options = options || {};
  this.graylog = _.get(options, 'graylog');
  if (!this.graylog) {
    this.graylog = {
      servers: [
        {
          host: 'localhost',
          port: 12201,
        },
      ],
    };
  }

  this.name = options.name || 'graylog2';
  this.silent = options.silent || false;
  this.handleExceptions = options.handleExceptions || false;
  this.json = options.json || false;
  this.colorize = options.colorize || false;
  this.label = options.label || null;
  this.prettyPrint = options.prettyPrint || false;
  this.timestamp = options.timestamp || true;
  this.logstash = options.logstash || null;
  this.depth = options.depth || null;
  this.showLevel = options.showLevel === undefined ? true : options.showLevel;
  if (this.json) {
    this.stringify = options.stringify;
  }
  this.processMeta =
    typeof options.processMeta === 'function'
      ? options.processMeta
      : _.identity;

  this.staticMeta = options.staticMeta || {};

  this.graylog2 = new graylog2.graylog(this.graylog); // TODO: Fix in relation to https://eslint.org/docs/rules/new-cap

  this.graylog2.on('error', function(error) {
    console.error('Error while trying to write to graylog2:', error);
  });
});

util.inherits(Graylog2, winston.Transport);

Graylog2.prototype.log = function(level, msg, meta, callback) {
  msg = common.log({
    level: level,
    message: msg,
    meta: meta,
    json: this.json,
    raw: this.raw,
    timestamp: this.timestamp,
    logstash: this.logstash,
    colorize: this.colorize,
    prettyPrint: this.prettyPrint,
    label: this.label,
    showLevel: this.showLevel,
    depth: this.depth,
    stringify: this.stringify,
    formatter: this.formatter,
    humanReadableUnhandledException: this.humanReadableUnhandledException,
  });
  meta = this.processMeta(prepareMeta(meta, this.staticMeta));

  this.graylog2[getMessageLevel(level)](msg.substring(0, 100), msg, meta);
  callback(null, true);
};

Graylog2.prototype.close = function() {
  this.graylog2.close();
};

module.exports = Graylog2;
