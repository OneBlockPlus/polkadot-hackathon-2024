import logger from '@core/utils/logger';
import { UserRankModel } from '@components/userRank/userRank.model';
import { IUserRank } from '@components/userRank/userRank.interface';

const createAll = async (userRank: IUserRank[]): Promise<boolean> => {
  try {
    await UserRankModel.insertMany(userRank, { ordered: false });
    console.log('UserRanks created ', await UserRankModel.countDocuments());
    return true;
  } catch (err) {
    console.log(`UserRank create err: %O`, err.message);
  }
};

const deleteAll = async (): Promise<boolean> => {
  try {
    await UserRankModel.deleteMany({});
    console.log('UserRank purged');
    return true;
  } catch (err) {
    console.log(`UserRank purge err: %O`, err.message);
  }
};

const read = async (address: string): Promise<IUserRank> => {
  logger.error(`Sent user address ${address}`);
  const userRank = await UserRankModel.findOne({ address: address });
  return userRank as IUserRank;
};

export { createAll, read, deleteAll };
