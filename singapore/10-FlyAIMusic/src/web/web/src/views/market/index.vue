<script setup lang='ts'>

import {useRouter} from "vue-router"
import {useUser} from '@/store/user'
import {web3Accounts, web3Enable} from "@polkadot/extension-dapp";
const router = useRouter()
const userStore = useUser() //创建store
const handlePlayList = () => {
  router.push({
    name: 'recommend'
  })
}

let handleLogin = () => {
  if (userStore.accountInfo) {
    router.push({
      name: 'personal',
      query: {
        uid: userStore.accountInfo.userId
      }
    })
  }
}

const connectWallet = async () => {
  // Enable the Polkadot.js extension
  const extensions = await web3Enable('Polkadot Wallet Login1');
  console.log(extensions.length);
  if (extensions.length === 0) {
    return;
  }

  // Get all accounts from the extension
  const allAccounts = await web3Accounts();

  //
  if(allAccounts.length > 0){
    const account = allAccounts[0];
    userStore.accountInfo = {
      userId  :  account.address,
      nickname :  account.meta.name
    }
    handleLogin();
  }

};
</script>

<template>
    <div style="height: 100%; overflow-y: scroll;">
        <header>
            <nav>
                <ul class="nav-body">
                    <li class="nav-item">FlyAIMusic</li>
                    <li class="nav-item">Explore</li>
                    <li class="nav-item">Create</li>
                    <li class="nav-item">Marketplace</li>
                    <li class="nav-item">Community</li>
                    <li class="nav-item">Artists</li>
                    <li class="nav-item btn" @click="connectWallet">
                      {{userStore.accountInfo ? userStore.accountInfo.nickname : 'Connect Wallet'}}
                    </li>
                </ul>
            </nav>
        </header>
        <section>
            <div class="ban-body">
                <div class="ban-title">
                    <p>Create, Mint, and Trade </p>
                    <p>AI-Generated Music NFTs</p>
                    <span>Join the revolution of music creation and ownership in the digital age</span>
                </div>
                <div class="ban-start btn">
                    <div class="ban-btn" @click="handlePlayList">
                        Start Creating
                    </div>
                </div>
                <ul>
                    <li>
                        <div>
                            <img src="../../assets/img/m_0_1.png" alt="">
                            <p>AI Music Generation</p>
                            <p>Create unique tracks with our state-of-the-art AI models</p>
                        </div>
                    </li>
                    <li>
                        <div>
                            <img src="../../assets/img/m_0_2.png" alt="">
                            <p>NFT Minting</p>
                            <p>Turn your creations into valuable digital assets</p>
                        </div>
                    </li>
                    <li>
                        <div>
                            <img src="../../assets/img/m_0_3.png" alt="">
                            <p>Marketplace</p>
                            <p>Buy, sell, and trade music NFTs in our vibrant marketplace</p>
                        </div>
                    </li>
                </ul>
            </div>
            <h1 class="title">Earn Through Music Mining</h1>

            <div class="content-body">
                <img class="img-left" src="../../assets/img/m_1.png" alt="">
                <div class="right">
                    <h2 class="title">Multiple Ways to Earn</h2>
                    <ul>
                        <li><img src="../../assets/img/m_1_1.png" alt=""><span>Create music and earn tokens</span></li>
                        <li><img src="../../assets/img/m_1_2.png" alt=""><span>Participate in community
                                activities</span></li>
                        <li><img src="../../assets/img/m_1_3.png" alt=""><span>Collect and hold valuable NFTs</span>
                        </li>
                        <li><img src="../../assets/img/m_1_4.png" alt=""><span>Collaborate with other artists</span>
                        </li>
                    </ul>
                    <div class="btn">Learn More</div>
                </div>
            </div>

            <h1 class="title">Featured Music NFTs</h1>

            <ul class="market-body">
                <li>
                    <img src="../../assets/img/m_01.png" alt="">
                    <div class="content-box">
                        <p class="title">Cosmic Harmony</p>
                        <p class="desc">By AstroBeats</p>
                        <div class="price">
                            <span>0.5 DOT</span>
                            <div class="btn">Bid Now</div>
                        </div>
                    </div>
                </li>
                <li>
                    <img src="../../assets/img/m_02.png" alt="">
                    <div class="content-box">
                        <p class="title">Cosmic Harmony</p>
                        <p class="desc">By AstroBeats</p>
                        <div class="price">
                            <span>0.5 DOT</span>
                            <div class="btn">Bid Now</div>
                        </div>
                    </div>
                </li>
                <li>
                    <img src="../../assets/img/m_03.png" alt="">
                    <div class="content-box">
                        <p class="title">Cosmic Harmony</p>
                        <p class="desc">By AstroBeats</p>
                        <div class="price">
                            <span>0.5 DOT</span>
                            <div class="btn">Bid Now</div>
                        </div>
                    </div>
                </li>
            </ul>


        </section>
        <footer>
            <div class="desc-body">
                <h1 class="title">Ready to Start Your Music NFT Journey?</h1>
                <p>Join thousands of creators and collectors in the new era</p>
                <p>of digital music ownership</p>
                <div class="btn">Get Started Now</div>
            </div>
            <ul class="footer-body">
                <li>
                    <p class="title">MusicMint</p>
                    <p>Revolutionizing music creation and ownership</p>
                </li>
                <li>
                    <p class="title">Quick Links</p>
                    <p>About Us</p>
                    <p>FAQ</p>
                    <p>Terms of Service</p>
                </li>
                <li>
                    <p class="title">Connect With Us</p>
                    <div class="icon-img">
                        <img src="../../assets/img/m_3_1.png" alt="">
                        <img src="../../assets/img/m_3_2.png" alt="">
                        <img src="../../assets/img/m_3_3.png" alt="">
                        <img src="../../assets/img/m_3_4.png" alt="">
                    </div>
                </li>
            </ul>
            <p class="text">© 2024 MusicMint. All rights reserved.</p>

        </footer>
    </div>
</template>

<style scoped lang="less">
.btn{
    cursor: pointer;
}
.nav-body {
    display: flex;
    background-color: rgb(17, 16, 34);
    padding: 16px 96px;

    li {
        flex: auto;
        text-align: center;
        color: #fff;
        line-height: 32px;

        &:first-child {
            flex: 4;
            text-align: left;
            padding: 0 24px 0 0;
            font-weight: bold;
        }

        &:last-child {
            flex: none;
            width: 163px !important;
            font-family: Segoe UI;
            font-size: 16px;
            font-weight: 700;
            line-height: 24px;
            text-align: center;
            color: #fff;
            height: 40px;
            line-height: 40px;
            border-radius: 50px;
            background: linear-gradient(90deg, #DF4AD2 0%, #7915E4 100%);
        }
    }
}

.ban-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgb(17, 16, 34);
    margin-bottom: 53px;
    background-image: url('../../assets/img/m_0.png');

    .ban-title {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #fff;
        margin: 80px 0 0 0;

        p {
            // width: 90%;
            font-family: Segoe UI;
            font-size: 80px;
            font-weight: 700;
            line-height: 90px;
            text-align: center;
            text-align: center;
        }

        span {
            font-family: Segoe UI;
            font-size: 24px;
            font-weight: 400;
            line-height: 28px;
            text-align: center;
            padding: 20px;
        }
    }

    .ban-start {
        position: relative;
        margin: 43.5px 0 61px 0;
        background: linear-gradient(90deg, rgba(223, 74, 210, 0.3) 0%, rgba(121, 21, 228, 0.3) 100%);
        border: 1px solid;
        padding: 10px;
        border-radius: 72px;
        overflow: hidden;

        .ban-btn {
            width: 194px;
            height: 52px;
            line-height: 52px;
            text-align: center;
            background: linear-gradient(90deg, #DF4AD2 0%, #7915E4 100%);
            border-radius: 52px;
            color: #fff;
        }

    }

    ul {
        display: flex;
        justify-content: space-around;
        margin-bottom: 68px;

        li {
            border: 2px solid transparent;
            background-clip: content-box, border-box;
            background-origin: content-box, border-box;
            background-image: linear-gradient(to right, rgba(31, 22, 52, 0.71), rgba(31, 22, 52, 0.71)), linear-gradient(98.8deg, #E36DFB 1.1%, rgba(168, 108, 198, 0.14) 26.72%, rgba(168, 108, 198, 0.47) 56.46%, #C75DF8 100.04%);
            width: 360px;
            border-radius: 20px;

            div {
                padding: 17px 24px 10px 24px;
            }

            img {
                width: 48px;
                height: 48px;
            }

            p {
                font-family: Segoe UI;
                font-size: 20px;
                font-weight: 600;
                line-height: 28px;
                text-align: left;
                padding: 10px 0 10px 0;
                color: #fff;

                &:last-child {
                    font-size: 14px;
                    color: #FFFFFFCC;
                }
            }

            &:first-child {
                margin-right: 20px;
            }

            &:last-child {
                margin-left: 20px;
            }

        }
    }
}

.content-body {
    display: flex;
    justify-content: center;
    margin-bottom: 50px;

    .img-left {
        width: 427px;
        height: 454px;
    }

    .right {
        li {
            margin-bottom: 20px;
        }

        .title {
            font-family: Segoe UI;
            font-size: 40px;
            font-weight: 700;
            line-height: 90px;
            text-align: center;
            margin-bottom: 31px;
            margin-top: 70px;
        }

        span {
            font-family: Segoe UI;
            font-size: 20px;
            font-weight: 600;
            line-height: 24px;
            text-align: left;

        }

        img {
            width: 19px;
            height: 19px;
            margin-right: 8px;
        }


    }

    .btn {
        background: linear-gradient(90deg, #DF4AD2 0%, #7915E4 100%);
        width: 134px;
        height: 40px;
        border-radius: 40px;
        line-height: 40px;
        font-family: Segoe UI;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        color: #fff;
        margin-top: 36px;
    }
}

.market-body {
    background-image: url('../../assets/img/m_2.png');
    background-size: cover;
    display: flex;
    justify-content: center;

    li {
        width: 384px;
        border-radius: 32px;
        overflow: hidden;
        border-radius: 20px;
        padding: 10px;
        background: linear-gradient(45deg, rgba(73, 44, 253, 1), rgba(250, 28, 255, 1));

        .content-box {
            padding: 20px;
            background-color: #fff;
            border-bottom-left-radius: 16px;
            border-bottom-right-radius: 16px;
        }

        &:first-child {
            margin-right: 48px;
        }

        &:last-child {
            margin-left: 48px;
        }

        img {
            width: 100%;
            height: 384px;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
        }

        .title {
            font-family: Segoe UI;
            font-size: 24px;
            font-weight: 600;
            line-height: 28px;
            text-align: left;
        }

        .desc {
            font-size: 16px;
            font-weight: 400;
            line-height: 24px;
            color: #4B5563;
            margin-bottom: 15px;

        }

        .price {
            display: flex;
            justify-content: space-between;

            span {
                color: #9333EA;
                font-family: Segoe UI;
                font-size: 24px;
                font-weight: 700;
                line-height: 24px;
                text-align: left;
            }

            .btn {
                background: linear-gradient(90deg, #DF4AD2 0%, #7915E4 100%);
                width: 105px;
                height: 36px;
                line-height: 36px;
                color: #fff;
                font-family: Segoe UI;
                font-size: 16px;
                font-weight: 600;
                text-align: center;
                border-radius: 36px;
            }
        }

    }
}

.desc-body {
    color: #fff;

    h1 {
        font-family: Segoe UI;
        font-size: 48px;
        font-weight: 700;
        line-height: 40px;
        text-align: center;
        margin-bottom: 20px;
    }

    p {
        font-family: Segoe UI;
        font-size: 24px;
        font-weight: 400;
        line-height: 35px;
        text-align: center;
    }

    .btn {
        background: linear-gradient(90deg, #DF4AD2 0%, #7915E4 100%);
        width: 214px;
        height: 52px;
        line-height: 52px;
        font-family: Segoe UI;
        font-size: 18px;
        font-weight: 700;
        text-align: center;
        border-radius: 52px;
        margin: 31px auto 73px auto;
        color: #fff;
    }
}

footer {
    height: 682px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background-image: url('../../assets/img/m_3.png');
}

.footer-body {
    display: flex;
    justify-content: center;
    width: 80%;
    margin: 0 auto;

    li {
        flex: 1;

        p {
            font-family: Segoe UI;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            text-align: left;
            color: #fff;
            margin-bottom: 5px;
            cursor: pointer;
        }

        .title {
            font-family: Segoe UI;
            font-size: 18px;
            font-weight: 600;
            line-height: 28px;
            text-align: left;
            color: #fff;
            margin-bottom: 8px;

        }

        .icon-img {
            img {
                width: 24px;
                height: 24px;
            }

        }


    }


}

.text {
    font-family: Segoe UI;
    font-size: 14px;
    font-weight: 300;
    line-height: 20px;
    text-align: center;
    color: #fff;
    padding-bottom: 35px;
    padding-top: 20px;
}

.title {
    font-family: Segoe UI;
    font-size: 56px;
    font-weight: 700;
    line-height: 90px;
    text-align: center;
    margin-bottom: 36px;
}

.btn-back {
    background: linear-gradient(90deg, rgba(223, 74, 210, 0.3) 0%, rgba(121, 21, 228, 0.3) 100%);
}
</style>
