'use strict';

const assert = require('assert');
const winston = require('winston');
const WinstonGraylog2 = require('../lib/winston-graylog2.js');

describe('winston-graylog2', function() {
  describe('Creating the trasport', function() {
    it('should have default properties when instantiated', function() {
      const winstonGraylog2 = new WinstonGraylog2();

      assert.ok(winstonGraylog2.name === 'graylog2');
      assert.ok(winstonGraylog2.level === undefined);
      assert.ok(winstonGraylog2.silent === false);
      assert.ok(winstonGraylog2.handleExceptions === false);
      assert.deepEqual(winstonGraylog2.graylog, {
        servers: [
          {
            host: 'localhost',
            port: 12201,
          },
        ],
      });
    });

    it('should allow properties to be set when instantiated', function() {
      const options = {
        name: 'not-default',
        level: 'not-default',
        graylog: {
          servers: [
            {
              host: '127.0.0.1',
              port: 12202,
            },
          ],
        },
      };
      const winstonGraylog2 = new WinstonGraylog2(options);

      assert.ok(winstonGraylog2.name === options.name);
      assert.ok(winstonGraylog2.level === options.level);
      assert.deepEqual(winstonGraylog2.graylog, options.graylog);
    });

    it('should allow Winston properties to be set when instantiated', function() {
      const options = {
        handleExceptions: true,
        exceptionsLevel: 'not-default',
      };
      const winstonGraylog2 = new WinstonGraylog2(options);

      assert.ok(winstonGraylog2.handleExceptions === options.handleExceptions);
      assert.ok(winstonGraylog2.exceptionsLevel === options.exceptionsLevel);
    });

    it('should have a log function and functions for each logging level', function() {
      const winstonGraylog2 = new WinstonGraylog2();
      assert.ok(typeof winstonGraylog2.log === 'function');
    });

    it('can be registered as winston transport', function() {
      const logger = winston.createLogger({
        exitOnError: false,
        transports: [new WinstonGraylog2()],
      });

      assert.ok(logger._readableState.pipes.hasOwnProperty('graylog2Client'));
    });

    it('can be registered as winston transport using the add() function', function() {
      const logger = winston.createLogger({
        exitOnError: false,
        transports: [],
      });

      logger.add(new WinstonGraylog2());

      assert.ok(logger._readableState.pipes.hasOwnProperty('graylog2Client'));
    });

    it('should set graylog configuration', function() {
      const graylogOptions = {
        servers: [
          {
            host: 'somehost',
            port: 22222,
          },
        ],
      };
      const winstonGraylog2 = new WinstonGraylog2({
        graylog: graylogOptions,
      });
      assert.deepEqual(winstonGraylog2.graylog, graylogOptions);
    });
  });
});
