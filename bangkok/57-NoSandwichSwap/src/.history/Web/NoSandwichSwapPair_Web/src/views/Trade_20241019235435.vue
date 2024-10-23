<template>
  <div class="container">
    <div class="chart-container">
      <div ref="chart" style="width: 100%; height: 100%;"></div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress-bar-red" :style="{ height: redHeight + '%' }"></div>
        <div class="progress-bar-blue"></div>
      </div>
    </div>
    <div class="trade-container">
      <h2>buy or sell</h2>
      <div class="trade-operations">
        <label for="quantity">Amount:</label>
        <input v-model="quantity" type="number" id="quantity" min="1" />
        <button @click="buy" class="buy-button">buy Token X</button>
        <button @click="sell" class="sell-button">Sell Token X</button>
        <button @click="togglePriceSource" class="test-button">
          {{ useRandomPrice ? 'Switch to Contract Price' : 'Switch to Random Price' }}
</button>

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
  .container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100vh;
    padding: 2rem;
    background-color: #0a0a0a;
  }

  .chart-container {
    flex: 2;
    margin-right: 2rem;
    background-color: #1e1e1e;
    margin-top: 15vh;
    border-radius: 8px;
    padding: 1rem;
    height: 70vh;
  }

  .trade-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #0a0a0a;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    color: #e0e0ff;
    padding: 1.5rem;
    height: 85vh;
  }

  h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: #b8a1ff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .trade-operations {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  label {
    display: block;
    margin-bottom: 1rem;
    color: #e0e0ff;
  }

  input[type="number"] {
    width: 100px;
    padding: 0.5rem;
    font-size: 16px;
    margin-bottom: 2rem;
    background-color: #302b63;
    color: #fff;
    border: none;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(50, 50, 100, 0.5);
  }

  button {
    width: 100%;
    max-width: 200px;
    padding: 1rem;
    font-size: 16px;
    cursor: pointer;
    margin-bottom: 1.5rem;
    border: none;
    border-radius: 4px;
    color: #fff;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  .buy-button {
    background-color: #6f42c1;
    box-shadow: 0 0 10px rgba(111, 66, 193, 0.7);
  }

  .sell-button {
    background-color: #ff7675;
    box-shadow: 0 0 10px rgba(255, 118, 117, 0.7);
  }

  .test-button{
    background-color: #20d891;
    box-shadow: 0 0 10px rgba(38, 156, 58, 0.7);
  }
  button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(111, 66, 193, 0.9);
  }

  .current-price {
    margin-top: 2rem;
    color: #00eaff;
  }

  .progress-bar-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 70vh;
    margin-top: 15vh;
    margin-right: 2rem;
  }

  .progress-bar {
    width: 100%;
    height: 100%;
    background-color: #1e1e1e;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(78, 109, 156, 0.7); /* 为整体进度条容器加上阴影 */
  }

  .progress-bar-red {
    background-color: #ff4b4b; /* 亮红色 */
    transition: height 0.5s ease;
    box-shadow: 0 0 15px rgba(128, 102, 102, 0.8), /* 荧光红色调 */
                0 0 30px rgba(124, 59, 59, 0.6),
                0 0 45px rgba(104, 12, 12, 0.4);
  }

  .progress-bar-blue {
    flex-grow: 1;
    background-color: #00aaff; /* 亮蓝色 */
    box-shadow: 0 0 15px rgba(94, 105, 110, 0.8), /* 荧光蓝色调 */
                0 0 30px rgba(56, 108, 134, 0.6),
                0 0 45px rgba(17, 119, 170, 0.4);
  }

</style>

<script>
import * as echarts from 'echarts';
import Web3 from 'web3';
import { mapState } from 'vuex';

export default {
  name: "TradingLineChart",
  data() {
    return {
      chart: null,
      timer: null,
      timeRange: 1, // 时间范围，单位为分钟
      updateInterval: 1000, // 更新间隔时间，单位为毫秒
      data: [], // 图表数据
      quantity: 1, // 默认交易数量
      price: null, // 当前价格，从合约获取
      contract: null, // 智能合约对象
      web3: null, // Web3对象
      contractAddress: '0xC32609C91d6B6b51D48f2611308FEf121B02041f', // 你的智能合约地址
      tokenx_address: '0x627b9A657eac8c3463AD17009a424dFE3FDbd0b1', // x的地址
      tokeny_address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // y的地址
      useRandomPrice: false, // 控制是否使用随机价格
      redHeight: 50,
      contractABI: [
    {
        "constant": true,
        "inputs": [],
        "name": "getPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            }
        ],
        "name": "addSwapTransaction",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
    "inputs": [],
    "name": "getBaseCurrencyContributorsLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getBaseCurrencyContributor",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getQuoteCurrencyContributorsLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getQuoteCurrencyContributor",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "contributor",
        "type": "address"
      }
    ],
    "name": "getBaseCurrencyContribution",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "contributor",
        "type": "address"
      }
    ],
    "name": "getQuoteCurrencyContribution",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

    };
  },
  computed: {
    // 使用 mapState 从 Vuex Store 中获取钱包地址和连接状态
    ...mapState({
      walletAddress: state => state.walletAddress,
      isConnected: state => state.isConnected,
    }),
  },
  methods: {
    generateTimeLabels() {
      const now = new Date();
      const timeLabels = [];
  
      for (let i = this.timeRange * 60; i >= 0; i--) {
        const pastTime = new Date(now.getTime() - i * 1000);
        const hours = pastTime.getHours().toString().padStart(2, '0');
        const minutes = pastTime.getMinutes().toString().padStart(2, '0');
        const seconds = pastTime.getSeconds().toString().padStart(2, '0');
        timeLabels.push(`${hours}:${minutes}:${seconds}`);
      }
  
      return timeLabels;
    },
    async initWeb3() {
      if (window.ethereum) {
        this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);

          console.log('合约已成功初始化');
        } catch (error) {
          console.error('用户拒绝访问钱包或合约初始化失败', error);
        }
      } else {
        alert('请安装MetaMask');
      }
    },
    initChart() {
      const chartDom = this.$refs.chart;
      this.chart = echarts.init(chartDom);

      this.data = new Array(this.timeRange * 60 + 1).fill(0);

      const option = {
        backgroundColor: '#000',
        title: {
          text: 'Trading line charts',
          textStyle: {
            color: '#00eaff',
            fontSize: 24,
            fontWeight: 'bold',
          },
          left: 'center',
          top: 10,
        },
        tooltip: {
          trigger: 'axis',
          textStyle: {
            color: '#fff',
          },
        },
        xAxis: {
          type: 'category',
          data: this.generateTimeLabels(),
          axisLine: {
            lineStyle: {
              color: '#00eaff', // x轴线颜色
            },
          },
          axisLabel: {
            color: '#00eaff', // x轴标签颜色
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#00eaff', // y轴线颜色
            },
          },
          splitLine: {
            lineStyle: {
              color: '#333', // 网格线颜色
            },
          },
          axisLabel: {
            color: '#00eaff', // y轴标签颜色
          },
        },
        series: [
          {
            name: '交易额',
            type: 'line',
            data: this.data,
            smooth: true,
            lineStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: '#ff7c7c' }, // 渐变色起始
                  { offset: 1, color: '#007fff' }, // 渐变色结束
                ],
              },
              width: 3,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 255, 255, 0.4)' },
                { offset: 1, color: 'rgba(0, 0, 0, 0)' },
              ]),
            },
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#00eaff',
              borderColor: '#fff',
              borderWidth: 2,
            },
          },
        ],
        animationEasing: 'cubicOut',
        animationDuration: 2000,
      };

      this.chart.setOption(option);
    },

    // 获取合约的当前价格
    async fetchPriceFromContract() {
  try {
    if (this.useRandomPrice) {
      // 使用随机价格
      const randomPrice = (Math.random() * (200 - 100) + 100).toFixed(2);
      this.price = randomPrice;
      console.log('随机生成的价格:', this.price);
    } else {
      // 获取合约中的价格
      const priceFromContract = await this.contract.methods.getPrice().call();
      this.price = this.web3.utils.fromWei(priceFromContract, 'ether'); // 假设价格是以wei为单位
      console.log('合约中的价格:', this.price);

      // 获取BaseCurrencyContributors的数量
        const baseContributorsLength = await this.contract.methods.getBaseCurrencyContributorsLength().call();
        console.log('BaseCurrencyContributors Length:', baseContributorsLength);

        // 获取每个BaseCurrencyContributor及其贡献
        for (let i = 0; i < baseContributorsLength; i++) {
            const baseContributor = await this.contract.methods.getBaseCurrencyContributor(i).call();
            const baseContribution = await this.contract.methods.getBaseCurrencyContribution(baseContributor).call();
            console.log(`Base Contributor: ${baseContributor}, Contribution: ${baseContribution}`);
        }

        // 获取QuoteCurrencyContributors的数量
        const quoteContributorsLength = await this.contract.methods.getQuoteCurrencyContributorsLength().call();
        console.log('QuoteCurrencyContributors Length:', quoteContributorsLength);

        // 获取每个QuoteCurrencyContributor及其贡献
        for (let i = 0; i < quoteContributorsLength; i++) {
            const quoteContributor = await this.contract.methods.getQuoteCurrencyContributor(i).call();
            const quoteContribution = await this.contract.methods.getQuoteCurrencyContribution(quoteContributor).call();
            console.log(`Quote Contributor: ${quoteContributor}, Contribution: ${quoteContribution}`);
        }

    }
  } catch (error) {
    this.price =0
    console.error('获取价格失败', error);
  }
},
togglePriceSource() {
    this.useRandomPrice = !this.useRandomPrice;
  },
    async swap(tokenAddress, amountIn) {
      try {
        await this.contract.methods.addSwapTransaction(tokenAddress, Number(amountIn) * (10 ** 18)).send({from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", gas: 30000000});
    console.log("交易成功");
  } catch (error) {
    console.error("交易失败:", error);
  }
},
async buy() {
  if (!this.isConnected) {
    alert('请先连接钱包');
    return;
  }

  try {
    const amountToBuy = this.quantity;
    this.redHeight = Math.min(this.redHeight - 10, 100);
    // 调用 swap 函数，传入 tokenX_address (使用 X 购买 Y)
    await this.swap(this.tokeny_address, amountToBuy);
  } catch (error) {
    console.error('买入失败', error);
  }
},
async sell() {
  if (!this.isConnected) {
    alert('请先连接钱包');
    return;
  }

  try {
    const amountToSell = this.quantity;
    this.redHeight = Math.max(this.redHeight + 10, 0);
    await this.swap(this.tokenx_address, amountToSell);

  } catch (error) {
    console.error('卖出失败', error);
  }
},
    updateChart() {
      this.fetchPriceFromContract().then(() => {
        this.data.push(parseFloat(this.price)); // 将新的价格加入数据数组
        if(Math.abs(this.data[this.data.length-2]-this.data[this.data.length-1])>0.001)
      {
        this.redHeight=50
      }
        this.data.shift(); // 移除最早的一个数据
        const newTimeLabels = this.generateTimeLabels();
        this.chart.setOption({
          xAxis: {
            data: newTimeLabels, // 更新时间轴
          },
          series: [
            {
              data: this.data, // 更新图表数据
            },
          ],
        });
      });
    },
  },

  mounted() {
    this.initWeb3();
    this.initChart();

    this.timer = setInterval(() => {
      this.updateChart(); // 每次获取新价格并更新图表
    }, this.updateInterval);
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
};
</script>
