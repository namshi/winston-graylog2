// winston-graylog2.js: Transport for outputting logs over UDP to Graylog2
var util = require('util'),
  winston = require('winston'),
  compress = require('compress-buffer').compress,
  dgram = require('dgram');


var Graylog2 = exports.Graylog2 = winston.transports.Graylog2 = function (options) {
    this.name = options.name || 'graylog2';
    this.level = options.level || 'info';
    this.silent     = options.silent     || false;
    this.handleExceptions = options.handleExceptions || false;
    this.udpClient = dgram.createSocket('udp4');
    this.udpClient.on('error', function (err) { 
        // Handle any suprise errors
        util.error(err); 
    }); 

    this.graylogHost = options.graylogHost || 'localhost';
    this.graylogPort = options.graylogPort || 12201;
    this.graylogHostname = options.graylogHostname || require('os').hostname();
    this.graylogFacility = options.graylogFacility || 'nodejs';
    this.graylogSequence = 0;
};

util.inherits(Graylog2, winston.Transport);

var getMessageLevel = function (winstonLevel) {
    switch (winstonLevel) {                                                                                                   
        case 'silly':
        case 'debug': return 7
        case 'verbose':
        case 'data':
        case 'prompt':
        case 'input':
        case 'info': return 6
        case 'help':
        case 'notice': return 5
        case 'warn':
        case 'warning': return 4
        case 'error': return 3
        case 'crit': return 2
        case 'alert': return 1
        case 'emerg': return 0
        default: return 6
    }
};

Graylog2.prototype.log = function (level, msg, meta, callback) {
    var self = this, message = {}, key;

    if (self.silent) {
        return callback(null, true);
    }

    // Must be in this format: https://github.com/Graylog2/graylog2-docs/wiki/GELF
    message.version = "1.0";
    message.timestamp = +new Date()/1000;
    message.host = self.graylogHostname;
    message.facility = self.graylogFacility;
    message.short_message = msg;
    message.full_message = meta || {};
    message.level = getMessageLevel(level);

    if (!!meta) {
        for (key in meta) {
            if (key !== 'id') {
                message['_'+key] = meta[key];
            }
        }
    }

    var compressedMessage = compress(new Buffer(JSON.stringify(message)));

    if (compressedMessage.length > 8192) {
        return callback(new Error("Log message size > 8192 bytes not supported."), null);
    }

    this.udpClient.send(compressedMessage, 0, compressedMessage.length, self.graylogPort, self.graylogHost, function (err, bytes) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, true);
        }
    });
};
