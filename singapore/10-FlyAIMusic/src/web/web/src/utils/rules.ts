import { reactive } from 'vue'

const checkPhone = (rule?: any, value?: any, callback?: any)=>{
    if (!value) { //这里不知道value为啥是undefined
        callback(new Error('请输入手机号'))
    } else {
        const reg = /^1[3|4|5|7|8|9][0-9]\d{8}$/; //手机号正则表达式
        if (reg.test(value as string)) {
            callback()
        } else {
            return callback(new Error('请输入正确的手机号'))
        }
    }
}
export const loginRules = reactive({
    phone:{ validator:checkPhone,required: true,trigger:'blur' },
    password:{ required: true, message: '请输入密码' }
})
