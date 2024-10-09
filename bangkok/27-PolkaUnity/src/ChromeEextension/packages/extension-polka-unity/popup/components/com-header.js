// // import store from "../../store-esm.js";
// import store from "../util/store.js";
import maker from "./maker.js";

maker({
    name: "com-header",
    attrs: ['txt'],
    mounted: () => { },
    html:/*html*/`
    <style>
        .com-header {
            position: fixed;
            top: 0px;
            left: 0;
            width: calc(100% - 24px);
            height:40px;
            background-color: #1A1A1A;
            padding: 8px 12px;
            border-bottom: 1px solid #0d0f0e;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition :all .5s;
            z-index: 2;
            .left{
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 100%;
                gap: 8px;
                font-size: 14px;
                font-weight: 500;
                .acc{
                    cursor: pointer;
                    color: var(--white-text-white-45-secondary-text, rgba(255, 255, 255, 0.45));
                    img{
                        transform: rotate(90deg);                        
                    }
                }
            }
            .right{
                display:flex;
                align-items: center;
                gap: 10px;
                img{
                    cursor: pointer;
                }
            }
        } 
    </style>
    <div class="com-header">
        <div class="left">
            <img class="logo" width="24" height="24" src="img/Logo.png" alt="logo" />
            <div class="title">SubWallet 01</div>
            <div class="acc">
                (...1ac) <img width="12" height="12" src="img/CaretRight.png" alt="logo" />
            </div>
        </div>
        <div class="right">
            <img class="img1" width="36" height="36" src="img/Ghostbutton.png" />
            <img class="img2" width="28" height="28" src="img/FadersHorizontal.png" />
            <img class="img3" width="24" height="24" src="img/BellSimpleRinging.png" />
        </div>
    </div>
    `
});