'use strict';

const Transport = require('winston-transport');
const {graylog: Graylog2Client} = require('graylog2');

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
    this.graylog = options.graylog;
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

    this.graylog2Client = new Graylog2Client(this.graylog);
    this.staticMeta = options.staticMeta || {};

    this.graylog2Client.on('error', function(error) {
      console.error('Error while trying to write to graylog2:', error);
    });
  }

  /**
   * Log a message to Graylog2.
   *
   * @param {Object} info - An object containing the `message` and `info`.
   * @param {function} callback - Winston's callback to itself.
   */
  log(info, callback) {
    let {message, level, metadata} = info;

    // To support properties not marked as metadata
    if (typeof info.metadata !== 'object') {
      metadata = Object.assign({}, info);
    }
    const meta = Object.assign({}, metadata, this.staticMeta);
    const cleanedMessage = message || '';
    const shortMessage = cleanedMessage.substring(0, 100);

    // prettier-ignore
    setImmediate(() => {
      this.graylog2Client[getMessageLevel(level)](shortMessage, cleanedMessage, meta);
    });
    callback();
  }

  /**
   * Closes the Graylog2 Winston Transport.
   */
  close() {
    this.graylog2Client.close();
  }
}

module.exports = Graylog2;
