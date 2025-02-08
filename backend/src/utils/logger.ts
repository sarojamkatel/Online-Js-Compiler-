import winston, { format } from "winston";

const logFormat = format.printf((info) => {
  const formattedNamespace = info.metadata.namespace || "";

  return `${info.metadata.timestamp} [${info.level}] [${formattedNamespace}]: ${info.message}`;
});

const logger = winston.createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.metadata(),
    logFormat
  ),
  transports: [new winston.transports.Console()],
});

/**
 * Creates a logger instance with a specific namespace for hierarchical logging.
 * @param {string} namespace - The namespace to include in the log messages.
 * @returns {winston.Logger} A Winston logger instance with the provided namespace.
 */
const loggerWithNameSpace = function (namespace: string) {
  return logger.child({ namespace });
};

export default loggerWithNameSpace;
