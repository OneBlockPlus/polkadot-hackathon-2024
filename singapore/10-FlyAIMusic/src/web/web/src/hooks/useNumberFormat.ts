//数量格式化，过万转换成万，过亿转化成亿
export function useNumberFormat(value:number ) {
    var param = {
        value:'',
        unit: '',
    };
    var k = 10000,
        sizes = ['', '万', '亿', '万亿'],
        i;
    if(value < k){
        param.value =value+''
        param.unit=''
    }else{
        i = Math.floor(Math.log(value) / Math.log(k));
        param.value = ((value / Math.pow(k, i))).toFixed(1); //保留1位小数
        param.unit = sizes[i];
    }
    return param.value+param.unit;
}
