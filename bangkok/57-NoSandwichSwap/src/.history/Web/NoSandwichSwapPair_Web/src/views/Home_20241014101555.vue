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
      <div class="image-box">
        <img src="../assets/未命名的设计.png" alt="Informative Image">
      </div>
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
  <div class="explanation">
    <div class="explanation-item hidden">
      <h2></h2>
      <p></p>
      <a href="https://zh.wikipedia.org/wiki/%E4%BA%94%E8%A1%8C" target="_blank">
        <button class="cta-button learn-more">Learn More</button>
      </a>
    </div>
    <div class="explanation-item hidden">
      <h2></h2>
      <p></p>
      <a href="https://zh.wikipedia.org/zh-cn/%E9%98%B4%E9%98%B3" target="_blank">
        <button class="cta-button learn-more">Learn More</button>
      </a>
    </div>
    <div class="explanation-item hidden">
      <h2></h2>
      <p></p>
      <a href="https://zh.wikipedia.org/wiki/%E5%85%AB%E5%8D%A6" target="_blank">
        <button class="cta-button learn-more">Learn More</button>
      </a>
    </div>
    <div class="explanation-item hidden download">
      <h2 style="color: black;"></h2>
      <p style="color: black;"></p>
      <a>
        <button class="cta-button whitepaper">Whitepaper</button>
      </a>
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
    top:10vh;
    height: 90vh;
    background-color: #0a0a0a;
    color: white;
    text-align: center;
    position: relative;
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
  top:10vh;
}

.content-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: -10vh;
}

.image-box {
  flex: 1;
  padding-right: 2rem;
}

.image-box img {
  max-width: 100%;
  border-radius: 1rem;
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

.explanation {
  display: flex;
  flex-direction: column; /* Change to column layout for smaller screens */
  background-color: #000;
  padding-bottom: 1vh;
  height: 85vh; /* Remove fixed height */
}

.explanation-item {
  display: flex; 
  flex-direction: column; 
  justify-content: space-between;
  margin-top: 5vh; /* Adjust margin using vh */
  width: 100%; /* Full width on smaller screens */
  background-color: #000;
  text-align: center;
  border-bottom: 1px solid #444; /* Change border to bottom for column layout */
  padding: 1vh 1vw; /* Adjust padding for better spacing */
  color: #fff;
  position: relative;
  box-sizing: border-box;
}

.explanation-item:last-child {
  border-bottom: none; 
}

.hidden {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.explanation-item.visible {
  opacity: 1;
  transform: translateY(0);
}

.explanation-item h2 {
  font-size: 1.5vw; /* Responsive font size */
  margin-bottom: 2vh; 
  color: #fff;
  font-family: "ProtestGuerrilla-Regular","SimSun";
}

.learn-more, .whitepaper {
  background: #ff8c00;
  border: none;
  color: #000;
  padding: 1vh 2vw; /* Adjust padding for better spacing */
  font-size: 1vw; /* Responsive font size */
  cursor: pointer;
  transition: background 0.3s ease;
  text-transform: uppercase;
  margin-top: auto;
  margin-bottom: 1vh;
}

.whitepaper {
  background-color: #000;
  color: white;
}

.learn-more:hover, .whitepaper:hover {
  background: #fff;
  color: #ff8c00;
}

.download {
  background-color: #ff8c00;
  color: #000;
}

.explanation-item p {
  font-size: 1.0vw; /* Responsive font size */
  font-family: 'Poppins',"SimSun";
  color: #a1a1a1;
  margin: 1vh 0 2vh; /* Adjust margin using vh */
  line-height: 1.5;
  text-align: left;
}

@media (min-width: 769px) {
  .explanation {
    flex-direction: row; /* Change to row layout for larger screens */
    height: 88vh; /* Set height for larger screens */
  }

  .explanation-item {
    width: 25%; /* Set width for row layout */
    border-right: 0.11vh solid #444; /* Change border to right for row layout */
    border-bottom: none; /* Remove bottom border for row layout */
  }

  .explanation-item:last-child {
    border-right: none; 
  }
}
  </style>
  