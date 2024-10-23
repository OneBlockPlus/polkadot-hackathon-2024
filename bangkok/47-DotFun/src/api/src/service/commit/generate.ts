import { Commit } from '@prisma/client'
import { extractArtifact } from './extract'
import { generateWithConverse } from '../../utils/aws/bedrock'
import { prisma } from '../../utils/prisma'
import { analyseCodeChangesFromPrompt } from './analyse'
import { buildUserPromptForCreate, buildUserPromptForUpdate, codeSystemMessages } from './prompts'
import { Message } from '@aws-sdk/client-bedrock-runtime'

export async function generateCodeFromPrompt(commit: Commit) {
  const app = await prisma.app.findUnique({
    where: { id: commit.appId },
    include: { lastCommit: true },
  })

  const appName = app?.name ?? 'Untitled App'
  const appDescription = app?.description ?? 'No description provided'

  const preCommits = await prisma.commit.findMany({
    where: { appId: commit.appId, id: { lt: commit.id } },
    orderBy: [{ id: 'asc' }],
  })

  let userPrompt
  const code = app?.lastCommit?.code
  if (code) {
    const requirement = commit.prompt
    const requirements = preCommits.map((commit) => commit.prompt)
    const { changes } = await analyseCodeChangesFromPrompt({
      requirement,
      commit,
      code,
    })
    userPrompt = buildUserPromptForUpdate({
      requirement,
      requirements,
      appName,
      appDescription,
      code,
      changes,
    })
  } else {
    const requirement = [...preCommits.map((commit) => commit.prompt), commit.prompt].join('\n')
    userPrompt = buildUserPromptForCreate({
      requirement,
      appName,
      appDescription,
    })
  }

  const messages: Message[] = [{ role: 'user', content: [{ text: userPrompt }] }]

  let fullOutput: string = ''
  for (let i = 0; i < 10; i++) {
    const { stopReason, output } = await generateWithConverse({
      appId: commit.appId,
      commitId: commit.id,
      system: codeSystemMessages,
      messages,
    })
    fullOutput += output

    if (stopReason !== 'max_tokens') {
      break
    }
    if (i === 0) {
      messages.push({ role: 'assistant', content: [{ text: output }] })
    } else {
      const lastMessage = messages[messages.length - 1]
      lastMessage.content?.push({ text: output })
    }
  }

  return extractArtifact(fullOutput)
}
