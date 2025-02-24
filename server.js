import winston from "winston";
import http from "http";
import app from "./app.js";
const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});
const server = http.createServer(app);
server.listen(app.get("port"), () => {
  logger.info(
    ` App is running at http://localhost:${app.get("port")} in ${
      app.get("dev")} mode`
  );
  logger.info("  Press CTRL-C to stop");
});

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
function shutDown() {
  logger.info("Received kill signal, shutting down gracefully");
  logger.info("Shutting down schedulers gracefully");

  server.close(() => {
    logger.info("Closed out remaining connections");
    process.exit(0);
  });
  


}

export {server,logger};