import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { read } from '@components/userRank/userRank.service';
import { IUserRank } from './userRank.interface';

const userRank = async (req: Request, res: Response) => {
    console.log("req - ", req.params.address);
    if (!req.params.address) {
        res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid address!' });    
    }
    const userRank: IUserRank = await read(req.params.address.toLowerCase());
    res.status(httpStatus.OK).send({ message: 'Read', rank: userRank ? userRank.rank : 0 });
};

export default userRank;
