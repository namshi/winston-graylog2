'use strict';

const assert = require('assert');
const winston = require('winston');
const WinstonGraylog2 = require('../lib/winston-graylog2.js');

describe('winstone-graylog2', function() {
  describe('Creating the trasport', function() {
    it('should have default properties when instantiated', function() {
      let winstonGraylog2 = new WinstonGraylog2();

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
      let options = {
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
      let winstonGraylog2 = new WinstonGraylog2(options);

      assert.ok(winstonGraylog2.name === options.name);
      assert.ok(winstonGraylog2.level === options.level);
      assert.deepEqual(winstonGraylog2.graylog, options.graylog);
    });

    it('should allow Winston properties to be set when instantiated', function() {
      let options = {
        handleExceptions: true,
        exceptionsLevel: 'not-default',
      };
      let winstonGraylog2 = new WinstonGraylog2(options);

      assert.ok(winstonGraylog2.handleExceptions === options.handleExceptions);
      assert.ok(winstonGraylog2.exceptionsLevel === options.exceptionsLevel);
    });

    it('should have a log function', function() {
      let winstonGraylog2 = new WinstonGraylog2();
      assert.ok(typeof winstonGraylog2.log === 'function');
    });

    it('should have prelog function', function() {
      let winstonGraylog2 = new WinstonGraylog2();
      assert.ok(typeof winstonGraylog2.prelog === 'function');
    });

    it('should have filter by prelog function', function(done) {
      let msg = 'test';
      let winstonGraylog2 = new WinstonGraylog2();
      winstonGraylog2.graylog2.info = function(data) {
        assert.ok(msg === data);
        done();
      };
      winstonGraylog2.log('info', msg, {}, function() {});
    });

    it('should be able to set prelog function', function(done) {
      let msg = '  test  ';
      let winstonGraylog2 = new WinstonGraylog2({
        prelog: function(msg) {
          return msg.trim();
        },
      });
      winstonGraylog2.graylog2.info = function(data) {
        assert.ok(data === 'test');
        done();
      };
      winstonGraylog2.log('info', msg, {}, function() {});
    });

    it('can be registered as winston transport', function() {
      let logger = new winston.Logger({
        exitOnError: false,
        transports: [new WinstonGraylog2()],
      });

      assert.ok(logger.transports.hasOwnProperty('graylog2'));
    });

    it('can be registered as winston transport using the add() function', function() {
      let logger = new winston.Logger({
        exitOnError: false,
        transports: [],
      });

      logger.add(WinstonGraylog2);

      assert.ok(logger.transports.hasOwnProperty('graylog2'));
    });

    it('should set graylog configuration', function() {
      let graylogOptions = {
        servers: [
          {
            host: 'somehost',
            port: 22222,
          },
        ],
      };
      let winstonGraylog2 = new WinstonGraylog2({
        graylog: graylogOptions,
      });
      assert.deepEqual(winstonGraylog2.graylog, graylogOptions);
    });

    it('should have a processMeta function', function() {
      let winstonGraylog2 = new WinstonGraylog2();
      assert.ok(typeof winstonGraylog2.processMeta === 'function');
    });

    it('should be able to set the processMeta function', function() {
      let extension = {foo: 'bar'};
      let winstonGraylog2 = new WinstonGraylog2({
        processMeta: function(meta) {
          meta.testAttribute = extension;
          delete meta.baz;
          return meta;
        },
      });
      winstonGraylog2.graylog2.info = function(msg, _, meta) {
        assert.equal(extension, meta.testAttribute);
        assert.equal(undefined, meta.baz);
      };

      winstonGraylog2.log('info', 'alog', {baz: 'boo'}, function() {});
    });
  });
});
