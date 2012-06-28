// winston-graylog2-test.js: Tests for instances of the graylog2 transport

var vows = require('vows');
var assert = require('assert');
var winston = require('winston');
var helpers = require('winston/test/helpers');
var Graylog2 = require('../lib/winston-graylog2').Graylog2;

var transport = new (Graylog2)({graylogHostname: 'localhost'});

function assertGraylog2 (transport) {
  assert.instanceOf(transport, Graylog2);
  assert.isFunction(transport.log);
}

vows.describe('winston-graylog2').addBatch({
 "An instance of the Mail Transport": {
   "should have the proper methods defined": function () {
     assertGraylog2(transport);
   },
   "the log() method": helpers.testNpmLevels(transport, "should log messages to Graylog2", function (ign, err, logged) {
     assert.isTrue(!err);
     assert.isTrue(logged);
   })
 }
}).export(module);