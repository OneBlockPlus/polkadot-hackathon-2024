import mongoose from 'mongoose';
import { IUserRank } from './userRank.interface';

const userRankSchema = new mongoose.Schema<IUserRank>({
  address: {
    type: String,
    required: [true, 'Address is required!'],
    unique: true,
    dropDups: true,
  },
  rank: { type: Number, default: 0 },
});

const UserRankModel = mongoose.model<IUserRank>('UserRank', userRankSchema);

// eslint-disable-next-line import/prefer-default-export
export { UserRankModel };
