// winston-graylog2.js: Transport for outputting logs over UDP to Graylog2
var util = require('util'),
  winston = require('winston'),
  compress = require('compress-buffer').compress,
  dgram = require('dgram');


var Graylog2 = exports.Graylog2 = winston.transports.Graylog2 = function (options) {
    this.name = 'graylog2';
    this.level = options.level || 'info';
    this.silent     = options.silent     || false;
    this.handleExceptions = options.handleExceptions || false;

    this.graylogHost = options.graylogHost || 'localhost';
    this.graylogPort = options.graylogPort || 12201;
    this.graylogHostname = options.graylogHostname || require('os').hostname();
    this.graylogFacility = options.graylogFacility || 'nodejs';
    this.graylogSequence = 0;
};

util.inherits(Graylog2, winston.Transport);

var getMessageLevel = function (winstonLevel) {
    var mappings = {
        "debug" : 7,
        "info" : 6,
        "error" : 2
    };

    if (typeof winstonLevel === "number") {
        return winstonLevel;
    }
    return mappings[winstonLevel] || 6;
};

Graylog2.prototype.log = function (level, msg, meta, callback) {
    var self = this, message = {}, key;

    if (self.silent) {
        return callback(null, true);
    }

    // Must be in this format: https://github.com/Graylog2/graylog2-docs/wiki/GELF
    message.version = "1.0";
    message.timestamp = +new Date()/1000 >> 0;
    message.host = self.graylogHostname;
    message.facility = self.graylogFacility;
    message.short_message = msg;
    message.full_message = meta || {};
    message.level = getMessageLevel(level);

    if (!!meta) {
        for (key in meta) {
            if (key != 'id') {
                message['_'+key] = meta[key];
            }
        }
    }

    var compressedMessage = compress(new Buffer(JSON.stringify(message)));

    if (compressedMessage.length > 8192) {
        return callback(new Error("Log message size > 8192 bytes not supported."), null);
    }

    try {
        var udpClient = dgram.createSocket('udp4');
        udpClient.send(compressedMessage, 0, compressedMessage.length, self.graylogPort, self.graylogHost, function (err, bytes) {
            if (err) {
                return callback(err, null);
            }
            udpClient.close();
            return callback(null, true);
        });
    } catch (e) {
        return callback(e, null);
    }
};