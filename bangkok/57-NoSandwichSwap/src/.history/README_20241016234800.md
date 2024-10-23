<center><H1>No Sandwich Swap</H1></center>

<center>by WHU Web3 Club & ZJUBCA</center>

## 概述

这是一个抗 MEV 的 DEX ，使用**双曲集合竞价**的方式，将一段时间内的若干笔交易加总后无限细分并均匀交错排列，从而摊平了单笔交易的价格冲击效应，将 MEV 攻击者的交易分散至整个周期中使得套利收益大幅降低。

该 DEX 的意义在于：

1. 减少价格冲击，让实际成交价更加贴近公允价格
2. 有效防范 MEV 攻击，使得三明治攻击变得无利可图
3. 有效降低普通交易者遭遇的滑点，提高用户体验
4. 抑制价格的波动性，减少 LP 遭遇的无常损失
5. 通过治理代币激励机制，鼓励用户多多交易，提高市场流动性

## 原理

设期初流动性池满足 $x_0 \times y_0=k$ 。对于每一个结算周期，流动性池收到的基准货币和计价货币数量分别为  $\{a_1, a_2, ..., a_A\}, \{b_1, b_2, ..., b_B\}$ ，设 $\displaystyle\alpha = \sum_{i=1}^A a_i, \beta = \sum_{i=1}^B b_i$ 。

将 $\alpha$ 和 $\beta$ 皆均分成 $N$ 个等份，然后将其交错均匀排列，形成一个虚拟的交易序列，形如：


> 1\. 投入 $\alpha/N$ 个代币 X ；
> 
> 2\. 投入 $\alpha/N$ 个代币 Y ； 
> 
> 3\. 投入 $\alpha/N$ 个代币 X ；
> 
> 4\. 投入 $\alpha/N$ 个代币 Y ； 
> 
> ......
> 
> 2n-1. 投入 $\alpha/N$ 个代币 X ；
>
> 2n. 投入 $\alpha/N$ 个代币 Y ； 

在第 $i$ 笔交易后，流动性池中的 $x_i,y_i$ 为

- 若 $i$ 为奇数， $\displaystyle x_i = x_{i-1} + \frac{\alpha}{N}, y = \frac{k}{x_{i-1} + \frac{\alpha}{N}}$ 
- 若 $i$ 为偶数， $\displaystyle x_i = \frac{k}{y_{i-1} + \frac{\beta}{N}}, y_i = y_{i-1} + \frac{\beta}{N}$ 

随着 $N$ 的增加， $\displaystyle\lim_{N\to\infty} x_{2N}$ 必然存在，证明如下：

1. 当 $i$ 为偶数时，易得 $\displaystyle x_i = \frac{kNx_{i_2}+\alpha k}{kN+(x_{i-2}+\frac{\alpha}{N})\beta}$ 
2. 当 $N$ 足够大时， $\displaystyle\frac{\alpha\beta}{N} \to 0$ ，容易发现 $x_i$ 是一个单调数列
3. 投入流动性池的资金数量是有限的， $x_i$ 显然不可能无限增大，而是一个有界数列
4. 根据单调有界原理，  $\displaystyle\lim_{N\to\infty} x_{2N}$ 必然存在

$$
x_{n+2} = 
\begin{cases}
    x_n + \frac{k\alpha - \beta x_n^2}{kn + \beta x_n}, n = 2m, \\
    x_{n+1} + \frac{\alpha}{N}, n = 2m+1
\end{cases}
$$

$$
\begin{align*}
    x_{n+2}^2 - x_n^2 &= (x_{n+2}+x_n)(x_{n+2}-x_n) \\
    &\sim 2x_n \cdot \frac{k\alpha-\beta x_n^2}{kN} \\
    &\sim 2\sqrt{k} \cdot \frac{k\alpha-\beta k}{kN} \\
    &= 2\sqrt{k}(\alpha-\beta)\frac{1}{N}
\end{align*}
$$

$$
\begin{align*}
    \sum_{i=0}^{m-1} (x_{2i+2}^2 - 2x_i^2) = 2\sqrt{k}(\alpha-\beta) \\
    \implies x_{2m} = \sqrt{k+2\sqrt{k}(\alpha-\beta)}
\end{align*}
$$

因此，随着交易的无限均分，流动性池最终将趋于一个固定值。在数值模拟中， $N\ge100$ 时基本可以认为数值不再变化。定义 $\displaystyle x'=\lim_{N\to\infty} x_{2N}, y'=\lim_{N\to\infty} y_{2N}$ 。

每个结算周期中，交易者可能发送多笔实际交易。对于前若干笔交易，只做数据记录而不结算；对于周期的最后一笔交易，触发结算流程，将收集的代币按贡献分配给交易者。

- 提供 X 代币的交易者获得数量为 $\displaystyle \frac{a_i}{\alpha} (y_0+\beta-y')$ 的 Y 代币
- 提供 Y 代币的交易者获得数量为 $\displaystyle \frac{b_i}{\beta}(x_0+\alpha-x')$ 的 X 代币

这种交易方式类似于 A 股市场盘前的集合竞价过程，即在结算周期内不进行实时结算，只在周期结束后形成价格并统一按相同的价格结算。由于最终成交依然基于恒定积自动做市商，所以任何成功将交易上链的交易者都可以获得成交。我们将这种交易方式称为**双曲集合竞价**。

## 代币经济学

由于触发结算的交易者将不得不付出更多的 gas 来完成结算和分配，因此有必要给予一定的补偿。我们规定，每个结算周期的最后一笔交易的发起人（即触发结算者）将获得一笔治理代币补偿。此处我们假设治理代币为 \$SANDWICH 。

这种激励机制的存在将会鼓励更多用户参与交易，因为交易本身就是一种挖矿，交易次数越多就越有机会成为结算触发者从而获得代币奖励。

\$SANDWICH 的供应量呈指数衰减，其初始供应为 10000 SANDWICH/周期 ，半衰期为 1 个月。

一个可能的问题是， MEV 攻击者依然可以通过交易排序来让自己成为结算触发者从而获得治理代币。然而，这种 MEV 攻击并没有像以前的那种攻击一样，直接损害到普通交易者的权益。另一方面，随着 MEV 攻击者持有的 SANDWICH 代币越来越多，他们的利益也与 NoSandwichSwap 建立绑定，从而倒逼他们成为协议生态的维护者。

## Quick Start

```bash
anvil --block-time 5
```

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