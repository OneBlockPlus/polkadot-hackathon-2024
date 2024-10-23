// @ts-ignore
import request from '@/utils/request'
/*手机登陆
 phone: 手机号码
 password: 密码*/
export function phoneLogin(data:any) {
   return  request('/login/cellphone',data)
}

/**
 * 二维码登陆
 */
//可生成一个key
export function qrCodeLoginKey(){
    return request('/login/qr/key?timestamp='+new Date().getTime())
}

 //二维码生成接口用此接口传入上一个接口生成的key可生成二维码图片的base64
export function qrCodeLoginImg(key:string){
    return request('/login/qr/create?qrimg=true&key='+key+'&timestamp='+new Date().getTime())
}
//二维码检测扫码状态接口
// 说明: 轮询此接口可获取二维码扫码状态,800为二维码过期,801为等待扫码,802为待确认,803为授权登录成功(803状态码下会返回cookies)
export function qrCodeLoginCheck(key:string){
    return request('/login/qr/check?key='+key+'&timestamp='+new Date().getTime())
}
//退出登录
export function logout(){
    return request('/logout')
}