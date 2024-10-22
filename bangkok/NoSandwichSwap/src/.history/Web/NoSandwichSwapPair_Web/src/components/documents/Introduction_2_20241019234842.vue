<template>
  <div class="content">
    <h1>No Sandwich Swap</h1>
    <left>by WHU Web3 Club & ZJUBCA</left>

    <h2>No Sandwich Swap Project Introduction</h2>
    <p>
      No Sandwich Swap is an anti-MEV decentralized exchange (DEX) that employs a **hyperbolic auction mechanism** to reduce the price impact of individual trades. By breaking transactions into smaller fragments and interleaving them over time, this process distributes the effects of trades evenly. As a result, the arbitrage opportunities for MEV (Maximal Extractable Value) attackers are significantly reduced, while regular traders enjoy more stable prices with less slippage.
    </p>

    <h3>Core Concepts</h3>
    <p>
      The DEX operates with a constant product market maker model, where the initial state of the liquidity pool satisfies the equation:
    </p>
    <p>
      \[
      x_0 \times y_0 = k
      \]
    </p>
    <p>
      Here, \( x_0 \) and \( y_0 \) represent the initial amounts of the two tokens in the pool, and \( k \) is a constant. During each settlement period, the pool receives deposits of the base currency and the quote currency in amounts \( \{a_1, a_2, ..., a_A\} \) and \( \{b_1, b_2, ..., b_B\} \), respectively. The sum of these amounts, denoted by \( \alpha \) and \( \beta \), is:
    </p>
    <p>
      \[
      \alpha = \sum_{i=1}^{A} a_i, \quad \beta = \sum_{i=1}^{B} b_i
      \]
    </p>
    <p>
      These values are divided into \( N \) equal parts and alternated to create a virtual transaction sequence, interleaving the inputs of both tokens. This results in the following transaction sequence:
    </p>
    <ul>
      <li>1. Deposit \( \frac{\alpha}{N} \) of token X</li>
      <li>2. Deposit \( \frac{\beta}{N} \) of token Y</li>
      <li>3. Repeat this process, alternating between tokens X and Y</li>
    </ul>

    <h3>Mathematical Derivation</h3>
    <p>After the \( i \)-th transaction, the state of the pool is updated according to whether \( i \) is odd or even:</p>
    <p>For odd \( i \):</p>
    <p>
      \[
      x_i = x_{i-1} + \frac{\alpha}{N}, \quad y_i = \frac{k}{x_i}
      \]
    </p>
    <p>For even \( i \):</p>
    <p>
      \[
      x_i = \frac{k}{y_{i-1} + \frac{\beta}{N}}, \quad y_i = y_{i-1} + \frac{\beta}{N}
      \]
    </p>
    <p>
      As \( N \) increases, the pool values \( x_i \) and \( y_i \) converge, ensuring price stability with minimal price impact. The final state of the pool, as \( N \to \infty \), is given by:
    </p>
    <p>
      \[
      x' = \lim_{N\to\infty} x_{2N}, \quad y' = \lim_{N\to\infty} y_{2N}
      \]
    </p>

    <h3>Tokenomics</h3>
    <p>
      The trader who triggers the settlement of the liquidity pool incurs extra gas costs due to the settlement process. As compensation, they receive a governance token reward. We assume the governance token is called \$SANDWICH. Initially, 10,000 SANDWICH tokens are issued per settlement cycle, and the token supply decays exponentially, with a half-life of one month.
    </p>
    <p>
      This incentivizes more traders to participate, as frequent trading increases the likelihood of becoming the settlement-triggering trader and earning token rewards.
    </p>

    <h3>Significance of No Sandwich Swap</h3>
    <p>The No Sandwich Swap DEX offers several key advantages:</p>
    <ul>
      <li>1. Reduces price impact, allowing trades to occur closer to fair market prices.</li>
      <li>2. Effectively defends against MEV attacks, making sandwich attacks unprofitable.</li>
      <li>3. Reduces slippage for regular traders, improving overall user experience.</li>
      <li>4. Suppresses price volatility, reducing impermanent loss for liquidity providers (LPs).</li>
      <li>5. Encourages liquidity provision and trading through governance token incentives, boosting market liquidity.</li>
    </ul>

    <h3>Quick Start</h3>
    <p>To deploy the No Sandwich Swap DEX locally, follow these steps:</p>

    <pre><code>
anvil --block-time 5
</code></pre>
    <p>Then, deploy the smart contracts using the following commands:</p>
    <pre><code>
source .env
forge script script/DeployNoSandwichSwapPair.s.sol:DeployNoSandwichSwapPair --rpc-url http://127.0.0.1:8545 --private-key $ANVIL_PRIVATE_KEY --broadcast
</code></pre>

    <p>To run the frontend development environment:</p>
    <pre><code>
cd Web/NoSandwichSwapPair_Web
npm run dev
</code></pre>

    <p>To run the tests:</p>
    <pre><code>
forge test --match-test "testTradeDex1|testTradeDex2" -vv
</code></pre>
  </div>
</template>

<script>
export default {
  name: 'Introduction_2',
  mounted() {
    this.renderMath();
  },
  methods: {
    renderMath() {
      if (window.MathJax) {
        window.MathJax.typesetPromise();
      }
    }
  }
};
</script>

<style scoped>
.content {
  color: aliceblue;
  background-color: #0c0c0e;
  margin: 0 auto;
  max-width: 80vw; 
  box-sizing: border-box; 
  overflow-y: auto;
  line-height: 1.6;
  height: 150vh;
}
.content::-webkit-scrollbar {
  display: none; 
}
h1, h2, h3 {
  text-align: left;
  margin-bottom: 1.2rem;
  font-weight: bold;
}
h1 {
  color: #168ddb;
}
h2, h3 {
  color:rgb(13, 87, 224);
}
p, ul, li {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  line-height: 1.5;
}
ul li::marker {
  font-size: 1.2rem;
}
pre {
  background-color: #1e1e1e;
  padding: 1rem;
  border-radius: 5px;
  color: #d4d4d4;
}
</style>
