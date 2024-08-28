// 时间戳转化年月日
export const useTimestampFormat = (timestamp: number) => {
    var date = new Date(timestamp)//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    var D = date.getDate() + ' '
    return Y + M + D;
}
