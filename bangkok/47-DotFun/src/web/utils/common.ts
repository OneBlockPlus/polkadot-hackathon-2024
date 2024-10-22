export function shorten(str: string, start: number = 4, end: number = 4) {
  return `${str.slice(0, start)}...${str.slice(-end)}`
}
