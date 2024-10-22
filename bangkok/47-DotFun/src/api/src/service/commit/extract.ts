export function extractArtifact(input: string): { content: string; code: string | null } {
  const startTerm = '<x-artifact'
  const endTerm = /<\/\s*x-artifact\s*>/g

  const startIndex = input.indexOf(startTerm)
  if (startIndex === -1) {
    return { content: input, code: null }
  }

  const contentBefore = input.slice(0, startIndex).trim()
  const endMatch = endTerm.exec(input)
  if (!endMatch) {
    return { content: contentBefore, code: null }
  }

  const endIndex = endMatch.index + endMatch[0].length
  const contentAfter = input.slice(endIndex).trim()

  const code = input
    .slice(startIndex, endIndex)
    .replace(/<x-artifact[^>]*>|<\/\s*x-artifact\s*>/g, '')
    .trim()

  return {
    content: `
${contentBefore}
${contentAfter}
`.trim(),
    code,
  }
}

export function extractContent(text: string, tag: string) {
  const regex = new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`, 'i')
  const match = text && text.match ? text.match(regex) : null
  if (match) {
    return match[0].replace(new RegExp(`</?${tag}>`, 'gi'), '').trim()
  }
  return ''
}
