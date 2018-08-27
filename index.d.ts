import {TransportStatic, TransportInstance} from "winston";

declare namespace WinstonGraylog2 {
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

  type Prelog = {
    (message: string): void;
  }

  type LogMessageMeta = {
    [index: string]: any;
  }

  type ProcessMeta = {
    (meta: LogMessageMeta): LogMessageMeta
  }

  type TransportOptions = {
    graylog?: GraylogOptions;
    level?: string;
    name?: string;
    silent?: boolean;
    handleExceptions?: boolean;
    prelog?: Prelog;
    processMeta?: ProcessMeta;
    staticMeta?: LogMessageMeta;
  }

  interface Graylog2TransportInstance extends TransportInstance {
    graylog: GraylogOptions;
    prelog: Prelog;
    processMeta: ProcessMeta;
    staticMeta: LogMessageMeta;
  }

  interface Graylog2TransportStatic extends TransportStatic {
    new(options?: TransportOptions): Graylog2TransportInstance;
  }
}

declare const WinstonGraylog2: WinstonGraylog2.Graylog2TransportInstance;

export = WinstonGraylog2;
