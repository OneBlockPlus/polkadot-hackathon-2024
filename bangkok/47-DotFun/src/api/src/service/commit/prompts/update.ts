export function buildUserPromptForUpdate({
  requirement,
  code,
  changes,
}: {
  requirement: string
  code: string
  changes: string
}) {
  return `
You are to update an existing web application based on the following request:

<update_request>
${requirement}
</update_request>

Existing Code:
\`\`\`html
${code}
\`\`\`

Required Changes:
${changes}
`.trim()
}
