<template>
  <div class="content">
    <h2>No Sandwich Swap Project Introduction</h2>
    <p>
      No Sandwich Swap is an anti-MEV decentralized exchange (DEX) that uses a "hyperbolic auction mechanism" to smooth out price impacts by splitting transactions into smaller parts and interleaving them over time. This mitigates the profit opportunities for MEV attackers by spreading their transactions across the entire period, reducing arbitrage gains.
    </p>

    <h3>Core Concepts</h3>
    <p>
      In a typical liquidity pool at the start of the settlement period, the pool satisfies the equation \( x_0 \times y_0 = k \). Over each settlement period, the pool receives base currency and quote currency in amounts of \( \{a_1, a_2, ..., a_A\}, \{b_1, b_2, ..., b_B\} \), respectively. These amounts are divided into \( N \) equal parts and interleaved to form a virtual transaction sequence.
    </p>

    <p>The virtual transaction sequence alternates the input of the base and quote currencies as follows:</p>
    <ul>
      <li>1. Deposit \( \alpha / N \) of token X</li>
      <li>2. Deposit \( \beta / N \) of token Y</li>
      <li>3. Repeat this process, alternating between tokens X and Y</li>
    </ul>

    <h3>Mathematical Derivation</h3>
    <p>
      After the \(i\)-th transaction, the state of the pool is updated as follows:
    </p>
    <p>
      For odd \(i\):
    </p>
    <p>\[
      x_i = x_{i-1} + \frac{\alpha}{N}, \quad y_i = \frac{k}{x_i}
    \]</p>
    <p>
      For even \(i\):
    </p>
    <p>\[
      x_i = \frac{k}{y_{i-1} + \frac{\beta}{N}}, \quad y_i = y_{i-1} + \frac{\beta}{N}
    \]</p>

    <p>
      As \(N\) approaches infinity, the pool's values converge, ensuring the price stability with minimal price impact. The final values of the pool are denoted as \(x' = \lim_{N\to\infty} x_{2N}\) and \(y' = \lim_{N\to\infty} y_{2N}\).
    </p>

    <h3>Tokenomics</h3>
    <p>
      The settlement-triggering trader will receive a governance token reward as compensation for the extra gas fees incurred during settlement. The governance token, assumed to be \$SANDWICH, is issued with an initial supply of 10,000 SANDWICH per settlement cycle, and it decays exponentially with a half-life of one month.
    </p>
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
  max-width: 80vw; /* 将最大宽度调整为90%视口宽度，避免内容过宽 */
  box-sizing: border-box; /* 确保 padding 不会影响总宽度 */
  overflow-y: auto;
  line-height: 1.6;
  height: 150vh;
}
.content::-webkit-scrollbar {
  display: none; /* 对 Chrome、Safari 和 Edge 浏览器隐藏滚动条 */
}
h2, h3 {
  margin-bottom: 1.2rem;
  font-weight: bold;
}
h2{
  color: #168ddb;
}
h3{
  color:rgb(13, 87, 224)
}
p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

ul {
  margin-bottom: 1.5rem;
}

li {
  margin-bottom: 0.8rem;
  line-height: 1.5;
}

ul li::marker {
  font-size: 1.2rem;
}
</style>
