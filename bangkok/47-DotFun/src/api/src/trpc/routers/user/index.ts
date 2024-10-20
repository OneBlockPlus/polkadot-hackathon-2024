import { router } from '../../trpc'
import { appRouter } from './app'
import { profileRouter } from './profile'
import { followRouter } from './follow'
import { likeRouter } from './like'

export const userRouter = router({
  app: appRouter,
  follow: followRouter,
  like: likeRouter,
  profile: profileRouter,
})
