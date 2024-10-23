import {POLYGON_DATA_FEED_CONTRACT, POLYGON_DATA_FEED_URL} from '@env';
import {Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {ethers} from 'ethers';
import React, {Component} from 'react';
import {Keyboard, Pressable, ScrollView, Text, View} from 'react-native';
import {GaugeChart} from '../../../components/gaugeChart';
import {abiDataFeeds} from '../../../contracts/dataFeeds';
import GlobalStyles from '../../../styles/styles';
import {availableLending, blockchain} from '../../../utils/constants';
import {
  arraySum,
  epsilonRound,
  getAsyncStorageValue,
  setAsyncStorageValue,
} from '../../../utils/utils';

function selectLevel(score) {
  if (score <= 579) {
    return 0;
  }
  if (score > 579 && score <= 669) {
    return 1;
  }
  if (score > 669 && score <= 739) {
    return 2;
  }
  if (score > 739 && score <= 799) {
    return 3;
  }
  if (score > 799) {
    return 4;
  }
}

export default class Tab4 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Addresses
      publicKey: new PublicKey('11111111111111111111111111111111'),
      score: 300,
      balancesLending: [0, 0, 0],
      usdConversionLending: [1, 1, 1],
    };
    this.provider = new Connection(blockchain.rpc, 'confirmed');
    this.controller = new AbortController();
    this.signal = this.controller.signal;
    this.fetcher = null;
  }
  async componentDidMount() {
    const [publicKey] = await Promise.all([getAsyncStorageValue('publicKey')]);
    await this.setStateAsync({
      publicKey: new PublicKey(publicKey ?? '11111111111111111111111111111111'),
    });
    await this.refresh();
  }

  async getScoreByAddress() {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const raw = JSON.stringify({
      publicKey: this.state.publicKey.toBase58(),
    });
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
      signal: this.signal,
    };

    fetch(
      'https://lf2w3laarl.execute-api.us-east-1.amazonaws.com/get-score',
      requestOptions,
    )
      .then(response => response.json())
      .then(result => {
        if (result.length > 0) {
          this.setState({score: result[0].score});
        }
      })
      .catch(error => console.error(error));
  }

  refresh = async () => {
    this.getUSD();
    this.getBalances();
    this.fetcher = setInterval(() => {
      this.getScoreByAddress();
    }, 10000);
    this.getScoreByAddress();
  };

  async getBalances() {
    let {balancesLending} = this.state;
    balancesLending[0] =
      (await this.provider.getBalance(this.state.publicKey)) /
      LAMPORTS_PER_SOL;
    await this.setStateAsync({balancesLending});
    await setAsyncStorageValue({balancesLending});
  }

  componentWillUnmount() {
    this.controller.abort();
    clearInterval(this.fetcher);
  }

  async createCard() {}

  async addBalance() {}

  async removeBalance() {}

  async getUSD() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        `${POLYGON_DATA_FEED_URL}`,
      );
      const dataFeeds = new ethers.Contract(
        POLYGON_DATA_FEED_CONTRACT,
        abiDataFeeds,
        provider,
      );
      const feedsUSD = await dataFeeds.getLatestPrices();
      const usdPrices = feedsUSD[0].map(
        (item, index) => parseFloat(item) * Math.pow(10, -feedsUSD[1][index]),
      );
      const res = {
        SOL: usdPrices[11],
        USDT: usdPrices[13],
        USDC: usdPrices[12],
      };
      this.setState({usdConversionLending: [res.SOL, res.USDC, res.USDT]}); // Peso to Dollar to be done
      await setAsyncStorageValue({
        usdConversionLending: this.state.usdConversionLending,
      });
    } catch (err) {
      console.log(err);
    }
  }

  // Utils
  async setStateAsync(value) {
    return new Promise(resolve => {
      this.setState(
        {
          ...value,
        },
        () => resolve(),
      );
    });
  }

  render() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{width: '100%', height: '100%'}}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0,
          paddingBottom:
            this.state.keyboardHeight > 0 ? this.state.keyboardHeight : 0,
        }}>
        <React.Fragment>
          <View style={{height: 180, marginVertical: 20}}>
            <Text style={[GlobalStyles.exoTitle]}>Credit Score</Text>
            <GaugeChart value={this.state.score} />
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              borderBottomWidth: 2,
              borderTopWidth: 2,
              paddingVertical: 15,
              marginBottom: 15,
              borderColor: '#0fb9f9',
              width: '90%',
            }}>
            <Text style={[GlobalStyles.exoTitle]}>Lending Received</Text>
            <Text style={{fontSize: 38, color: 'white', marginTop: 10}}>
              {`$ ${epsilonRound(
                arraySum(
                  this.state.balancesLending.map(
                    (x, i) => x * this.state.usdConversionLending[i],
                  ),
                ),
                2,
              )} USD`}
            </Text>
          </View>
          {availableLending[selectLevel(this.state.score)].map(
            (item, index) => (
              <View key={index} style={GlobalStyles.network}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                  }}>
                  <View style={{marginHorizontal: 20}}>
                    <View>{item.icon}</View>
                  </View>
                  <View style={{justifyContent: 'center'}}>
                    <Text style={{fontSize: 18, color: 'white'}}>
                      {item.company}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      }}>
                      <Text style={{fontSize: 18, color: 'white'}}>
                        {`$${item.amount}`}
                        {' USD'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{marginHorizontal: 20}}>
                  <Pressable
                    disabled={this.state.loading}
                    style={[
                      GlobalStyles.buttonStyle,
                      {width: '100%', padding: 10},
                      this.state.loading ? {opacity: 0.5} : {},
                    ]}
                    onPress={() => console.log('pressed')}>
                    <Text style={[GlobalStyles.buttonText, {fontSize: 18}]}>
                      Accept
                    </Text>
                  </Pressable>
                </View>
              </View>
            ),
          )}
        </React.Fragment>
      </ScrollView>
    );
  }
}
