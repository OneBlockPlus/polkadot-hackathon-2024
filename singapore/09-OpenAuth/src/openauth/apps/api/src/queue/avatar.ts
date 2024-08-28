import type { Job } from 'bull'
import { Telegraf } from 'telegraf'

import { uploadAvatar } from '../utils/aws'
import { prisma } from '../utils/prisma'
import type { AvatarQueuePayload } from '../utils/queue'

export async function processAvatarJob({ data: { userId, imageURL, skipIfExist } }: Job<AvatarQueuePayload>) {
  console.info(`Process avatar for user ${userId}`)
  const user = await prisma.user.findUnique({ include: { app: true }, where: { id: userId } })
  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  if (skipIfExist && user.avatar) {
    console.info(`Avatar already exists for user ${userId}`)
    return
  }

  let avatarURL = imageURL

  if (!avatarURL) {
    if (!user.telegram) {
      return
    }
    const botToken = user.app.telegramBotToken
    if (!botToken) {
      throw new Error(`No bot token found for telegram user: ${userId}`)
    }
    const bot = new Telegraf(botToken)
    const photos = await bot.telegram.getUserProfilePhotos(Number.parseInt(user.telegram, 10))
    if (photos.photos.length === 0) {
      console.info(`No avatar found: ${userId}`)
      return
    }
    const photo = photos.photos[0][0]
    const fileLink = await bot.telegram.getFileLink(photo.file_id)
    avatarURL = fileLink.href
  }

  const url = await uploadAvatar(userId, avatarURL)
  await prisma.user.update({
    data: { avatar: url },
    where: { id: userId },
  })
}
