function slotLang(str: string) {
    return function (slots: any[]): string {
        let res = str
        slots.forEach(slot => {
            res = res.replace(/\{(\w+)\}/i, slot)
        })
        return res
    }
}

const langEN = {
    Connect: 'Connect',
    Profile: 'Profile',
    Market: 'Market',
    Apps: 'Apps',
    All: 'All',
    Tokens: 'Tokens',
    DOBs: 'DOBs',
    Activity: 'Activity',
    Assets: 'Assets',
    Balance: 'Balance',
    Actions: 'Actions',
    Receive: 'Receive',
    Send: 'Send',
    ViewAll: 'View All',
    ShowMoreRecords: 'Show More Records',
    Price: 'Price',
    MarketCap: 'Market Cap',
    Change24h: 'Change 24h',
    ViewTheProduct: 'View The Product',
    Transactions: 'Transactions',
    Merge: 'Merge',
    Burn: 'Burn',
    Cancel: 'Cancel',
    Input: 'Input',
    Output: 'Output',
    Leap: 'Leap',
    Select_An_UTXO_To_Leap: 'Select an UTXO to leap',
    Leap_To: 'Leap To',
    Bitcoin_Address: 'Bitcoin Address',
    Amount: 'Amount',
    Leap_Amount: 'Leap Amount',
    Fee_Rate: 'Fee Rate',
    Capacity_Fee: 'Capacity Fee',
    Leap_l2_to_l1: 'Leap from L2 to L1',
    It_Is_Recommended_To_Use_546_Satoshi_UTXO_To_Avoid_Being_Accidentally_Spent_And_wasted: 'It is recommended to use 546 satoshi(0.00000546 BTC) UTXO to avoid being accidentally spent and wasted.',
    Create_A_New_UTXO: 'Create a new UTXO',
    Create_UTXO: 'Create UTXO',
    Create_An_UTXO_To_Leap_Assets: 'Create a UTXO to leap assets',
    Network_Fee: 'Network Fee',
    Unconfirmed: 'Unconfirmed',
    Leap_l1_to_l2: 'Leap from L1 to L2',
}


export type LangConfig = typeof langEN
export default langEN
