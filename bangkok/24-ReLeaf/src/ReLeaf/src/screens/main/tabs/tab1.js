import {ethers} from 'ethers';
import React, {Component} from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import xcmIcon from '../../../assets/extraIcons/xcm.png';
import {abiBatchTokenBalances} from '../../../contracts/batchTokenBalances';
import GlobalStyles, {mainColor} from '../../../styles/styles';
import {BatchTokenBalancesAddress, blockchain} from '../../../utils/constants';
import ContextModule from '../../../utils/contextModule';
import {
  arraySum,
  epsilonRound,
  getAsyncStorageValue,
  setAsyncStorageValue,
} from '../../../utils/utils';

const baseTab1State = {
  refreshing: false,
  publicKey: '0x0000000000000000000000000000000000000000',
  balances: blockchain.tokens.map(() => 0),
  usdConversion: blockchain.tokens.map(() => 1),
  activeTokens: blockchain.tokens.map(() => true), // to do later
  nfcSupported: true,
};

class Tab1 extends Component {
  constructor(props) {
    super(props);
    this.state = baseTab1State;
    this.provider = new ethers.providers.JsonRpcProvider(blockchain.rpc);
    this.controller = new AbortController();
  }
  static contextType = ContextModule;

  async componentDidMount() {
    const publicKey = await getAsyncStorageValue('publicKey');
    const balances = await getAsyncStorageValue('balances');
    const usdConversion = await getAsyncStorageValue('usdConversion');
    const activeTokens = await getAsyncStorageValue('activeTokens');
    await this.setStateAsync({
      publicKey: publicKey ?? baseTab1State.publicKey,
      balances: balances ?? baseTab1State.balances,
      usdConversion: usdConversion ?? baseTab1State.usdConversion,
      activeTokens: activeTokens ?? baseTab1State.activeTokens,
    });
    const refreshCheck = Date.now();
    const lastRefresh = await this.getLastRefresh();
    if (refreshCheck - lastRefresh >= 1000 * 60 * 2.5) {
      // 2.5 minutes
      await setAsyncStorageValue({lastRefresh: Date.now().toString()});
      this.refresh();
    } else {
      console.log(
        `Next refresh Available: ${Math.round(
          (1000 * 60 * 2.5 - (refreshCheck - lastRefresh)) / 1000,
        )} Seconds`,
      );
    }
  }

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

  async refresh() {
    await this.setStateAsync({refreshing: true});
    await Promise.all([this.getUSD(), this.getBalances()]);
    await this.setStateAsync({refreshing: false});
  }

  // Get Balances

  async getBalances() {
    const {publicKey} = this.state;
    const [, ...tokensArray] = blockchain.tokens.map(token => token.address);
    const tokenBalances = new ethers.Contract(
      BatchTokenBalancesAddress,
      abiBatchTokenBalances,
      this.provider,
    );
    const [balanceTemp, tempBalances, tempDecimals] = await Promise.all([
      this.provider.getBalance(publicKey),
      tokenBalances.batchBalanceOf(publicKey, tokensArray),
      tokenBalances.batchDecimals(tokensArray),
    ]);
    const balance = parseFloat(ethers.utils.formatEther(balanceTemp));
    const balancesTokens = tempDecimals.map((x, i) =>
      parseFloat(
        ethers.utils
          .formatUnits(tempBalances[i].toString(), tempDecimals[i])
          .toString(),
      ),
    );
    const balances = [balance, ...balancesTokens];
    setAsyncStorageValue({balances});
    this.setState({balances});
  }

  // USD Conversions

  async getUSD() {
    const array = blockchain.tokens.map(token => token.coingecko);
    var myHeaders = new Headers();
    myHeaders.append('accept', 'application/json');
    var requestOptions = {
      signal: this.controller.signal,
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${array.toString()}&vs_currencies=usd`,
      requestOptions,
    );
    const result = await response.json();
    const usdConversion = array.map(x => result[x].usd);
    setAsyncStorageValue({usdConversion});
    this.setState({usdConversion});
  }

  async getLastRefresh() {
    try {
      const lastRefresh = await getAsyncStorageValue('lastRefresh');
      if (lastRefresh === null) throw 'Set First Date';
      return lastRefresh;
    } catch (err) {
      await setAsyncStorageValue({lastRefresh: '0'.toString()});
      return 0;
    }
  }

  render() {
    const iconSize = 38;
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
        }}>
        <View style={GlobalStyles.balanceContainer}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 30,
                fontFamily: 'Exo2-Regular',
                color: 'white',
              }}>
              Balance
            </Text>
            <Text
              style={{
                fontSize: 38,
                color: 'white',
                fontFamily: 'Exo2-Regular',
              }}>
              {`$ ${epsilonRound(
                arraySum(
                  this.state.balances.map(
                    (x, i) => x * this.state.usdConversion[i],
                  ),
                ),
                2,
              )} USD`}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: '100%',
            }}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Pressable
                onPress={() => this.props.navigation.navigate('SendWallet')}
                style={GlobalStyles.singleButton}>
                <IconIonicons
                  name="arrow-up-outline"
                  size={iconSize}
                  color={'white'}
                />
              </Pressable>
              <Text style={GlobalStyles.singleButtonText}>Send</Text>
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Pressable
                onPress={() => this.props.navigation.navigate('DepositWallet')}
                style={GlobalStyles.singleButton}>
                <IconIonicons
                  name="arrow-down-outline"
                  size={iconSize}
                  color={'white'}
                />
              </Pressable>
              <Text style={GlobalStyles.singleButtonText}>Receive</Text>
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Pressable
                onPress={() => this.props.navigation.navigate('SwapWallet')}
                style={GlobalStyles.singleButton}>
                <IconIonicons
                  name="swap-vertical"
                  size={iconSize}
                  color={'white'}
                />
              </Pressable>
              <Text style={GlobalStyles.singleButtonText}>Swap</Text>
            </View>
            {
              /*
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Pressable
                onPress={() => this.props.navigation.navigate('XCM')}
                style={GlobalStyles.singleButton}>
                <Image
                  source={xcmIcon}
                  style={{width: iconSize, height: iconSize}}
                />
              </Pressable>
              <Text style={GlobalStyles.singleButtonText}>XCM</Text>
            </View>
              */
            }
            {this.state.nfcSupported && (
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Pressable
                  onPress={() =>
                    this.props.navigation.navigate('PaymentWallet')
                  }
                  style={GlobalStyles.singleButton}>
                  <IconIonicons name="card" size={iconSize} color={'white'} />
                </Pressable>
                <Text style={GlobalStyles.singleButtonText}>{'Payment'}</Text>
              </View>
            )}
          </View>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              progressBackgroundColor={mainColor}
              refreshing={this.state.refreshing}
              onRefresh={async () => {
                await setAsyncStorageValue({
                  lastRefresh: Date.now().toString(),
                });
                await this.refresh();
              }}
            />
          }
          showsVerticalScrollIndicator={false}
          style={GlobalStyles.tokensContainer}
          contentContainerStyle={{
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          {blockchain.tokens.map((token, index) =>
            this.state.activeTokens[index] ? (
              <View key={index} style={GlobalStyles.network}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                  }}>
                  <View style={{marginHorizontal: 20}}>
                    <View>{token.icon}</View>
                  </View>
                  <View style={{justifyContent: 'center'}}>
                    <Text style={{fontSize: 18, color: 'white'}}>
                      {token.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      }}>
                      <Text style={{fontSize: 12, color: 'white'}}>
                        {this.state.balances[index] === 0
                          ? '0'
                          : this.state.balances[index] < 0.001
                          ? '<0.01'
                          : epsilonRound(this.state.balances[index], 2)}{' '}
                        {token.symbol}
                      </Text>
                      <Text style={{fontSize: 12, color: 'white'}}>
                        {`  -  ($${epsilonRound(
                          this.state.usdConversion[index],
                          4,
                        )} USD)`}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{marginHorizontal: 20}}>
                  <Text style={{color: 'white'}}>
                    $
                    {epsilonRound(
                      this.state.balances[index] *
                        this.state.usdConversion[index],
                      2,
                    )}{' '}
                    USD
                  </Text>
                </View>
              </View>
            ) : (
              <React.Fragment key={index} />
            ),
          )}
        </ScrollView>
      </View>
    );
  }
}

export default Tab1;
