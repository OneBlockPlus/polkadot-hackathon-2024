// // import store from "../../store-esm.js";
// import store from "../util/store.js";
import maker from "./maker.js";

let arr=[];
arr.push({
    id:1,
    name:"DOT",
    price:1.685,
    balance:1685,
    balanceUSDT:1685
});
arr.push({
    id:2,
    name:"ETH",
    price:1.685,
    balance:1685,
    balanceUSDT:1685
});
arr.push({
    id:3,
    name:"KSM",
    price:1.685,
    balance:1685,
    balanceUSDT:1685
});
let htmls=[];
for(let i=0;i<arr.length;i++){
    let item=arr[i];
    let html=/*html*/`
    <div class="item">
        <div class="left">
            <img src="img/LOGO${item.id}.png" width="40" height="40" />
            <div class="name">
                <span>${item.name}</span>
                <label>$${item.price}</label>
            </div>
        </div>
        <div class="right">
            <div class="balance">
                <span>${item.balance}</span>
                <label>$${item.balanceUSDT}</label>
            </div>
            <img src="img/CaretRight.png" width="20" height="20" />
        </div>
    </div>
    `;
    htmls.push(html);
}
let htmlStr=htmls.join("");
maker({
    name: "com-coin-list",
    attrs: ['txt'],
    mounted: () => { },
    html:/*html*/`
    <style>
        .com-coin-list {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap:8px;
        }
       .item {
            width: calc(100% - 24px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            height:44px;
            background-color: #1a1a1a;            
            border-radius: 8px;
        }
       .left {
            display: flex;
            align-items: center;
            gap: 10px;
        }
       .name {
            display: flex;
            flex-direction: column;
            span{
                font-size: 16px;
                font-weight: 600;
                color: #fff;
            }
            label{
                font-size: 12px;
                color: #4CEAAC;
            }
        }
       .right {
            display: flex;
            justify-content: center;
            align-items: center;
            gap:12px;
        }
       .balance {
            display: flex;
            flex-direction: column;
            span{
                font-size: 16px;
                color: #fff;
            }
            label{
                font-size: 12px;
                color: rgba(255, 255, 255, 0.45);
            }
        }
    </style>
    <div class="com-coin-list">
        ${htmlStr}
    </div>
    `
});