'use strict';

var assert = require('assert');
var winston = require('winston');
var WinstonGraylog2 = require('../lib/winston-graylog2.js');

describe('winstone-graylog2', function() {
  describe('Creating the trasport', function() {

    it('Have default properties when instantiated', function() {
      var winstonGraylog2 = new(WinstonGraylog2)();

      assert.ok(winstonGraylog2.name === 'graylog2');
      assert.ok(winstonGraylog2.level === 'info');
      assert.ok(winstonGraylog2.silent === false);
      assert.ok(winstonGraylog2.handleExceptions === false);
    });

    it('should have a log function', function() {
      var winstonGraylog2 = new(WinstonGraylog2)();
      assert.ok(typeof winstonGraylog2.log === 'function');
    });

    it('can be registered as winston transport', function() {
      var logger = new(winston.Logger)({
        exitOnError: false,
        transports: [new(WinstonGraylog2)()]
      });

      assert.ok(logger.transports.hasOwnProperty('graylog2'));
    });

    it('can be registered as winston transport using the add() function', function() {
      var logger = new(winston.Logger)({
        exitOnError: false,
        transports: []
      });

      logger.add(WinstonGraylog2);

      assert.ok(logger.transports.hasOwnProperty('graylog2'));
    });

  });
});