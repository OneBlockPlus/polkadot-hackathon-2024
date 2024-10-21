import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  create,
  read,
  update,
  isSignatureValid,
  queueApproval,
  authClient,
} from '@components/user/user.service';
import { Client, auth } from 'twitter-api-sdk';
import { IUser } from '@components/user/user.interface';
import config from '@config/config';
import Web3 from 'web3';
const web3 = new Web3('https://rpc.api.moonbase.moonbeam.network');
const STATE = 'lunacred';
const CODE_CHALLENGE = 'a543d136-2cc0-4651-b571-e972bf116556';

const readUser = async (req: Request, res: Response) => {
  res.status(httpStatus.OK);
  res.send({
    message: 'Read',
    output: await read(req.params.address.toLowerCase()),
  });
};

const getUserOauthUrl = async (req: Request, res: Response) => {
  const authUrl = authClient.generateAuthURL({
    state: STATE,
    code_challenge_method: 'plain',
    code_challenge: CODE_CHALLENGE,
  });
  res.send({ url: authUrl });
};

const twitterCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  if (state !== STATE) return res.status(500).send("State isn't matching");
  res.redirect(`${config.uiEndpoint}/airdrop?twitterAuthCode=${code}`);
};

const queueTest = async (req: Request, res: Response) => {
  const user = {
    address: (Math.random() + 1).toString(36).substring(7),
    signature: (Math.random() + 1).toString(36).substring(7),
    twitterId: (Math.random() + 1).toString(36).substring(7),
  } as IUser;
  await create(user);
  queueApproval(user);
  res.send({ message: 'queued' });
};

const linkUserTwitter = async (req: Request, res: Response) => {
  try {
    let { code, address, signature } = req.body;
    address = address.toLowerCase();
    const dbUser = await read(address);
    if (dbUser && dbUser.approved) {
      res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: 'Wallet already approved' });
      return;
    }

    if (!isSignatureValid(address as string, signature as string)) {
      return res.send({ error: 'Signature invalid!' });
    }

    const authClientLocal = new auth.OAuth2User({
      client_id: config.twitterClientId as string,
      client_secret: config.twitterClientSecret as string,
      callback: `${config.baseApiUrl}callback`,
      scopes: ['tweet.read', 'users.read', 'follows.read', 'follows.write'],
    });
    authClientLocal.generateAuthURL({
      state: STATE,
      code_challenge_method: 'plain',
      code_challenge: CODE_CHALLENGE,
    });
    await authClientLocal.requestAccessToken(code as string);
    const twitterClientLocal = new Client(authClientLocal);
    const userData = await twitterClientLocal.users.findMyUser({
      'user.fields': ['id', 'name', 'public_metrics', 'username'],
    });
    console.log('userData - ', userData);

    const user = {
      address,
      signature,
      twitterId: userData.data.id,
      twitterUserName: userData.data.username,
    } as IUser;
    try {
      if (dbUser) {
        await update(dbUser, { twitterId: userData.data.id });
      } else {
        await create(user);
      }
      // queueApproval(user);
    } catch (err) {
      res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: 'Twitter already linked to some other wallet' });
      return;
    }

    res.status(httpStatus.OK);
    res.send({ message: 'Twitter account linked successfully', user });
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

export {
  readUser,
  getUserOauthUrl,
  twitterCallback,
  linkUserTwitter,
  queueTest,
};
