import BigNumber from 'bignumber.js'

function toValue(numStr: string, decimal: number, split?: boolean, isInt?: boolean): string {
    const num = BigNumber(numStr)
    const d = BigNumber(10 ** decimal + '')

    if (split) {
        return num.multipliedBy(d).toFormat(isInt? 0 : 4)
    } else {
        return num.multipliedBy(d).toFixed(isInt? 0 : 4)
    }
}

export function toDisplay(numStr: string, decimal: number, split?: boolean, fixed?: number): string {
    const num = BigNumber(numStr)
    const d = BigNumber(10 ** decimal + '')

    if (split) {
        return num.dividedBy(d).toFormat(fixed)
    } else {
        return fixed ? num.dividedBy(d).toFixed(fixed) : num.dividedBy(d).toString()
    }
}

export function shortTransactionHash(hash: string, keep?: number): string {
    const length = keep || 6
    return hash.slice(0, length) + '...' + hash.slice(hash.length - length)
}

