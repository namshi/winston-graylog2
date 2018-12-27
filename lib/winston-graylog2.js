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
    this.graylog2[getMessageLevel(level)](msg.substring(0, 100), msg);
  }

  /**
   * Log Emergency message
   * @param {string} msg - The message to send.
   */
  emerg(msg) {
    this.graylog2.emergency(msg.substring(0, 100), msg);
  }

  /**
   * Log Alert message
   * @param {string} msg - The message to send.
   */
  alert(msg) {
    this.graylog2.alert(msg.substring(0, 100), msg);
  }

  /**
   * Log Critical message
   * @param {string} msg - The message to send.
   */
  crit(msg) {
    this.graylog2.critical(msg.substring(0, 100), msg);
  }

  /**
   * Log Error message
   * @param {string} msg - The message to send.
   */
  error(msg) {
    this.graylog2.error(msg.substring(0, 100), msg);
  }

  /**
   * Log Warning message
   * @param {string} msg - The message to send.
   */
  warning(msg) {
    this.graylog2.warning(msg.substring(0, 100), msg);
  }

  /**
   * Log Warning message
   * @param {string} msg - The message to send.
   */
  warn(msg) {
    this.graylog2.warning(msg.substring(0, 100), msg);
  }

  /**
   * Log Notice message
   * @param {string} msg - The message to send.
   */
  notice(msg) {
    this.graylog2.info(msg.substring(0, 100), msg);
  }

  /**
   * Log Info message
   * @param {string} msg - The message to send.
   */
  info(msg) {
    this.graylog2.info(msg.substring(0, 100), msg);
  }

  /**
   * Log Debug message
   * @param {string} msg - The message to send.
   */
  debug(msg) {
    this.graylog2.debug(msg.substring(0, 100), msg);
  }

  /**
   * Closes the Graylog2 Winston Transport.
   */
  close() {
    this.graylog2.close();
  }
}

module.exports = Graylog2;
