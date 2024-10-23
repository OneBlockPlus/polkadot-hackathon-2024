import logger from '@core/utils/logger';
import config from '@config/config';
import mongoose from 'mongoose';

const connect = async () => {
  try {
    const connectionString = `${config.mongoUrl}`;
    console.log(connectionString, 'this is connection string');

    mongoose.connect(
      'mongodb+srv://lokeshkatari921:asdfasdf@lunacred.pzxvf.mongodb.net/luna?retryWrites=true&w=majority&appName=lunacred',
    );

    logger.info('Connected to MongoDB!');
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw new Error(err.message);
  }
};

export default { connect };
