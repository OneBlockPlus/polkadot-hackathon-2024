<template>
    <div class="home-container">
      <div class="header">
        <h1>Swap safely, no MEV risks.</h1>
      </div>
      <div class="swap-box">
        <div class="swap-input">
          <label for="sell" class="input-label">Sell</label>
          <select id="sell" class="custom-select">
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
            <option value="USDT">USDT</option>
          </select>
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
  
      <div class="description">
        <h1>
            Learn more about the superpowers of defending against MEV.
        </h1>
      </div>
    </div>
    <div class="second-section">
    <div class="content-container">
      <!-- 左侧图片 -->
      <div class="image-box">
        <img src="../assets/未命名的设计.png" alt="Informative Image">
      </div>

      <!-- 右侧文字 -->
      <div class="text-box">
        <h2>What is MEV?</h2>
        <p>
          Miner Extractable Value (MEV) refers to the maximum value that miners 
          can extract from block production, by including, excluding, and 
          changing the order of transactions.
        </p>
        <button class="learn-more-btn">Learn More</button>
      </div>
    </div>
  </div>
  </template>
  
  <style scoped>
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
    height: 90vh;
    background-color: #0a0a0a;
    color: white;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  
  .header h1 {
    font-size: 2.5vw;
    margin-bottom: 5vh;
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
    padding: 1vh 2vw;
    border-radius: 1.5rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
    width:30%;
    height: 30%;
    animation: purple-glow 3s infinite ease-in-out;
  }
  
  .swap-input {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    margin-bottom: 2vh;
  }
  
  .input-label {
    font-size: 1.2vw;
    color: #ff00ff;
    margin-bottom: 1vh;
  }
  
  .custom-select {
    width: 100%;
    padding: 1.2vh;
    font-size: 0.9vw;
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

  
  .get-started-btn {
    background-color: #ff00ff;
    color: white;
    padding: 1vh 3vw;
    font-size: 1.0 vw;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: transform 0.3s ease;
    animation: purple-glow 3s infinite ease-in-out;
  }
  
  .get-started-btn:hover {
    transform: scale(1.1);
  }
  
  .description h1{
    background: linear-gradient(90deg, rgba(128, 0, 128, 1) 0%, rgba(255, 0, 255, 1) 100%);;
    margin-top: 3rem;
    font-size: 1.2rem;
    max-width: 400px;
    opacity: 0.85;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
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

  /* 下滑页面的样式 */
.second-section {
  display: none;
  height: 90vh;
  background-color: #0a0a0a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: left;
  padding: 0 5%;
}

.content-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.image-box {
  flex: 1;
  padding-right: 2rem;
}

.image-box img {
  max-width: 100%;
  border-radius: 1rem;
  /* box-shadow: 0 0 15px rgba(128, 0, 128, 0.5); */
}

.text-box {
  flex: 1;
  padding-left: 2rem;
}

.text-box h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.text-box p {
  font-size: 1.2rem;
  line-height: 1.5;
}

.learn-more-btn {
  background-color: #ff00ff;
  color: white;
  padding: 0.8rem 2rem;
  margin-top: 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  animation: purple-glow 3s infinite ease-in-out;
}

.learn-more-btn:hover {
  transform: scale(1.1);
}


  </style>
  