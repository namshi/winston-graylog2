# winston-graylog2 [![Build Status](https://secure.travis-ci.org/flite/winston-graylog2.png)](http://travis-ci.org/flite/winston-graylog2)

A [graylog2][2] transport for [winston][0]. Inspired by [winston-mail][1] transport and [node-graylog][3].

## Installation
Tested on node-0.6.x, requires npm.

``` sh
  $ npm install winston
  $ npm install winston-graylog2
```

## Usage
``` js
  var winston = require('winston');
  winston.add(require('winston-graylog2').Graylog2, options);

```

Options are the following:

* __level:__ Level of messages this transport should log. (default: info)
* __silent:__ Boolean flag indicating whether to suppress output. (default: false)

* __graylogHost:__ IP address or hostname of the graylog2 server. (default: localhost)
* __graylogPort:__ Port to send messages to on the graylog2 server. (default: 12201)
* __graylogHostname:__ The hostname associated with graylog2 messages. (default: require('os').hostname())
* __graylogFacility:__ The graylog2 facility to send log messages.. (default: nodejs)

[0]: https://github.com/flatiron/winston
[1]: https://github.com/wavded/winston-mail
[2]: http://www.graylog2.org
[3]: https://github.com/egorFiNE/node-graylog