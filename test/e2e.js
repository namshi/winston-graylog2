'use strict';

const assert = require('assert');
const winston = require('winston');
const {format} = require('logform');
const WinstonGraylog2 = require('../lib/winston-graylog2.js');

const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
socket.bind(12201, '127.0.0.1');

const options = {
  name: 'wgl-example',
  level: 'debug',
  silent: false,
  graylog: {
    servers: [{host: 'localhost', port: 12201}],
  },
  staticMeta: {
    me: 'you',
  },
};

const logger = winston.createLogger({
  level: 'debug',
  levels: {
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warn: 4,
    notice: 5,
    info: 6,
    debug: 7,
  },
  format: format.combine(format.errors({stack: true}), format.metadata()),
  transports: [new WinstonGraylog2(options)],
});

socket.on('listening', () => {
  let emergCheck;
  let alertCheck;
  let critCheck;
  let errorCheck;
  let warnCheck;
  let noticeCheck;
  let infoCheck;
  let debugCheck;
  const listeners = [];
  const notifyListeners = (msg) => {
    listeners.forEach((listener) => listener(msg));
  };

  socket.on('message', (msg) => {
    const message = JSON.parse(msg.toString());
    if (message.level === 0) emergCheck = message;
    if (message.level === 1) alertCheck = message;
    if (message.level === 2) critCheck = message;
    if (message.level === 3) errorCheck = message;
    if (message.level === 4) warnCheck = message;
    if (message.level === 5) noticeCheck = message;
    if (message.level === 6) infoCheck = message;
    if (message.level === 7) debugCheck = message;
    notifyListeners(message);
  });

  logger.emerg('emergency dude');
  logger.alert('alert me');
  logger.crit('critical engines');
  logger.error(new Error('Fake Error'));
  logger.warn('warning noise');
  logger.notice('notice me senpai', {some: 'thing'});
  logger.info('info achieved', {hi: 'there'});
  logger.debug('debug something', {everything: 1});

  describe('End-to-End test of winston-graylog2', function(done) {
    it('should send emergency message with static metadata', () => {
      assert.equal(emergCheck.short_message, 'emergency dude');
      assert.equal(emergCheck._me, 'you');
    });
    it('should send alert message', () => {
      assert.equal(alertCheck.short_message, 'alert me');
    });
    it('should send critical message', () => {
      assert.equal(critCheck.short_message, 'critical engines');
    });
    it('should send error message', () => {
      assert.equal(errorCheck.short_message, 'Fake Error');
      assert(errorCheck._stack);
    });
    it('should send warn message', () => {
      assert.equal(warnCheck.short_message, 'warning noise');
    });
    it('should send notice message with metadata', () => {
      assert.equal(noticeCheck.short_message, 'notice me senpai');
      assert.equal(noticeCheck._some, 'thing');
    });
    it('should send info message with metadata', () => {
      assert.equal(infoCheck.short_message, 'info achieved');
      assert.equal(infoCheck._hi, 'there');
    });
    it('should send debug message with metadata', () => {
      assert.equal(debugCheck.short_message, 'debug something');
      assert.equal(debugCheck._everything, 1);
    });
    it('should send notice message with metadata', () => {
      assert.equal(noticeCheck.short_message, 'notice me senpai');
      assert.equal(noticeCheck._some, 'thing');
    });
    describe('Message handling', function() {
      it('should send __id when id is in metadata', (done) => {
        const id = Math.random();
        const extra = {id};
        const cb = (msg) => {
          if (msg.__id === id) {
            listeners.splice(listeners.find(cb), 1);
            done();
          }
        };
        listeners.push(cb);
        logger.debug('', extra);
      });
      it('should send empty string for null message', (done) => {
        const extra = {id: Math.random()};
        const cb = (msg) => {
          if (msg.__id === extra.id) {
            assert.equal(msg.short_message, '');
            assert.equal(msg.full_message, '');
            listeners.splice(listeners.find(cb), 1);
            done();
          }
        };
        listeners.push(cb);
        logger.debug(null, extra);
      });
    });
    after(() => socket.close(done));
  });
});
