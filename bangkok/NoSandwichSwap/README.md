# No Sandwich Swap

## Track and Bounty

### Chosen Track
Category 2: (Hot) Smart Contract, DeFi, AI, Layer2, DePIN, etc.

### Bounty Application
- Bifrost
- Moonbeam
- Blockchain for good

## Mandatory Before Offline Demo

1. **Demo Video**: [NoSandwichSwap Demo Video](https://youtu.be/C17XacIXz3g)
2. **PPT**: [NoSandwichSwap Demo](https://docs.google.com/presentation/d/18tYBaf0ovJM_Z3Yu_xxggGoln9vmmSii/edit?usp=sharing&ouid=118167211328459738785&rtpof=true&sd=true)

- Github Repo: [NoSandwichSwap Github](https://github.com/TreapGoGo/hackathon-2024-10-13)

## Introduction

**No Sandwich Swap** is an anti-MEV DEX that utilizes **Hyperbolic Call Auction (HCA)** to aggregate multiple trades over a period of time. By subdividing them infinitely and staggering them evenly, it helps to amortize the price shock effect of a single trade, while spreading out the trades of MEV attackers over the entire cycle. This effectively reduces arbitrage gains for MEV attackers.

### Key Benefits

1. **For the Market**: Reduces price shocks, allowing the actual transaction price to be closer to the fair price.
2. **For Attackers**: Effectively protects against MEV attacks, making sandwich attacks unprofitable.
3. **For Traders**: Enhances user experience by reducing slippage encountered by regular traders.
4. **For Liquidity Providers (LPs)**: Reduces price volatility and minimizes LPs' exposure to impermanent losses.
5. **For the Ecosystem**: Encourages more trades and increases market liquidity through governance token incentives.

---

## Functionalities and Schedule

This project was created on 2024/10/13, adjusted to the demand of Polkadot Hackathon on 2024/10/23.

### Current Status Before Hackathon

- Derived a brand-new Anti-MEV AMM theory through mathematical proof.

### Features Planned for Hackathon

- Implemented the refined mathematical theory with a closed form of parity price and designed tokenomics based on this theory.

## Architecture

### System Architecture Diagram

We have developed No Sandwich Swap, an MEV-resistant DEX that uses a **Hyperbolic Call Auction** (HCA) mechanism. This mechanism aggregates multiple transactions over a certain period and then infinitely subdivides and uniformly interleaves them, thereby smoothing out the price impact of individual transactions and dispersing the trades of MEV attackers throughout the entire cycle, significantly reducing their arbitrage profits. Based on this approach, we have proven that the upper bound of asset price volatility within each phase is  $O(\sqrt{n})$ , where n is the absolute value of the difference between the amounts of funds sold and bought over a certain period. Our protocol operates on an order placement and settlement model, collecting orders over a certain period before entering the settlement phase, which repeats cyclically.

![](/doc/figure.png)

### Mathematical Proof

Assume the initial liquidity pool satisfies $x_0 \times y_0 = k$. For each settlement period, the amount of base currency and quote currency received by the liquidity pool are denoted as $\{a_1, a_2, ..., a_A\}, \{b_1, b_2, ..., b_B\}$ respectively. Let $\displaystyle\alpha = \sum_{i=1}^A a_i, \beta = \sum_{i=1}^B b_i$.

Divide both $\alpha$ and $\beta$ into $N$ equal parts, and then alternate their input to form a virtual transaction sequence as follows:

> 1\. Deposit $\alpha/N$ units of token X;
> 
> 2\. Deposit $\alpha/N$ units of token Y;
> 
> 3\. Deposit $\alpha/N$ units of token X;
> 
> 4\. Deposit $\alpha/N$ units of token Y;
> 
> ......
> 
> 2n-1. Deposit $\alpha/N$ units of token X;
>
> 2n. Deposit $\alpha/N$ units of token Y.

After the $i^{th}$ transaction, the liquidity pool balances $x_i$ and $y_i$ are as follows:

- If $i$ is odd, $\displaystyle x_i = x_{i-1} + \frac{\alpha}{N}, y_i = \frac{k}{x_{i-1} + \frac{\alpha}{N}}$
- If $i$ is even, $\displaystyle x_i = \frac{k}{y_{i-1} + \frac{\beta}{N}}, y_i = y_{i-1} + \frac{\beta}{N}$

As $N$ increases, $\displaystyle\lim_{N \to \infty} x_{2N}$ must exist, and this is proven as follows:

1. When $i$ is even, we have $\displaystyle x_i = \frac{kNx_{i-2}+\alpha k}{kN+(x_{i-2}+\frac{\alpha}{N})\beta}$
2. As $N$ becomes sufficiently large, $\displaystyle\frac{\alpha\beta}{N} \to 0$, it is easy to see that $x_i$ is a monotonic sequence
3. The amount of funds injected into the liquidity pool is finite, so $x_i$ cannot increase indefinitely and is therefore a bounded sequence
4. According to the monotone convergence theorem, $\displaystyle\lim_{N \to \infty} x_{2N}$ must exist.

$$
x_{n+2} = 
\begin{cases}
    x_n + \frac{k\alpha - \beta x_n^2}{kn + \beta x_n}, & n = 2m, \\
    x_{n+1} + \frac{\alpha}{N}, & n = 2m+1
\end{cases}
$$

$$
\begin{align*}
    x_{n+2}^2 - x_n^2 &= (x_{n+2} + x_n)(x_{n+2} - x_n) \\
    &\sim 2x_n \cdot \frac{k\alpha - \beta x_n^2}{kN} \\
    &\sim 2\sqrt{k} \cdot \frac{k\alpha - \beta k}{kN} \\
    &= 2\sqrt{k}(\alpha - \beta)\frac{1}{N}
\end{align*}
$$

$$
\begin{align*}
    \sum_{i=0}^{m-1} (x_{2i+2}^2 - 2x_i^2) = 2\sqrt{k}(\alpha - \beta) \\
    \implies x_{2m} = \sqrt{k + 2\sqrt{k}(\alpha - \beta)}
\end{align*}
$$

Thus, as transactions are evenly divided infinitely, the liquidity pool will eventually converge to a fixed value. Numerical simulations show that when $N \ge 100$, the values essentially stabilize. We define $\displaystyle x' = \lim_{N \to \infty} x_{2N}, y' = \lim_{N \to \infty} y_{2N}$.

In each settlement period, a trader may send multiple actual transactions. For the initial transactions, only data is recorded without settlement; for the final transaction of the period, the settlement process is triggered, and the collected tokens are distributed to the traders based on their contributions.

- Traders who provide token X will receive $\displaystyle \frac{a_i}{\alpha} (y_0 + \beta - y')$ units of token Y.
- Traders who provide token Y will receive $\displaystyle \frac{b_i}{\beta} (x_0 + \alpha - x')$ units of token X.

This method of trading is similar to the call auction process on the A-share market, where trades are not settled in real-time within the settlement period but instead a price is determined at the end of the period and all transactions are settled at this uniform price. Since the final settlement is still based on the constant product AMM (Automated Market Maker), any trader who successfully submits a transaction on-chain will secure a trade. We refer to this trading method as **Hyperbolic Call Auction**.

![alt text](/doc/Comparison.png)

### Description of Components

![](/doc/figure.png)

### Tokenomics

Since the trader who triggers settlement will have to pay more gas to complete the settlement and distribution, it is necessary to provide compensation. We stipulate that the initiator of the last transaction in each settlement cycle (i.e., the settlement trigger) will receive a reward in governance tokens. Here, we assume the governance token is \$SANDWICH.

This incentive mechanism encourages more users to participate in trading, as the act of trading itself becomes a form of mining. The more transactions a user makes, the higher the chance they have to trigger settlement and receive token rewards.

The supply of \$SANDWICH follows an exponential decay model, with an initial supply of 10,000 SANDWICH per cycle and a half-life of 1 month.

One potential issue is that MEV attackers can still manipulate transaction ordering to become the settlement trigger and claim governance tokens. However, this kind of MEV attack does not directly harm regular traders like previous MEV strategies did. On the other hand, as MEV attackers accumulate more \$SANDWICH tokens, their interests become aligned with the NoSandwichSwap protocol, forcing them to act as guardians of the protocol's ecosystem.

## Schedule

### Key Milestones

- First submission
- Pre-demo
- Testnet launch
- Completed features
- Tests
- Documentation
- Production release

## Team Information

| Name     | Role          | GitHub / X Handle           |
|----------|---------------|-----------------------------|
| Treap| Product Manager  | https://github.com/TreapGoGo  |
| Artist Zhou | Financial Mathematical Modeler | https://github.com/artistzhou    |
| Jawk| Contract Developer      | https://github.com/jawkjiang   |
| Fox（Qian Zhang） | Full Stack Engineer     | https://github.com/HappyFox001    |
| SegmentOverflow| Architect      | https://github.com/whusjj   |
|OwesTre|UI Designer     |https://github.com/XiiiijWhy   |

### Background of Team Members

- Artist Zhou: President of ZJUBCA, INTJ
- Treap(leader): President of WHU Web3 Club
- Fox: Core builder of WHU Web3 Club
- Jawk: Core builder of WHU Web3 Club
- SegmentOverflow: Core builder of WHU Web3 Club
- OwesTre: Core builder of WHU Web3 Club

### Contact Information

- Artist Zhou: nevermorezxt@gmail.com
- Jawk: 2919036369@qq.com 
- Fox: 3591713733@qq.com
- SegmentOverflow: 2233586664@qq.com
- Treap(leader): 1981315951@qq.com
- OwesTre: JiayingChen_df016@outlook.com

## Quick Start

```bash
anvil --fork-url https://rpc.api.moonbase.moonbeam.network 
```

PS: Remember to create a `.env` file with `ANVIL_PRIVATE_KEY` inside.

```
source .env
forge script script/DeployNoSandwichSwapPair.s.sol:DeployNoSandwichSwapPair --rpc-url http://127.0.0.1:8545 --private-key $ANVIL_PRIVATE_KEY --broadcast
```

```bash
cd Web/NoSandwichSwapPair_Web
npm run dev
```

```bash
forge test --match-test "testTradeDex1|testTradeDex2" -vv
```