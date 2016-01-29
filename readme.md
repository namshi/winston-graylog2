# winston-graylog2 [![Build Status](https://secure.travis-ci.org/flite/winston-graylog2.png)](http://travis-ci.org/flite/winston-graylog2)

A [graylog2][0] transport for [winston][1] based on the [node-graylog2][2] Library

## Installation

Tested on node-0.10.x, requires npm.

``` sh
  $ npm install winston
  $ npm install winston-graylog2
```

## Usage
```javascript
  var winston = require('winston');
  winston.add(require('winston-graylog2'), options);

```

or

```javascript
var WinstonGraylog2 = require('winston-graylog2');
var logger = new(winston.Logger)({
        exitOnError: false,
        transports: [new(WinstonGraylog2)(options)]
      });
```

## Options

* __name__:  Transport name
* __level__: Level of messages this transport should log. (default: info)
* __silent__: Boolean flag indicating whether to suppress output. (default: false)
* __handleExceptions__: Boolean flag, whenever to handle uncaught exceptions. (default: false)
* __prelog__: Pre-filtering function, to clean message before sending to graylog2 (default: empty function)
* __graylog__:
  - __servers__; list of graylog2 servers
    * __host__: your server address (default: localhost)
    * __port__: your server port (default: 12201)
  - __hostname__: the name of this host (default: os.hostname())
  - __facility__: the facility for these log messages (default: "Node.js")
  - __bufferSize__: max UDP packet size, should never exceed the MTU of your system (default: 1400)
  - __staticMeta__: meta data to be always used by each logging message, for instance environment (development, staging, live)


example:

```javascript
{
  name: 'Graylog'
  level: 'debug',
  silent: false,
  handleExceptions: false,
  prelog: function(msg) {
    return msg.trim();
  },
  graylog: {
    servers: [{host: 'localhost', port: 12201}, {host: 'remote.host', port: 12201}],
    hostname: 'myServer',
    facility: 'myAwesomeApp',
    bufferSize: 1400,
    staticMeta: {env: 'staging'}
  }
}
```

## Log Levels
Supported log levels, as from [node-graylog2][2], are the following

Winston Level | Graylog2 level
---------------|---------------
emerg          | emergency
alert          | alert
crit           | critical
error          | error
warning        | warning
notice         | notice
info           | info
debug          | debug

**All other possibile winston's level, or custom levels, will default to `info`**

[0]: http://www.graylog2.org
[1]: https://github.com/flatiron/winston
[2]: https://github.com/Wizcorp/node-graylog2
