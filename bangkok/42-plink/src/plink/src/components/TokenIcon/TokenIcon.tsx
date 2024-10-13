import {TokenIcons, ChainIcons} from "@/components/TokenIcon/icons";
import Identicon from 'identicon.js'
import {keccak_256} from "js-sha3";
import {Buffer} from "buffer";

function getStrHash(name: string) {
    let node = "0000000000000000000000000000000000000000000000000000000000000000";

    if (name) {
        let labels = name.split(".");

        for (let i = labels.length - 1; i >= 0; i--) {
            let labelSha = keccak_256(labels[i]);
            node = keccak_256(Buffer.from(node + labelSha, "hex"));
        }
    }

    return "0x" + node;
}

export function stringToColor(str: string) {
    // 使用一个简单的哈希函数将字符串转换为数值
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (str.charCodeAt(i) + ((hash << 5) - hash)) * 2;
    }
    // 转换为颜色代码
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

function IconUnknown (props: {str: string, size: number}) {
    const bg = stringToColor(props.str)

    return <div style={{background: bg, width: `${props.size}px`, height: `${props.size}px`, fontSize: `${props.size / 2}px`}} className={`rounded-full text-white flex flex-row justify-center items-center`}>
        {props.str[0] ? props.str[0].toUpperCase() :  ''}
    </div>
}


export default function TokenIcon({symbol='default', size, chain, rounded=true} : {symbol: string, size: number, chain?: string, rounded?: boolean}) {
    const options = {
        foreground: [216, 140, 173, 255] ,
        background: [245, 245, 245, 255] ,
        margin: 0,
        size: size,
        format: 'svg'
    }

    const tokenIcon = TokenIcons[symbol.toUpperCase()] || 'data:image/svg+xml;base64,' + new Identicon(getStrHash(symbol), (options as any)).toString()
    const chainIcon = chain ? ChainIcons[chain]: undefined

    return <div className={`relative mr-3`} style={{width: size + 'px', height: size + 'px'}}>
        {!!TokenIcons[symbol.toUpperCase()] ?
            <img src={tokenIcon} className={`bg-gray-200 ${rounded ? 'rounded-full' : 'rounded-lg'}`} alt="icon"
                 width={size} height={size}/>
            : <IconUnknown str={symbol} size={size} />

        }
        {
            chainIcon &&
            <img src={chainIcon}
                 className={`bg-gray-200 ${rounded ? 'rounded-full' : 'rounded-lg'} absolute right-0 top-0 border border-white shadow block`}
                 style={{marginRight: (size/ 8 * -3) + 'px'}}
                 width={size/4 * 3} height={size/4 * 3} alt=""/>
        }
    </div>
}
