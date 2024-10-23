<template>
    <div class="home-container">
      <!-- Main Header Text -->
      <div class="header">
        <h1>Swap anytime, anywhere.</h1>
      </div>
  
      <!-- Swap Box -->
      <div class="swap-box">
        <div class="swap-input">
          <label for="sell" class="input-label">Sell</label>
          <select id="sell" class="custom-select">
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
  
        <div class="swap-arrow">
          <span>&darr;</span>
        </div>
  
        <div class="swap-input">
          <label for="buy" class="input-label">Buy</label>
          <select id="buy" class="custom-select">
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
  
        <button class="get-started-btn">Get started</button>
      </div>
  
      <!-- Description -->
      <div class="description">
        <p>
          The largest onchain marketplace. Buy and sell crypto on Ethereum and 11+ other chains.
        </p>
      </div>
  
      <!-- Scroll Indicator -->
      <div class="scroll-indicator">
        <span>&darr;</span>
        <p>Scroll to learn more</p>
      </div>
    </div>
  </template>
  
  <style scoped>
  @keyframes purple-glow {
    0% {
      box-shadow: 0 0 15px 5px rgba(128, 0, 128, 0.4);
    }
    50% {
      box-shadow: 0 0 30px 10px rgba(255, 0, 255, 0.7);
    }
    100% {
      box-shadow: 0 0 15px 5px rgba(128, 0, 128, 0.4);
    }
  }
  
  .home-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    top:-10 vh
    background-color: #0a0a0a;
    color: white;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  
  .header h1 {
    font-size: 4rem;
    margin-bottom: 3rem;
    font-family: 'Poppins', sans-serif;
    letter-spacing: 0.1rem;
    background: linear-gradient(90deg, rgba(128, 0, 128, 1) 0%, rgba(255, 0, 255, 1) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .swap-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #1a1a1a;
    padding: 2.5rem;
    border-radius: 1.5rem;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
    animation: purple-glow 3s infinite ease-in-out;
  }
  
  .swap-input {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    max-width: 400px;
    margin-bottom: 1.5rem;
  }
  
  .input-label {
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
    color: #ff00ff;
  }
  
  .custom-select {
    width: 100%;
    padding: 0.7rem;
    font-size: 1.8rem;
    background-color: #2a2a2a;
    color: white;
    border: none;
    border-radius: 0.5rem;
    outline: none;
    appearance: none;
    position: relative;
    transition: background 0.3s ease;
  }
  
  .custom-select:hover {
    background-color: #333;
  }
  
  .custom-select::after {
    content: '';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-top-color: #ff00ff;
  }
  
  .swap-arrow {
    margin: 1.5rem 0;
    font-size: 2rem;
    color: #ff00ff;
    animation: purple-glow 1s infinite ease-in-out;
  }
  
  .get-started-btn {
    background-color: #ff00ff;
    color: white;
    padding: 1rem 3rem;
    font-size: 1.3rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: transform 0.3s ease;
    animation: purple-glow 3s infinite ease-in-out;
  }
  
  .get-started-btn:hover {
    transform: scale(1.1);
  }
  
  .description {
    margin-top: 3rem;
    font-size: 1.2rem;
    max-width: 400px;
    opacity: 0.85;
  }
  
  .scroll-indicator {
    position: absolute;
    bottom: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .scroll-indicator span {
    font-size: 2.5rem;
    animation: purple-glow 1.5s infinite ease-in-out;
  }
  
  .scroll-indicator p {
    font-size: 1.1rem;
    margin-top: 0.5rem;
    opacity: 0.8;
  }
  
  .home-container::before {
    content: "";
    position: absolute;
    width: 200%;
    height: 200%;
    background: linear-gradient(130deg, rgba(128, 0, 128, 0.2), rgba(255, 0, 255, 0.3));
    top: -50%;
    left: -50%;
    animation: purple-flow 6s infinite linear;
    z-index: -1;
  }
  
  @keyframes purple-flow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  </style>
  