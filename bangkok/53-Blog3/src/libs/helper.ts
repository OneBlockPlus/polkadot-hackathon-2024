export function cls(input: (string | boolean)[]): string {
    return input
        .filter((cond: string | boolean) => typeof cond === 'string')
        .join(' ')
}

export const shortAddress = (
    str: `0x${string}`,
    num: number = 4,
    placeholder = '...',
) => {
    if (typeof str === 'string' && str) {
        return `${str?.substring(0, num + 2)}${placeholder}${str?.substring(str?.length - num)}`
    }
    return ''
}