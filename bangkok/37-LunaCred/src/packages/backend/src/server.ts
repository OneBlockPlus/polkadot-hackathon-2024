import { Server } from 'http';
import app from '@app';
import config from '@config/config';
import logger from '@core/utils/logger';
import errorHandler from 'core/utils/errorHandler';
import healthcheck from '@components/healthcheck/healthCheck.controller';
import axios from 'axios';
// import transactionQueue from '@core/utils/transactionQueue';

// import UsersRank from '@core/utils/updateUsersRank';
const { port, ptojectName } = config;

// // transactionQueue.processTransactionsQueue();
// UsersRank.updateRank();
setInterval(async () => {
  try {
    // Pinging the /ping route internally
    const response = await axios.get('http://localhost:8080/api/health');
    console.log('Internal ping response:', response.data);
  } catch (error) {
    console.error('Error in internal ping:', error.message);
  }
}, 300000);

const server: Server = app.listen(port, (): void => {
  logger.info(`Aapplication '${ptojectName}' listens on PORT: ${port}`);
});

const exitHandler = (): void => {
  if (app) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error): void => {
  errorHandler.handleError(error);
  if (!errorHandler.isTrustedError(error)) {
    exitHandler();
  }
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', (reason: Error) => {
  throw reason;
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
