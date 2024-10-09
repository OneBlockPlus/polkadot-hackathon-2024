export interface CkbApp {
    logo: string,
    name: string,
    url: string
    description: {
        [index: string]: string,
        en: string,
        cn: string
    }
}

const apps: CkbApp[] = [
    {
        logo: 'https://ik.imagekit.io/soladata/1vx4du4f_uz_lSWILL',
        name: 'Mobit',
        url: '/',
        description: {
            en: 'CKB Assets Manager',
            cn: 'CKB 资产管理器'
        }
    },
    {
        logo: 'https://ik.imagekit.io/soladata/8wcdvj7q_JPAaU7bA5',
        name: 'CKB Explorer',
        url: 'https://explorer.nervos.org/',
        description: {
            en: 'CKB Block Explorer',
            cn: 'CKB 区块浏览器'
        }
    },
    {
        logo: 'https://ik.imagekit.io/soladata/z8hkvqw5_4OsLMde3-',
        name: 'Huehub',
        url: 'https://huehub.xyz/',
        description:{
            en: 'RGB++ Assets Marketplace',
            cn: 'RGB++ 资产市场'
        }
    },
    {
        logo: 'https://ik.imagekit.io/soladata/dx2hgk3e_0OXl2mDX9',
        name: 'Omiga',
        url: 'https://omiga.io/',
        description: {
            en: 'The first  inscription protocol builded on CKB, also an orderbook DEX supports xUDT, DOBs',
            cn: 'Omiga 是第一个基于 CKB 的铭文协议，也是一个支持 xUDT、DOB 的订单簿 DEX'
        }
    },
    {
        logo: 'https://ik.imagekit.io/soladata/i3830dqr_plNHCLl-G',
        name: '.bit',
        url: 'https://did.id/',
        description: {
            en: 'Unified DID, Access From Anywhere, Use It Everywhere',
            cn: '统一的 DID，从任何地方访问，到处使用'
        }
    },
    {
        logo: 'https://ik.imagekit.io/soladata/ol84miug_8QnlkFMT7',
        name: 'Nervape',
        url: 'https://www.nervape.com/nervape',
        description: {
            en: 'Nervape, multi-chain composable digital objects built on bitcoin.',
            cn: 'Nervape，基于比特币构建的多链可组合数字对象'
        }
    },
    {
        logo: 'https://ik.imagekit.io/soladata/c6hmnacl_hgSArXWdmX',
        name: 'Haste',
        url: 'https://haste.pro',
        description: {
            cn: 'Haste是一个资产管理器，可以方便地管理您在 Bitcoin/RGB++/CKB 上的加密资产',
            en: 'Haste is an asset manager that makes it easy to manage your crypto assets on Bitcoin/RGB++/CKB'
        }
    },
    {
        logo: 'https://ik.imagekit.io/soladata/h8m5xerk_obW7ga3Lve',
        name: 'Rei Wallet',
        url: 'https://reiwallet.io',
        description: {
            cn: 'CKB 原生的浏览器插件钱包',
            en: 'CKB native browser extension wallet'
        }
    },
    {
        logo: 'https://ik.imagekit.io/soladata/zwzysaqq_-ReLqUcGT',
        name: 'Cell Script',
        url: 'https://cellscript.io',
        description: {
            cn: 'CKB上的智能合约语言。通过使用Cell Script，开发人员可以在几分钟内开始编写CKB智能合约',
            en: 'The smart contract language on CKB. By using Cell Script, developers can start writing CKB smart contracts in minutes'
        }
    },
    {
        logo: 'https://ik.imagekit.io/soladata/7floqz53_Ui8LEVZF1',
        name: 'Dobby',
        url: 'https://app.dobby.market',
        description: {
            cn: 'Dobby 是 Bitcion 上的数码物（DOBs）去中心化交易平台',
            en: 'Dobby is a decentralized trading platform for digital objects (DOBs) on Bitcoin'
        }
    },
]

export default apps
