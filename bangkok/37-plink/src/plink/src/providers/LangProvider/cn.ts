import {LangConfig} from './en'

function slotLang(str: string) {
    return function (slots: any[]): string {
        let res = str
        slots.forEach(slot => {
            res = res.replace(/\{(\w+)\}/i, slot)
        })
        return res
    }
}

const langCN: LangConfig = {
    Connect: '连接钱包',
    Profile: '个人',
    Market: '行情',
    Apps: '应用',
    All: '全部',
    Tokens: '代币',
    DOBs: 'DOBs',
    Activity: '活动',
    Assets: '资产',
    Balance: '余额',
    Actions: '操作',
    Receive: '接收',
    Send: '发送',
    ViewAll: '查看全部',
    ShowMoreRecords: '显示更多记录',
    Price: '价格',
    MarketCap: '市值',
    Change24h: '24小时涨跌',
    ViewTheProduct: '查看应用',
    Transactions: '交易',
    Merge: '合并',
    Burn: '销毁',
    Cancel: '取消',
    Input: '输入',
    Output: '输出',
    Leap: '跨链',
    Select_An_UTXO_To_Leap: '选择一个UTXO进行跨链',
    Leap_To: '跨链至',
    Bitcoin_Address: '比特币地址',
    Amount: '数量',
    Leap_Amount: '跨链数量',
    Fee_Rate: '费率',
    Capacity_Fee: '容量费',
    Leap_l2_to_l1: '从L2跨链至L1',
    It_Is_Recommended_To_Use_546_Satoshi_UTXO_To_Avoid_Being_Accidentally_Spent_And_wasted: '建议使用546聪(0.00000546 BTC)的UTXO以避免被意外花费和浪费',
    Create_A_New_UTXO: '创建一个新的UTXO',
    Create_UTXO: '创建UTXO',
    Create_An_UTXO_To_Leap_Assets: '创建一个UTXO用来资产跨链',
    Network_Fee: '网络费',
    Unconfirmed: '未确认',
    Leap_l1_to_l2: '从L1跨链至L2',
}


export default langCN
