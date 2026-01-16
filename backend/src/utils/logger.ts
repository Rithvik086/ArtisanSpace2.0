import pino from "pino";
import pretty from "pino-pretty";
import config from "../config/index.js";

const isProduction = config.NODE_ENV === "production";

class Logger {
  private logger: pino.Logger;

  constructor() {
    this.logger = isProduction
      ? pino({ level: "info" })
      : pino(
          { level: "debug" },
          pretty({
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          })
        );
  }

  info(obj: any, msg?: string) {
    this.logger.info(obj, msg);
  }

  error(obj: any, msg?: string) {
    this.logger.error(obj, msg);
  }

  debug(obj: any, msg?: string) {
    this.logger.debug(obj, msg);
  }

  warn(obj: any, msg?: string) {
    this.logger.warn(obj, msg);
  }

  fatal(obj: any, msg?: string) {
    this.logger.fatal(obj, msg);
  }
}

const logger = new Logger();

export default logger;
