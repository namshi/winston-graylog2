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
      assert.deepEqual(
        winstonGraylog2.graylog, {
          servers: [{
            host: 'localhost',
            port: 12201
          }]
        }
      );
    });

    it('should have a log function', function() {
      var winstonGraylog2 = new(WinstonGraylog2)();
      assert.ok(typeof winstonGraylog2.log === 'function');
    });

    it('should have prelog function', function() {
      var winstonGraylog2 = new(WinstonGraylog2)();
      assert.ok(typeof winstonGraylog2.prelog === 'function');
    });

    it('should have filter by prelog function', function(done) {
      var msg = 'test';
      var winstonGraylog2 = new(WinstonGraylog2)();
      winstonGraylog2.graylog2.info = function(data) {
        assert.ok(msg === data);
        done();
      };
      winstonGraylog2.log('info', msg, {}, function(){});
    });

    it('should be able to set prelog function', function(done) {
      var msg = '  test  ';
      var winstonGraylog2 = new(WinstonGraylog2)({
        prelog: function(msg) {
          return msg.trim();
        }
      });
      winstonGraylog2.graylog2.info = function(data) {
        assert.ok(data === 'test');
        done();
      };
      winstonGraylog2.log('info', msg, {}, function(){});
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

    it('should set graylog configuration', function () {
      var graylogOptions = {
        servers: [{
          host: 'somehost',
          port: 22222
        }]
      };
      var winstonGraylog2 = new(WinstonGraylog2)({
        graylog: graylogOptions
      });
      assert.deepEqual(winstonGraylog2.graylog, graylogOptions);
    });
  });
});
