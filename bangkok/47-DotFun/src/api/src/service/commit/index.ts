import { App, Commit } from '@prisma/client'
import { analyseAppMetadataFromPrompt } from './analyse'
import { prisma } from '../../utils/prisma'
import { generateCodeFromPrompt } from './generate'
import { snapshotQueue } from '../../queue/queue'

export class CommitProcessor {
  private readonly commit: Commit
  private app: App | null = null

  constructor(commit: Commit) {
    this.commit = commit
  }

  async process() {
    const { id: commitId, appId } = this.commit

    // generate app metadata
    this.app = await prisma.app.findUnique({ where: { id: appId } })
    if (!this.app) {
      throw new Error(`App with id ${appId} not found`)
    }
    if (!this.app.name) {
      const { name, description } = await analyseAppMetadataFromPrompt(this.commit)
      this.app = await prisma.app.update({
        where: { id: appId },
        data: { name, description },
      })
    }

    // generate code
    let { content, code } = await generateCodeFromPrompt(this.commit)
    if (!code) {
      code = `<pre style="white-space: pre-wrap">${content}</pre>`
    }

    // update the commit
    await prisma.commit.update({
      where: { id: commitId },
      data: { content, code },
    })

    // update the last commit
    const lastCommit = await prisma.commit.findFirst({
      where: { appId, code: { not: null } },
      orderBy: { id: 'desc' },
    })
    if (lastCommit) {
      await prisma.app.update({
        where: { id: appId },
        data: { lastCommitId: commitId },
      })
    }

    // take a snapshot
    if (code) {
      await snapshotQueue.add({ commitId: commitId })
    }
  }
}
