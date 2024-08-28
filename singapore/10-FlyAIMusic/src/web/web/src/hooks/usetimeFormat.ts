//时长(00:00)转化秒数
export function usetimeFormat(e: string) {
    let time = e;
    let len = time.split(':')
    if (len.length == 3) {
        let min = <any>time.split(':')[1];
        let sec = time.split(':')[2];
        return Number(min * 60) + Number(sec);
    }
    if (len.length == 2) {
        let min = <any>time.split(':')[0];
        let sec = time.split(':')[1];
        return Number(min * 60) + Number(sec);
    }
    if (len.length == 1) {
        let sec = time.split(':')[0];
        return Number(sec);
    }
}
