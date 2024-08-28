import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import axios from 'axios'

export async function uploadAvatar(userId: string, href: string) {
  const response = await axios.get(href, { decompress: false, responseType: 'arraybuffer' })
  const ext = href.split(/[#?]/)[0].split('.').pop()
  return uploadFile('avatar', `${userId}_${Date.now()}.${ext}`, response.data)
}

async function uploadFile(folder: string, filename: string, data: any) {
  const REGION = 'us-east-1'
  const s3 = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_KEY ?? '',
      secretAccessKey: process.env.AWS_SECRET ?? '',
    },
  })

  const path = `${folder}/${filename}`
  await s3.send(
    new PutObjectCommand({
      Bucket: 'cdn.openauth.tech',
      Key: path,
      Body: data,
    }),
  )
  return `https://cdn.openauth.tech/${path}`
}
