// // import store from "../../store-esm.js";
// import store from "../util/store.js";
import maker from "./maker.js";

maker({
    name: "com-nav",
    attrs: ['txt'],
    mounted: () => { },
    html:/*html*/`
    <style>
        .com-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            width: calc(100% - 24px);
            padding:0 12px;
            height: 68px;
            background-color: #1a1a1a;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 20px 20px 0px 0px;
            gap:16px;
            z-index: 2;
            div{
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center; 
                height:100%;
                cursor:pointer;
                img{
                    width:24px;
                }
                label{
                    font-size: 10px;
                    color: var(--white-text-white-45-secondary-text, rgba(255, 255, 255, 0.45));
                }
            }
        } 
    </style>
    <div class="com-nav">
       <div>
            <img width="24" height="24" src="img/Wallet.png" />
            <label>Token</label>
       </div>
       <div>
            <img width="24" height="24" src="img/Aperture.png" />
            <label>Token</label>
       </div>
       <div>
            <img width="24" height="24" src="img/Vault.png" />
            <label>Token</label>
       </div>
       <div>
            <img width="24" height="24" src="img/Parachute.png" />
            <label>Token</label>
       </div>
       <div>
            <img width="24" height="24" src="img/Clock.png" />
            <label>Token</label>
       </div>
    </div>
    `
});