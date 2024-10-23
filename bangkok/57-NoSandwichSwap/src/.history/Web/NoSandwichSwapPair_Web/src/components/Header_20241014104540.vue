<template>
    <header class="header">
      <div class="logo">
        <img src="../assets/uniswap-logo.png" alt="Uniswap Logo" />
        <span>Uniswap</span>
      </div>
      <nav class="nav">
        <router-link v-bind:to="{name:'home'}">Home</router-link>
        <router-link v-bind:to="{name: 'trade' }">Trade</router-link>
        <router-link v-bind:to="{name:'explore'}">Explore</router-link>
      </nav>
      <div class="actions">
        <button class="connect-btn" @click="handleWalletConnection">
        {{ isConnected ? truncateAddress(walletAddress) : 'Connect' }}
      </button>
      </div>
    </header>
  </template>
  
  <script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Header',
  computed: {
    ...mapGetters(['walletAddress', 'isConnected']),
  },
  methods: {
    ...mapActions(['connectWallet', 'disconnectWallet']),
    handleWalletConnection() {
      if (!this.isConnected) {
        this.connectWallet();
      } else {
        this.disconnectWallet();
      }
    },
    // 用于截短显示钱包地址
    truncateAddress(address) {
      return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
    }
  },
};
  </script>
  
  <style scoped>
  @font-face {
    font-family: 'Sixtyfour_Convergence';
    src: url('../assets/fonts/Sixtyfour_Convergence/SixtyfourConvergence-Regular-VariableFont_BLED,SCAN,XELA,YELA.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Protest_Strike';
    src: url('../assets/fonts/Protest_Strike/Protest_Strike/ProtestStrike-Regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Montserrat';
    src: url('../assets/fonts/Montserrat/Montserrat-Italic-VariableFont_wght.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  *{
    font-family: Montserrat;
    font-weight: bold;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #000;
    color: #fff;
    height: 10vh;
    width: 100%;
    position: fixed;
    z-index: 1000;
  }
  
  .logo {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .logo img {
    height: 5vh;
    margin-left: 2vw;
    margin-right: 2vw;
  }
  
  .logo span {
    font-weight: bold;
    font-size: 1.5vw;
    color: #a24dff; 
  }
  
  .nav {
    display: flex;
    justify-content: center;
    flex: 1;

  }
  
  .nav a {
    font-size: 1.5vw;
    color: #fff;
    text-decoration: none;
    margin: 0 20px;
  }

  .nav a:hover {
    color: #a24dff;
    left:5vw;
  }
  
  .actions {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: flex-end;
  }

.connect-btn {
  font-size: 1vw;
  background-color: #a24dff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.3s ease;
  margin-right: 10vw;
}

.connect-btn:hover {
  background-color: #8a39db;
}

.connect-btn:active {
  transform: scale(0.95);
  background-color: #722fb7;
}
  </style>
  