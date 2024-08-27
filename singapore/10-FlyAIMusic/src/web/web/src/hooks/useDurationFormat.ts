//时间戳转化为时长
export function useDurationFormat(time:number) {
         time =time/ 1000; //如果传进来的是 毫秒 形式，则在这里除1000将其转为 秒 形式
   		function f_m_dispose(min, sec) { // 分秒处理函数
			if (min < 10 && sec < 10) {
				return "0" + min + ":" + "0" + sec; // 如果分和秒都小于10，则前面都加入0
			} else if (min < 10 && sec >= 10) {
				return "0" + min + ":" + sec; // 如果分小于10，秒大于10，则给分前面加0
			} else if (min >= 10 && sec < 10) {
				return min + ":" + "0" + sec; // 如果分大于10，秒小于10，则给秒前面加0
			} else {
				return min + ":" + sec; // 如果分秒都大于10，则直接return
			}
		}
		let hour = Number.parseInt(time / 3600); // 获取总的小时
        let min = Number.parseInt((time - hour * 3600) / 60); // 获取总分钟
        let sec = Number.parseInt(time - (hour * 3600) - (min * 60)); // 减去总 分 后剩余的分秒数
	        return f_m_dispose(min, sec);
    }
