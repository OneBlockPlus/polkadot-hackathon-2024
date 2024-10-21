export function buildUserPromptForCreate({
  requirement,
  appName,
  appDescription,
}: {
  requirement: string
  appName: string
  appDescription: string
}) {
  return `
Create a web application based on the following requirements:

<user_requirements>
${requirement}
</user_requirements>

App Details:
Name: ${appName}
Description: ${appDescription}
`.trim()
}
