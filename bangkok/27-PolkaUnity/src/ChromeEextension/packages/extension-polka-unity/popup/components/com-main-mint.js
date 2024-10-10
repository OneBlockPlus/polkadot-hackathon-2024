// // import store from "../../store-esm.js";
// import store from "../util/store.js";

class CustomButton extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = /*html*/`
      <style>
         @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        .com-main-mint {
            font-family: "Plus Jakarta Sans";
            position: relative;
            top:0;
            .switch {
                position: absolute;
                top: 10px;
                right: 10px;
                cursor: pointer;
            }
            .con0{
                display: flex;  
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap:10px;
                width:70%;
                margin:30px auto 30px;
                padding-top:53px;
                .t1{
                    font-size: 38px;
                    line-height: 46px;
                    position:relative;
                    top:0;
                    i{
                        font-style: normal;
                        font-size: 18px;
                        line-height:20px;
                        position:absolute;
                        top: 0px;
                        left: 0px;
                    }
                    span{
                        padding-left:15px;
                    }
                    font{
                        color:#aaa;
                        font-size: 16px;
                    }
                }
                .t2{
                    display: flex;  
                    align-items: center;
                    justify-content: center;
                    gap:10px;
                    font-size:14px;
                    label{
                        background-color:#4CEAAC;
                        color:#000;
                        border-radius:10px;
                        font-size: 10px;
                        padding: 4px 10px;
                    }
                }
                .t3{
                    margin-top:20px;
                    width:100%;
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    align-items: center;
                    span{
                        width:50px;
                        height:50px;
                        background-color:#004BFF;
                        border-radius:20px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        img{
                            width:24px;
                        }
                    }
                }
            }
            .con {
                display: flex;  
                align-items: center;
                justify-content: center;
                flex-direction: column;  
                padding:53px 0;  
                gap:10px;
                .avatar{
                    width:61px;
                    height:61px;
                    border-radius:100%;
                    background-color:#fff;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    img{
                        width: 24px;
                        height:24px;
                    }
                }
                .title{
                    font-size:20px;
                    font-weight:600;
                    line-height:50px;
                }
                .btn{
                    background-color:#004BFF;
                    width: 183px;
                    height: 33px;
                    font-size:20px;
                    line-height: 33px;
                    border-radius: 33px;
                    text-align: center;
                    cursor: pointer;
                }
            }
            #con2{
                .title{
                    font-size: 27px;
                    line-height: 38px;
                }
                .btn{
                    margin-top: 20px;
                }
            }
            .pop{
                width: 100%;
                position: fixed;
                bottom: -500px;
                left: 0;
                background-color: #000;
                z-index: 3;
                transition:all .3s;
                border-radius: 32px 32px 0px 0px;
                background: var(--Background-Primary-background, #0C0C0C);
                padding-bottom:20px;
                .hader{
                    display:block;
                    width: 100%;
                    border-bottom: 1px solid #333;
                    height:60px;
                    text-align:center;
                    position:relative;
                    top:0;
                    font-size: 20px;
                    font-weight: 600;
                    line-height: 60px;
                    img{
                        position:absolute;
                        top: 17px;
                        left: 20px;
                    }
                }
                .content{
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    flex-direction:column;
                    padding:16px;
                    gap:25px;
                    .box1{
                        width: calc(100% - 24px);
                        padding: 12px;
                        display:flex;
                        align-items:center;
                        flex-direction:column;
                        gap:16px;
                        border-radius: 8px;
                        font-size:14px;
                        background: var(--Background-Secondary-background, #1A1A1A);
                        div{
                            width:100%;
                            display:flex;
                            align-items:center;
                            justify-content:space-between;
                            label{
                                font-weight:500;
                                line-height:24px;
                            }
                            span{
                                display:flex;
                                align-items:center;
                                font-weight:500;
                                line-height:24px;
                                img{
                                    width:24px;
                                    height:24px;
                                    margin-right:10px;
                                }
                                font{
                                    color:rgba(255, 255, 255, 0.45);
                                }
                            }
                        }                        
                    }
                   .box2{
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        width:100%;
                        div{
                            border-radius: 8px;
                            width:48%;
                            height:52px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:16px;
                            gap:10px;
                            cursor:pointer;
                        }
                        .btn2{
                            background: var(--Background-Secondary-background, #1A1A1A);
                        }
                        .btn3{
                            background: var(--Geek-Blue-Geek-Blue-6, #004BFF);
                        }
                    }
                }
            }
            .minting{
                width:100%;
                height:100%;
                display:block;
                overflox:hidden;
                z-index:3;
                position:fixed;
                bottom:0;
                left:400px;
                background-color:#000;
                transition:all .3s;
                .hader{
                    display:block;
                    width: 100%;
                    height:60px;
                    text-align:center;
                    position:relative;
                    top:0;
                    font-size: 20px;
                    font-weight: 600;
                    line-height: 60px;
                    img{
                        position:absolute;
                        top: 13px;
                        left: 10px;
                    }
                }
                .content{
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    flex-direction:column;                   
                    .loading{
                        width: 112px;
                        height: 112px;
                        border-radius: 100%;
                        background-color: #13110d;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        margin-top:100px;
                        img{
                            animation: rotate 2s linear infinite;
                        }
                    }
                    label{
                        font-size: 24px;
                        font-weight: 600;
                        line-height: 86px;
                    }
                    span{
                        text-align: center;
                        max-width: 300px;
                        font-size: 16px;
                        color: var(--white-text-white-65-primary-text, rgba(255, 255, 255, 0.65));
                    }
                }
            }
            .successful{
                width:100%;
                height:100%;
                display:block;
                overflox:hidden;
                z-index:4;
                position:fixed;
                bottom:0;
                transition:all .3s;
                left:400px;
                background-color:#000;
                .hader{
                    display:block;
                    width: 100%;
                    height:60px;
                    text-align:center;
                    position:relative;
                    top:0;
                    font-size: 20px;
                    font-weight: 600;
                    line-height: 60px;
                    img{
                        position:absolute;
                        top: 21px;
                        left: 20px;
                    }
                }
                .content{
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    flex-direction:column;                   
                    .loading{
                        width: 112px;
                        height: 112px;
                        border-radius: 100%;
                        background-color: #13221c;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        margin-top:50px;
                    }
                    label{
                        font-size: 24px;
                        font-weight: 600;
                        line-height: 86px;
                    }
                    span{
                        text-align: center;
                        max-width: 300px;
                        font-size: 16px;
                        color: var(--white-text-white-65-primary-text, rgba(255, 255, 255, 0.65));
                    }
                }
                .btns{
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    flex-direction:column;
                    gap:16px;
                    margin-top:20px;
                    margin:90px 20px 20px;
                   span{
                        width:100%;
                        height: 52px;
                        line-height: 52px;
                        font-size: 16px;
                        border-radius: 8px;
                        text-align: center;
                        background: var(--Gray-Gray-1, #1B1B1B);
                        cursor: pointer;
                   }
                   .btn-primary{
                        background: var(--Geek-Blue-Geek-Blue-6, #004BFF);
                   }
                }
            }
        } 
    </style>
    <div class="com-main-mint">
        <img class="switch" id="switch" width="36" height="20" src="img/Switch-1.png" />
        <div class="con0" id="con0">
            <div class="t1">
                <i>$</i>
                <span>52,323<font>.43</font> M</span>
            </div>
            <div class="t2">
                <img class="t2-1" width="24" height="24" src="img/EyeSlash.png" />
                <span>+$9,000</span>
                <label>+11.32%</label>
                <img class="t2-3" width="24" height="24" src="img/ArrowsClockwise.png" />
            </div>
            <div class="t3">
                <span>
                    <img class="t3-1" width="24" height="24" src="img/CopySimple.png" />
                </span>
                <span>
                    <img class="t3-2" width="24" height="24" src="img/PaperPlaneTilt.png" />
                </span>
                <span>
                    <img class="t3-3" width="24" height="24" src="img/ArrowsLeftRight.png" />
                </span>
                <span>
                    <img class="t3-4" width="24" height="24" src="img/ShoppingCartSimple.png" />
                </span>
            </div>
        </div>
        <div class="con" id="con1" style="display:none;">
            <div class="avatar"><img width="31" height="31" src="img/user.png" /></div>
            <div class="title">mint your first SBT</div>
            <div class="btn">mint</div>
        </div>
        <div class="con" id="con2" style="display:none;">
            <div class="title">current score</div>
            <div class="title">300 point</div>
            <div class="btn">see missions</div>
        </div>
        <com-coin-list></com-coin-list>
        <div class="pop">
            <div class="hader">
                <img class="btn" width="24" height="24" src="img/X.png" alt="logo" />
                Mint confirmation
            </div>
            <div class="content">
                <div class="box1">
                    <div>
                        <label>Wallet name</label>
                        <span>
                            <img class="btn" width="24" height="24" src="img/da1.png" />
                            <font>SubWallet 01</font>
                        </span>
                    </div>
                    <div>
                        <label>Address</label>
                        <span>
                            <font>0xee4189...377797cd3</font>
                        </span>
                    </div>
                    <div>
                        <label>Network</label>
                        <span>
                            <img class="btn" width="24" height="24" src="img/da2.png" />
                            <font>vara network</font>
                        </span>
                    </div>
                </div>
                <div class="box1">
                    <div>
                        <label>Estimated</label>
                        <span>
                            <font>+1 SBT</font>
                        </span>
                    </div>
                    <div>
                        <label>Estimated fee</label>
                        <span>
                            <font>1 vara</font>
                        </span>
                    </div>
                </div>
                <div class="box2">
                    <div class="btn btn2">
                        <img width="24" height="24" src="img/XCircle.png" />
                        Cancel
                     </div>
                    <div class="btn3" id="btnApprove">
                        <img width="24" height="24" src="img/CheckCircleW.png" />
                        Approve
                    </div>
                </div>
            </div>
        </div>
        <div class="minting">
            <div class="hader" id="mintingBack">
                <img class="btn" width="40" height="40" src="img/back.png" />
                minting
            </div>
            <div class="content">
                <div class="loading">
                    <img class="btn" width="54" height="54" src="img/loading.png" />
                </div>
                <label>Processing...</label>
                <span>Please stay on this page while the transaction is being processed</span>
            </div>
        </div>
        <div class="successful">
            <div class="hader" id="successfulBack">
                <img class="btn" width="24" height="24" src="img/X.png" />
                Successful
            </div>
            <div class="content">
                <div class="loading">
                    <img class="btn" width="64" height="64" src="img/CheckCircle.png" />
                </div>
                <label>All done!</label>
                <span>Your request has been sent. You can track its progress on the Transaction History page.</span>
            </div>
            <div class="btns">
                <span>View transaction</span>
                <span class="btn-primary" id="btnBackHome">Back to home</span>
            </div>
        </div>
    </div>`;
        const content = template.content.cloneNode(true);
        const buttons = content.querySelectorAll('.btn');
        const pop = content.querySelector('.pop');
        const btnApprove=content.querySelector('#btnApprove');
        const minting=content.querySelector('.minting');
        const successful=content.querySelector('.successful');
        const btnBackHome=content.querySelector('#btnBackHome');
        const con0=content.querySelector('#con0');
        const con1=content.querySelector('#con1');
        const con2=content.querySelector('#con2');
        const mintingBack=content.querySelector('#mintingBack');
        const successfulBack=content.querySelector('#successfulBack');
        const switchBtn=content.querySelector('#switch');
        let isShow = false;
        let timeout=null;
        let isShowBalance=true;
        switchBtn.addEventListener('click', () => {
            if (isShowBalance) {
                con1.style.display="flex";
                con0.style.display="none";
                switchBtn.src="img/Switch-0.png";                
            } else {
                con1.style.display="none";
                con0.style.display="flex";
                switchBtn.src="img/Switch-1.png";
            }
            isShowBalance=!isShowBalance;
        });
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (isShow) {
                    pop.style.bottom = "-"+pop.offsetHeight+'px';
                    isShow = false;
                } else {
                    pop.style.bottom = '0px';
                    isShow = true;
                }
            });
        });
        btnApprove.addEventListener('click', () => {
            minting.style.left="0px";
            clearTimeout(timeout);
            timeout=setTimeout(() => {
                successful.style.left="0px";                
            }, 3000);
        });
        const complete=()=>{
            minting.style.left="400px";
            successful.style.left="400px";  
            pop.style.bottom = "-"+pop.offsetHeight+'px';
            isShow = false;
            con1.style.display="none";
            con2.style.display="flex";
        }
        btnBackHome.addEventListener('click',complete);
        successfulBack.addEventListener('click',complete);
        
        mintingBack.addEventListener('click', () => {
            clearTimeout(timeout);
            minting.style.left="400px";
        });
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.append(content);
    }
}

customElements.define('com-main-mint', CustomButton);