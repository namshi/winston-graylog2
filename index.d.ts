import TransportStream = require('winston-transport');

declare class Graylog2Transport extends TransportStream {
  constructor(options?: Graylog2Transport.TransportOptions);
}

declare namespace Graylog2Transport {
  type GraylogServer = {
    host: string;
    port: number;
  }

  type GraylogOptions = {
      servers: GraylogServer[];
      hostname?: string;
      facility?: string;
      bufferSize?: number;
  }

  type StaticMeta = {
    [index: string]: any;
  }

  interface TransportOptions extends TransportStream.TransportStreamOptions {
    name?: string;
    exceptionsLevel?: string;
    graylog?: GraylogOptions;
    staticMeta?: StaticMeta;
  }
}

export = Graylog2Transport;
