import express, { Express } from 'express';
import winston from 'winston';
import {
  CustomErrorTypes,
  errorFactory,
  handleHttpError,
  tagError,
} from '../..';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const PORT = process.env.PORT || 4000;
const wrongInputError = errorFactory(CustomErrorTypes.BAD_REQUEST);

const app: Express = express();

app.get('/api', (_req, _res, next) => {
  try {
    throw wrongInputError('Wrong Input message', { extraInfo: 'Extra info' });
  } catch (error) {
    return next(tagError(error));
  }
});
app.use(handleHttpError(logger));

app.listen(PORT, () =>
  console.log(`Listening PORT: ${PORT}`)
);
