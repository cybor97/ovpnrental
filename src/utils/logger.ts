import winston from "winston";
import { ConsoleTransportInstance } from "winston/lib/winston/transports";
import LokiTransport from "winston-loki";
import config from "../config";

const transports: Array<ConsoleTransportInstance | LokiTransport> = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
        (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
      )
    ),
  }),
];

if (config.loki.host) {
  transports.unshift(
    new LokiTransport({
      host: `https://${config.loki.host}`,
      basicAuth: `api_key:${config.loki.token}`,
      labels: { app: config.loki.label },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err),
    })
  );
}

const logger = winston.createLogger({ transports });

export default logger;
