import httpStatus from 'http-status';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import { UserModel } from '@components/user/user.model';
import { IUser, IUpdateUser } from '@components/user/user.interface';
import { Client, auth } from 'twitter-api-sdk';
import config from '@config/config';
import { ethers } from 'ethers';
import transactionQueue from '@core/utils/transactionQueue';

const authClient = new auth.OAuth2User({
  client_id: config.twitterClientId as string,
  client_secret: config.twitterClientSecret as string,
  callback: `${config.baseApiUrl}callback`,
  scopes: ['tweet.read', 'users.read', 'follows.read', 'follows.write'],
});
const twitterClient = new Client(authClient);

const create = async (user: IUser): Promise<boolean> => {
  try {
    const newUser = await UserModel.create(user);
    logger.debug(`User created: %O`, newUser);
    return true;
  } catch (err) {
    logger.error(`User create err: %O`, err.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'User was not created!');
  }
};

const read = async (address: string): Promise<IUser> => {
  logger.debug(`Sent user.id ${address}`);
  const user = await UserModel.findOne({ address: address });
  return user as IUser;
};

const update = async (
  user: IUser,
  updateObject: IUpdateUser,
): Promise<boolean> => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { address: user.address },
      updateObject,
      { new: true },
    );
    logger.debug(`User updated: %O`, updatedUser);
    return true;
  } catch (err) {
    logger.error(`User update err: %O`, err.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'User was not updated!');
  }
};

const isSignatureValid = async (
  address: string,
  signature: string,
): Promise<boolean> => {
  try {
    //verify signature here
    const signerAddr = await ethers.verifyMessage(
      'Trustdrops login',
      signature,
    );
    if (signerAddr !== address) {
      return false;
    }
    return true;
  } catch (err) {
    logger.error(`Signature verification err: %O`, err.message);
    return false;
  }
};

const queueApproval = async (user: IUser) => {
  transactionQueue.queueApprovalTransaction(user);
};

export {
  create,
  read,
  update,
  authClient,
  twitterClient,
  isSignatureValid,
  queueApproval,
};
