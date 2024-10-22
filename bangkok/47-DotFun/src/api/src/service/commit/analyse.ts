import { Commit } from '@prisma/client'
import { extractContent } from './extract'
import { generateWithConverse } from '../../utils/aws/bedrock'

export async function analyseAppMetadataFromPrompt(commit: Commit) {
  const systemPrompt =
    'You are an AI assistant that analyzes app architecture requirements and provides structured output.'

  const content = `
You are to help design a new web application based on the following user requirements, remember to not add a feature unless it is absolutely mandatory:

<user_requirements>
${commit.prompt}
</user_requirements>

Please provide:

<app_name>
[Provide the application name here]
</app_name>

<app_description>
[Provide a short description of the application]
</app_description>
`

  const { output } = await generateWithConverse({
    appId: commit.appId,
    commitId: commit.id,
    system: [{ text: systemPrompt }],
    messages: [{ role: 'user', content: [{ text: content }] }],
  })
  const name = extractContent(output, 'app_name')
  const description = extractContent(output, 'app_description')

  return {
    name,
    description,
  }
}

export async function analyseCodeChangesFromPrompt({
  requirement,
  commit,
  code,
}: {
  requirement: string
  commit: Commit
  code: string
}) {
  const systemPrompt =
    'You are an AI assistant that analyzes app architecture requirements and provides structured output.'

  const content = `
You are to help update an existing web application.

**Existing Code**:
\`\`\`html
${code}
\`\`\`

**User's Update Request**:
${requirement}

Please analyze the update request and provide the following:

<required_changes>
[Your analysis of the required changes]
</required_changes>
`

  const { output } = await generateWithConverse({
    appId: commit.appId,
    commitId: commit.id,
    system: [{ text: systemPrompt }],
    messages: [{ role: 'user', content: [{ text: content }] }],
  })
  const changes = extractContent(output, 'required_changes')

  return {
    changes,
  }
}
