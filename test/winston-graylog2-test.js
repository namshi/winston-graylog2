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
      assert.ok(typeof winstonGraylog2.levelMap === 'object');
      assert.ok(typeof winstonGraylog2.getMessageLevel==='function');
      assert.ok(typeof winstonGraylog2.graylog2==='object');
      assert.ok(winstonGraylog2.handleExceptions === false);
    });

    it('should support custom level mapping',function(){
      var winstonGraylog2 = new(WinstonGraylog2)({
        levelMap:{
          info:"info",
          warn:"warning",
          fatal:"emergency",
          someCustomLevel:"info",
          someOtherCustomLevel:"error"
        }});
      assert.ok(typeof winstonGraylog2.getMessageLevel()==='string','Test for empty parameter');
      assert.ok(winstonGraylog2.getMessageLevel(230)==='info','Test for non string parameter');
      assert.ok(winstonGraylog2.getMessageLevel('info')==='info','Test for parameter provided in levelMap');
      assert.ok(winstonGraylog2.getMessageLevel('someCustomLevel')==='info','Test for parameter provided in levelMap');
      assert.ok(winstonGraylog2.getMessageLevel('someOtherCustomLevel')==='error','Test for parameter provided in levelMap');
      assert.ok(winstonGraylog2.getMessageLevel('weirdLevel')==='info','Test for parameter not provided in levelMap');

      var winstonGraylog2 = new(WinstonGraylog2)({
        levelMap:{
          warn:"warning"
        }});
      assert.ok(winstonGraylog2.getMessageLevel('unknown')==='info');
      assert.ok(winstonGraylog2.getMessageLevel('warn')==='warning');
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