<template>
  <div class="content">
    <h2>What is AMM (Automated Market Maker)</h2>
    <p>
      An Automated Market Maker (AMM) is a decentralized trading protocol that allows users to trade cryptocurrencies without the need for intermediaries. 
      In an AMM system, liquidity is provided by users who deposit two types of tokens into a liquidity pool, which generates a price curve for other users to trade against.
      Popular AMM protocols include Uniswap, Balancer, and SushiSwap.
    </p>

    <h3>Benefits of AMM</h3>
    <ul>
      <li>Fully automated without intermediaries or order books</li>
      <li>Allows anyone to provide liquidity and participate in the market</li>
      <li>Lowers the barriers to entry for trading</li>
      <li>Increases market efficiency by constant liquidity provision</li>
    </ul>

    <h2>What is MEV (Maximal Extractable Value)</h2>
    <p>
      Maximal Extractable Value (MEV) refers to the ability of miners or validators to reorder, insert, or remove transactions in a block to maximize their profit.
      One of the most common forms of MEV attacks is the sandwich attack, where attackers manipulate the market price by executing transactions before and after the target trade.
    </p>

    <h3>Impact of MEV Attacks</h3>
    <p>
      MEV attacks can harm regular traders by artificially inflating transaction costs and causing price volatility. In response to these attacks, many decentralized exchanges are developing new mechanisms to mitigate the impact of MEV, such as batch trading and auction mechanisms.
    </p>

    <h3>Solutions to MEV</h3>
    <ul>
      <li>Batch trading to aggregate and execute multiple transactions at once</li>
      <li>Auction-based mechanisms to ensure fair order execution</li>
      <li>Researching zero-knowledge proofs to hide transaction details</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Introduction_1',
};
</script>

<style scoped>
.content {
  color: aliceblue;
  background-color: #0c0c0e;
  margin: 0 auto;
  max-width: 80vw; /* 控制内容宽度，避免过宽 */
  box-sizing: border-box; /* 确保 padding 不会影响总宽度 */
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
