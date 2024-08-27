// 控制loading组件的显示与隐藏
import 'element-plus/theme-chalk/el-loading.css';
import { ElLoading } from 'element-plus';
let loading:any = null;
export function showLoading(text='加载中……') {
    loading = ElLoading.service({
        lock: true,
        text: text,
        background: 'rgba(0,0,0,0.38)'
    });
}
export function closeLoading() {
    loading.close()
}
