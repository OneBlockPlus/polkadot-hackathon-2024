import { Router } from 'express';

import protectedByApiKey from '@core/middlewares/apiKey.middleware';
import validation from '@core/middlewares/validate.middleware';
import {
  readUser,
  getUserOauthUrl,
  // twitterCallback,
  linkUserTwitter,
  queueTest,
} from './user.controller';
import linkUserTwitterValidation from './user.validation';

const router: Router = Router();

// e.g. createUser request's body is validated and protected by api-key
router.get('/user/:address', readUser);
router.get('/twitter-login/', getUserOauthUrl);
router.post(
  '/link-twitter/',
  [protectedByApiKey, validation(linkUserTwitterValidation)],
  linkUserTwitter,
);
// router.get('/callback', twitterCallback);
router.get('/queue-test', queueTest);

export default router;
