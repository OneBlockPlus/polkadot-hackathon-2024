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
import axios from 'axios';
const web3 = new Web3('https://rpc.api.moonbase.moonbeam.network');
const STATE = 'lunacred';
const CODE_CHALLENGE = 'a543d136-2cc0-4651-b571-e972bf116556';
const clientIdAndSecret =
  'U0VKdlIya3lSVmQxZEc1aVNqZzRTVk5mYldFNk1UcGphUTpGRVBScFBpdTQ1NlZFR0lmRm9VbXhsVEc4OTNMT19aT3NnWkZjeW5lOXQtejBKUUhwYg==';
const redirectUri = 'https://lunacred.onrender.com/api/callback';
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
  res.redirect(`${config.uiEndpoint}/link-twitter?twitterAuthCode=${code}`);
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
    console.log(req.body);

    address = address.toLowerCase();
    const dbUser = await read(address);
    if (dbUser && dbUser.approved) {
      res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: 'Wallet already approved' });
      return;
    }
    const url = 'https://api.twitter.com/2/oauth2/token';

    if (!isSignatureValid(address as string, signature as string)) {
      return res.send({ error: 'Signature invalid!' });
    }

    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('redirect_uri', redirectUri);
    formData.append('code_verifier', CODE_CHALLENGE);

    // Debug the request
    console.log('Request URL:', url);
    console.log('Form Data:', Object.fromEntries(formData));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization:
          'Basic U0VKdlIya3lSVmQxZEc1aVNqZzRTVk5mYldFNk1UcGphUTpGRVBScFBpdTQ1NlZFR0lmRm9VbXhsVEc4OTNMT19aT3NnWkZjeW5lOXQtejBKUUhwYg==',
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: formData.toString(),
    });

    let { access_token } = await response.json();
    if (!access_token) {
      return res.send({ error: 'Invalid code' });
    }
    // const requestToken = data.access_token;
    const { data } = await axios.get('https://api.x.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    // if (response) {
    //   // console.log(response); // handle the response data

    //   console.log('userData - ', await response.json());
    // }
    // console.log(userData.data);

    // const user = {
    //   address,
    //   signature,
    //   twitterId: response.data.id,
    //   twitterUserName: response.data.username,
    // } as IUser;
    // try {
    //   if (dbUser) {
    //     await update(dbUser, { twitterId: response.data.id });
    //   } else {
    //     await create(user);
    //   }
    //   // queueApproval(user);
    // } catch (err) {
    //   res
    //     .status(httpStatus.BAD_REQUEST)
    //     .send({ message: 'Twitter already linked to some other wallet' });
    //   return;
    // }

    res.status(httpStatus.OK);
    res.send({
      message: 'Twitter account linked successfully',
      userData: data,
    });
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
