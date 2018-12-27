'use strict';

const Transport = require('winston-transport');
const {graylog: Graylog2ClientLibrary} = require('graylog2');
const _ = require('lodash');

/**
 * Remapping winston level on graylog
 *
 * @param  {String} winstonLevel
 * @return {String}
 */
const getMessageLevel = (function() {
  const levels = {
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
/** Class representing the Graylog2 Winston Transport */
class Graylog2 extends Transport {
  /**
   * Create the transport
   * @param {Object} options - The options for configuring the transport.
   */
  constructor(options) {
    super(options);

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
    this.exceptionsLevel = options.exceptionsLevel || 'not-default';

    this.silent = options.silent || false;
    this.handleExceptions = options.handleExceptions || false;
    this.prelog =
      typeof options.prelog === 'function' ? options.prelog : _.identity;
    this.processMeta =
      typeof options.processMeta === 'function'
        ? options.processMeta
        : _.identity;
    this.staticMeta = options.staticMeta || {};

    this.graylog2 = new Graylog2ClientLibrary(this.graylog);

    this.graylog2.on('error', function(error) {
      console.error('Error while trying to write to graylog2:', error);
    });
  }

  /**
   * Log a message to Graylog2.
   *
   * Winston3 only allows the level and message.
   *
   * Metadata is attached when using `winston.createLogger()`.
   *
   * Callbacks are no longer supported, but you can instead listen for winston to emit events.
   *
   * @param {string} level - The log level ('emergency', 'alert', 'critical', 'error', 'warning', 'warning', 'notice', 'info', 'debug').
   * @param {string} msg - The message to send.
   */
  log(level, msg) {
    msg = this.prelog(msg);
    this.graylog2[getMessageLevel(level)](msg.substring(0, 100), msg);
  }

  /**
   * Closes the Graylog2 Winston Transport.
   */
  close() {
    this.graylog2.close();
  }
}

module.exports = Graylog2;
