//节流函数
export const throttle = (fn, delay) => {
    let valid = true;
    return function () {
        let context = this;
        let args = arguments;
        if (!valid) {
            return false;
        }
        valid = false;
        setTimeout(() => {
            //console.log('coming');
            //fn();
            fn.apply(context, args);
            valid = true;
        }, delay);
    };
};

