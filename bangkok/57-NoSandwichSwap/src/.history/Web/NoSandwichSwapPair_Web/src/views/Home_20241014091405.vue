<template>
    <div class="home-container">
      <div class="header">
        <h1>Swap anytime, anywhere.</h1>
      </div>
      <div class="swap-box">
        <div class="swap-input">
          <input type="number" placeholder="0" v-model="sellAmount" />
          <span>{{ selectedSellToken }}</span>
        </div>
        <div class="swap-arrow">
          <span>&darr;</span>
        </div>
        <div class="swap-input">
          <input type="number" placeholder="0" v-model="buyAmount" />
          <select v-model="selectedBuyToken">
            <option value="" disabled>Select token</option>
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
        <button class="get-started-btn" @click="swapTokens">Get started</button>
      </div>
      <div class="description">
        <p>
          The largest onchain marketplace. Buy and sell crypto on Ethereum and 11+ other chains.
        </p>
      </div>
      <div class="scroll-indicator">
        <span>&darr;</span>
        <p>Scroll to learn more</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        sellAmount: 0,
        buyAmount: 0,
        selectedSellToken: "ETH",
        selectedBuyToken: "",
      };
    },
    methods: {
      swapTokens() {
        alert(`Swapping ${this.sellAmount} ${this.selectedSellToken} for ${this.buyAmount} ${this.selectedBuyToken}`);
      },
    },
  };
  </script>
  
  <style scoped>
  .home-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: black;
    color: white;
    text-align: center;
    position: relative;
  }
  
  .header h1 {
    font-size: 3rem;
    margin-bottom: 2rem;
  }
  
  .swap-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #222;
    padding: 2rem;
    border-radius: 1rem;
  }
  
  .swap-input {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 300px;
    margin-bottom: 1rem;
  }
  
  .swap-input input {
    width: 70%;
    padding: 0.5rem;
    font-size: 1.5rem;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 0.5rem;
    outline: none;
  }
  
  .swap-input span,
  .swap-input select {
    width: 30%;
    padding: 0.5rem;
    font-size: 1.5rem;
    background-color: #444;
    color: white;
    border: none;
    border-radius: 0.5rem;
    outline: none;
  }
  
  .swap-arrow {
    margin: 1rem;
  }
  
  .get-started-btn {
    background-color: #ff00ff;
    color: white;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
  }
  
  .description {
    margin-top: 2rem;
    font-size: 1rem;
    max-width: 400px;
  }
  
  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .scroll-indicator span {
    font-size: 2rem;
  }
  
  .scroll-indicator p {
    font-size: 1rem;
  }
  </style>
  