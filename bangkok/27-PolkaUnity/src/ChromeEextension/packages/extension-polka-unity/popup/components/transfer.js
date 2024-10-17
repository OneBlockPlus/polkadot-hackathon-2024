import store from "../util/store-esm.js";
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
        .container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 100vh;
            padding: 20px;
            box-sizing: border-box;
            background-color: rgb(12, 12, 12);
        }
        .header {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 10px;
            margin-top: 40px;
        }
        .app-icon {
            width: 120px;
            height: 120px;
            border-radius: 12px;
            background-size: 100%;
            background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgo8bWFzayBpZD0ibWFzazBfODY0XzczMDgyIiBzdHlsZT0ibWFzay10eXBlOmFscGhhIiBtYXNrVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4PSIzMyIgeT0iMzMiIHdpZHRoPSI1NCIgaGVpZ2h0PSI1NCI+CjxwYXRoIGQ9Ik02MCAzMy4zOTk5QzgwLjE3MDUgMzMuMzk5OSA4Ni42IDM5LjgyOTQgODYuNiA1OS45OTk5Qzg2LjYgODAuMTcwNCA4MC4xNzA1IDg2LjU5OTkgNjAgODYuNTk5OUMzOS44Mjk1IDg2LjU5OTkgMzMuNCA4MC4xNzA0IDMzLjQgNTkuOTk5OUMzMy40IDM5LjgyOTQgMzkuODI5NSAzMy4zOTk5IDYwIDMzLjM5OTlaIiBmaWxsPSIjMDA0QkZGIi8+CjwvbWFzaz4KPHBhdGggZD0iTTYwIDE2LjVDNzYuNjU5OCAxNi41IDg3LjQ3OSAxOS4xNjI1IDk0LjE1ODIgMjUuODQxOEMxMDAuODM3IDMyLjUyMSAxMDMuNSA0My4zNDAyIDEwMy41IDYwQzEwMy41IDc2LjY1OTggMTAwLjgzNyA4Ny40NzkgOTQuMTU4MiA5NC4xNTgyQzg3LjQ3OSAxMDAuODM3IDc2LjY1OTggMTAzLjUgNjAgMTAzLjVDNDMuMzQwMiAxMDMuNSAzMi41MjEgMTAwLjgzNyAyNS44NDE4IDk0LjE1ODJDMTkuMTYyNSA4Ny40NzkgMTYuNSA3Ni42NTk4IDE2LjUgNjBDMTYuNSA0My4zNDAyIDE5LjE2MjUgMzIuNTIxIDI1Ljg0MTggMjUuODQxOEMzMi41MjEgMTkuMTYyNSA0My4zNDAyIDE2LjUgNjAgMTYuNVoiIHN0cm9rZT0iIzIxMjEyMSIvPgo8cGF0aCBkPSJNNjAgMC41QzgyLjcyNjEgMC41IDk3LjU0NTMgNC4xMjkzOCAxMDYuNzA4IDEzLjI5MkMxMTUuODcxIDIyLjQ1NDcgMTE5LjUgMzcuMjczOSAxMTkuNSA2MEMxMTkuNSA4Mi43MjYxIDExNS44NzEgOTcuNTQ1MyAxMDYuNzA4IDEwNi43MDhDOTcuNTQ1MyAxMTUuODcxIDgyLjcyNjEgMTE5LjUgNjAgMTE5LjVDMzcuMjczOSAxMTkuNSAyMi40NTQ3IDExNS44NzEgMTMuMjkyIDEwNi43MDhDNC4xMjkzOCA5Ny41NDUzIDAuNSA4Mi43MjYxIDAuNSA2MEMwLjUgMzcuMjczOSA0LjEyOTM4IDIyLjQ1NDcgMTMuMjkyIDEzLjI5MkMyMi40NTQ3IDQuMTI5MzggMzcuMjczOSAwLjUgNjAgMC41WiIgc3Ryb2tlPSIjMjEyMTIxIi8+Cjwvc3ZnPgo=);
            Background-repeat: no-repeat;
            background-position: center;
            background-size: 100%;
            display:flex;
            justify-content:center;
            align-items:center;
            img{
                width:60px;
                height:60px;
            }
        }
        .arrow {
            font-size: 36px;
            color: #666;
        }
        .content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        h1 {
            font-size: 28px;
            margin-bottom: 16px;
        }
        p {
            font-size: 18px;
            color: #999;
            margin-bottom: 30px;
        }
        .account {
            background-color: #252525;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            width: 93%;
            max-width: 400px;
            gap: 14px;
        }
        .account-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            margin-right: 16px;
        }
        .account-name {
            font-size: 18px;            
        }
        .view-details {
            font-size: 18px;
            color: #666;
            text-decoration: none;
            display: flex;
            margin-bottom: 40px;
            align-items: center;
            gap: 10px;
        }
        .buttons {
            display: flex;
            justify-content: center;
            width: 100%;
            max-width: 400px;
        }
        .button {
            padding: 16px 0;
            border-radius: 12px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            width: 48%;
            margin: 0 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }
        .cancel {
            background-color: #2a2a2a;
            color: #fff;
        }
        .approve {
            background-color: #004bff;
            color: #fff;
        }
        .loading{
            background-color: #2a2a2a;
            display:none;
        }
        .successful{
            width:100%;
            height:100%;
            display:block;
            overflow:hidden;
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
        .minting{
            width:100%;
            height:100%;
            display:block;
            overflow:hidden;
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
    </style>
    <div class="minting">
        <div class="hader" id="mintingBack">
            <img class="btn" width="40" height="40" src="img/back.png" />
            Loading...
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
     <div class="container">
        <div class="header">
            <div class="app-icon"><img src="img/subwallet.png" /></div>
            <span class="arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><polyline points="176 144 208 176 176 208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline><line x1="48" y1="176" x2="208" y2="176" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><polyline points="80 112 48 80 80 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline><line x1="208" y1="80" x2="48" y2="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line></svg>
            </span>
            <div class="app-icon"><img src="img/more.png" /></div>
        </div>
        <div class="content">
            <h1>Signature request</h1>
            <p>You are approving a request with the following account</p>
            <div class="account">
                <svg class="" height="16.799999999999997" id="5DLmDt3fd5T7eDBFqCFMJXUHQ3u5XZR6aF1Jd9BxTk83YTrL" name="5DLmDt3fd5T7eDBFqCFMJXUHQ3u5XZR6aF1Jd9BxTk83YTrL" viewBox="0 0 64 64" width="16.799999999999997"><circle cx="32" cy="32" fill="#eee" r="32"></circle><circle cx="32" cy="8" fill="hsl(123, 38%, 53%)" r="5"></circle><circle cx="32" cy="20" fill="hsl(157, 38%, 53%)" r="5"></circle><circle cx="21.607695154586736" cy="14" fill="hsl(67, 38%, 15%)" r="5"></circle><circle cx="11.215390309173472" cy="20" fill="hsl(343, 38%, 35%)" r="5"></circle><circle cx="21.607695154586736" cy="26" fill="hsl(303, 38%, 53%)" r="5"></circle><circle cx="11.215390309173472" cy="32" fill="hsl(101, 38%, 15%)" r="5"></circle><circle cx="11.215390309173472" cy="44" fill="hsl(11, 38%, 75%)" r="5"></circle><circle cx="21.607695154586736" cy="38" fill="hsl(22, 38%, 35%)" r="5"></circle><circle cx="21.607695154586736" cy="50" fill="hsl(61, 38%, 53%)" r="5"></circle><circle cx="32" cy="56" fill="hsl(11, 38%, 75%)" r="5"></circle><circle cx="32" cy="44" fill="hsl(22, 38%, 35%)" r="5"></circle><circle cx="42.392304845413264" cy="50" fill="hsl(101, 38%, 15%)" r="5"></circle><circle cx="52.78460969082653" cy="44" fill="hsl(343, 38%, 35%)" r="5"></circle><circle cx="42.392304845413264" cy="38" fill="hsl(303, 38%, 53%)" r="5"></circle><circle cx="52.78460969082653" cy="32" fill="hsl(67, 38%, 15%)" r="5"></circle><circle cx="52.78460969082653" cy="20" fill="hsl(123, 38%, 53%)" r="5"></circle><circle cx="42.392304845413264" cy="26" fill="hsl(157, 38%, 53%)" r="5"></circle><circle cx="42.392304845413264" cy="14" fill="hsl(174, 38%, 15%)" r="5"></circle><circle cx="32" cy="32" fill="hsl(196, 38%, 35%)" r="5"></circle></svg>
                <span class="account-name">Account 1 (cXgF...sSZ2)</span>
            </div>
            <a href="#" class="view-details">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="16"></circle><polyline points="108 100 156 100 156 148" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline><line x1="100" y1="156" x2="156" y2="100" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line></svg>
            View details</a>
            <div class="buttons">
                <div class="button cancel"><img width="24" height="24" src="img/XCircle.png" /> Cancel</div>
                <div class="button approve"><img width="24" height="24" src="img/CheckCircleW.png" /> Approve</div>
                <div class="button loading"><img width="24" height="24" src="img/CheckCircleW.png" /> Loading...</div>
            </div>
        </div>
    </div>`;
        const content = template.content.cloneNode(true);
        const cancel = content.querySelector('.cancel');
        const approve = content.querySelector('.approve');
        const loading = content.querySelector('.loading');
        const successful = content.querySelector('.successful');
        const backHome = content.querySelector('#btnBackHome');
        const minting = content.querySelector('.minting');
        const back=()=>{
            window.close();
            store.remove("sendMessage");
        }
        cancel.addEventListener('click',back);
        approve.addEventListener('click',()=>{
            minting.style.left="0px";
            setTimeout(() => {
                successful.style.left="0";
            }, 3000);
        });
        backHome.addEventListener('click',()=>{
            back();
        });
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.append(content);
    }
}

customElements.define('com-main-transfer', CustomButton);