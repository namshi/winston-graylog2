[![Build Status](https://secure.travis-ci.org/namshi/winston-graylog2.png)](http://travis-ci.org/namshi/winston-graylog2)

# winston-graylog2 

A [graylog2][0] transport for [winston][1] based on the [node-graylog2][2] Library

## Installation

Recently rewritten to use ES6 for better compatibility with Winston@3,
so please use only with NodeJS >=6.4.0.

If you need to support older versions of Node, please use a version
compatible with `^winston-graylog2@1.1.0`.


``` sh
$ npm install winston
$ npm install winston-graylog2
```

## Usage
```javascript
var winston = require('winston');
var WinstonGraylog2 = require('winston-graylog2');

var options = { ...<your config options here>... };
winston.add(new WinstonGraylog2(options));
```

or

```javascript
var winston
var WinstonGraylog2 = require('winston-graylog2');

var options = { ...<your config options here>... };
var logger = winston.createLogger({
  exitOnError: false,
  transports: [
    new WinstonGraylog2(options),
  ],
});
```

or in TypeScript:

```typescript
import { createLogger } from 'winston';
import * as WinstonGraylog2 from 'winston-graylog2';

const options = { ...<your config options here>... };
const logger = createLogger({
  transports: [
    new WinstonGraylog2(options),
  ],
});

logger.info(`tere`);
```

## Options

* __name__:  Transport name
* __level__: Level of messages this transport should log. (default: info)
* __silent__: Boolean flag indicating whether to suppress output. (default: false)
* __handleExceptions__: Boolean flag, whenever to handle uncaught exceptions. (default: false)
* __exceptionsLevel__: Level of exceptions logs when handleExceptions is true. (default: error)
* __graylog__:
  - __servers__; list of graylog2 servers
    * __host__: your server address (default: localhost)
    * __port__: your server port (default: 12201)
  - __hostname__: the name of this host (default: os.hostname())
  - __facility__: the facility for these log messages (default: "Node.js")
  - __bufferSize__: max UDP packet size, should never exceed the MTU of your system (default: 1400)
* __staticMeta__: meta data to be always used by each logging message, for instance environment (development, staging, live)


Older versions of `winston-graylog2` allowed the __prelog__ and __processMeta__ options for
pre-processing logs and metadata attached to messages (such as stack traces). Winston 3 has
implemented independent, custom formatters for handling these things, and they are no longer
supported at the transport level.
[See the Winston docs for details on formatters.](https://github.com/winstonjs/winston#formats)

example:

```javascript
{
  name: 'Graylog',
  level: 'debug',
  silent: false,
  handleExceptions: false,
  graylog: {
    servers: [{host: 'localhost', port: 12201}, {host: 'remote.host', port: 12201}],
    hostname: 'myServer',
    facility: 'myAwesomeApp',
    bufferSize: 1400
  },
  staticMeta: {env: 'staging'}
}
```

## Upgrading from earlier versions of `winston-graylog2`

Since `winston@3.x` relies heavily on a very powerful set of formatters there are a few formatting
actions that `winston-graylog2` no longer needs to do. The two primary cases are the inclusion of
a `meta` object, and converting errors so that the stack trace is included in the log message
rather than just the name of the error.

`winston@3.x` includes an excellent formatter for dealing with `meta`, conveniently named
`metadata`. To use it, you can either grab it from the `winston.format` object, or use the one on
`logform.format`. See [the metadata formatter docs](https://github.com/winstonjs/logform/tree/2.1.0#metadata)
for more details.

For formatting Errors, `winston@3.2.0` includes the `errors` formatter. To use it, you can either
grab it from the `winston.format` object, or use the one on `logform.format`. If you want to include
the stack trace in the log message, be sure to pass this formatter the `{ stack: true }` option. See
[the errrors formatter docs](https://github.com/winstonjs/logform/tree/2.1.0#errors)
for more details.

In order to get functionality identical to earlier versions of `winston-graylog2`, use both of
these formatters together.

```javascript
var winston = require('winston');
var { format } = winston;
var WinstonGraylog2 = require('winston-graylog2');

var options = { ...<your config options here>... };
var logger = winston.createLogger({
  exitOnError: false,
  format: format.combine(
    format.errors({ stack: true }),
    format.metadata(),
  ),
  transports: [
    new WinstonGraylog2(options)  ],
});

logger.info({ message: 'this is an info message', answer: 42 });
// or equivalently
logger.info('this is an info message', { answer: 42 });

logger.error({ message: new Error('FakeError'), somenumber: 96 });
// or equivalently
logger.error(new Error('FakeError'), { somenumber: 96 });
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
warn           | warning
notice         | notice
info           | info
debug          | debug

**All other possible winston levels, or custom levels, will default to `info`**

[0]: http://www.graylog2.org
[1]: https://github.com/flatiron/winston
[2]: https://github.com/Wizcorp/node-graylog2
