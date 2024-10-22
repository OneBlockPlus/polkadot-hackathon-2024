import Slider from '@react-native-community/slider';
import {ethers} from 'ethers';
import React, {Component, Fragment} from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import checkMark from '../../../assets/checkMark.png';
import {abiAAContract} from '../../../contracts/aaContract';
import {abiAAFactory} from '../../../contracts/aaFactory';
import {abiBatchTokenBalances} from '../../../contracts/batchTokenBalances';
import GlobalStyles, {mainColor} from '../../../styles/styles';
import {
  AccountAbstractionFactory,
  BatchTokenBalancesAddress,
  blockchain,
} from '../../../utils/constants';
import {
  arraySum,
  epsilonRound,
  formatDate,
  getAsyncStorageValue,
  getEncryptedStorageValue,
  setAsyncStorageValue,
} from '../../../utils/utils';
import CryptoSign from '../components/cryptoSign';

const periodsAvailable = [
  {
    label: 'Daily',
    value: 0,
    periodValue: 86400,
  },
  {
    label: 'Weekly',
    value: 1,
    periodValue: 604800,
  },
  {
    label: 'Monthly',
    value: 2,
    periodValue: 2629800,
  },
  {
    label: 'Yearly',
    value: 3,
    periodValue: 31557600,
  },
];

const protocolsAvailable = [
  {
    label: 'Balanced',
    value: 0,
  },
  {
    label: 'Percentage',
    value: 1,
  },
];

const baseTab2State = {
  refreshing: false,
  loading: true,
  savingsFlag: false,
  status: 'Processing...',
  stage: 0,
  savingsDate: 0,
  percentage: 0,
  publicKey: '0x0000000000000000000000000000000000000000',
  publicKeySavings: '0x0000000000000000000000000000000000000000',
  balancesSavings: blockchain.tokens.map(() => 0),
  usdConversion: blockchain.tokens.map(() => 1),
  activeTokens: blockchain.tokens.map(() => true), // to do later
  periodSelected: 0,
  protocolSelected: 0,
  modal: false,
  transaction: {},
  transactionDisplay: {
    name: 'GLMR',
    amount: 0,
    gas: 0,
  },
};

export default class Tab2 extends Component {
  constructor(props) {
    super(props);
    this.state = baseTab2State;
    this.provider = new ethers.providers.JsonRpcProvider(blockchain.rpc, {
      name: blockchain.name,
      chainId: blockchain.chainId,
    });
    this.factoryAddress = new ethers.Contract(
      AccountAbstractionFactory,
      abiAAFactory,
      this.provider,
    );
  }

  async checkAA(publicKey) {
    try {
      const contractPublicKeySavings = await this.factoryAddress.getAddress(
        publicKey,
        1,
      );
      const aaContract = new ethers.Contract(
        contractPublicKeySavings,
        abiAAContract,
        this.provider,
      );
      const owner = await aaContract.owner();
      if (owner === publicKey) {
        await setAsyncStorageValue({
          publicKeySavings: contractPublicKeySavings,
        });
        return contractPublicKeySavings;
      }
      return '0x0000000000000000000000000000000000000000';
    } catch (e) {
      console.log(e);
      return '0x0000000000000000000000000000000000000000';
    }
  }

  async onceRefresh() {
    const savingsDate = Date.now() + periodsAvailable[0].periodValue * 1000;
    await setAsyncStorageValue({savingsDate});
    await setAsyncStorageValue({periodSelected: 0});
    await setAsyncStorageValue({protocolSelected: 0});
    const publicKeySavings = await this.checkAA(this.state.publicKey);
    this.setState({
      ...baseTab2State,
      publicKeySavings,
    });
  }

  async getSavingsDate() {
    try {
      const savingsDate = await getAsyncStorageValue('savingsDate');
      if (savingsDate === null) throw 'Set First Date';
      return savingsDate;
    } catch (err) {
      await setAsyncStorageValue({savingsDate: 0});
      return 0;
    }
  }

  async getLastRefreshSavings() {
    try {
      const lastRefreshSavings = await getAsyncStorageValue(
        'lastRefreshSavings',
      );
      if (lastRefreshSavings === null) throw 'Set First Date';
      return lastRefreshSavings;
    } catch (err) {
      await setAsyncStorageValue({lastRefreshSavings: 0});
      return 0;
    }
  }

  async componentDidMount() {
    const publicKey = await getAsyncStorageValue('publicKey');
    let publicKeySavings = await getAsyncStorageValue('publicKeySavings');
    const contractPublicKeySavings =
      publicKeySavings ?? (await this.checkAA(publicKey));
    if (
      contractPublicKeySavings !== '0x0000000000000000000000000000000000000000'
    ) {
      publicKeySavings = contractPublicKeySavings;
    }
    const usdConversion = await getAsyncStorageValue('usdConversion');
    const savingsDate = await this.getSavingsDate();
    const periodSelected = await getAsyncStorageValue('periodSelected');
    const protocolSelected = await getAsyncStorageValue('protocolSelected');
    const percentage = await getAsyncStorageValue('percentage');
    const savingsFlag = await getAsyncStorageValue('savingsFlag');
    const balancesSavings = await getAsyncStorageValue('balancesSavings');
    await this.setStateAsync({
      balancesSavings: balancesSavings ?? baseTab2State.balancesSavings,
      savingsFlag: savingsFlag ?? baseTab2State.savingsFlag,
      savingsDate: savingsDate ?? baseTab2State.savingsDate,
      percentage: percentage ?? baseTab2State.percentage,
      periodSelected: periodSelected ?? baseTab2State.periodSelected,
      protocolSelected: protocolSelected ?? baseTab2State.protocolSelected,
      publicKey: publicKey ?? baseTab2State.publicKey,
      publicKeySavings: publicKeySavings ?? baseTab2State.publicKeySavings,
      usdConversion: usdConversion ?? baseTab2State.usdConversion,
      loading: false,
    });
    if (publicKeySavings !== '0x0000000000000000000000000000000000000000') {
      const refreshCheck = Date.now();
      const lastRefresh = await this.getLastRefreshSavings();
      if (refreshCheck - lastRefresh >= 1000 * 60 * 2.5) {
        // 2.5 minutes
        console.log('Refreshing...');
        await setAsyncStorageValue({lastRefreshSavings: Date.now()});
        this.refresh();
      } else {
        console.log(
          `Next refresh Available: ${Math.round(
            (1000 * 60 * 2.5 - (refreshCheck - lastRefresh)) / 1000,
          )} Seconds`,
        );
      }
    }
  }

  async createAccount() {
    this.setState({loading: true});
    try {
      const data = await this.factoryAddress.interface.encodeFunctionData(
        'createAccount',
        [this.state.publicKey, 1], // 1 = Savings
      );
      let transaction = {
        from: this.state.publicKey,
        to: AccountAbstractionFactory,
        data,
      };
      const balance = await this.provider.getBalance(this.state.publicKey);
      const gasPrice = await this.provider.getGasPrice();
      const gas = await this.provider.estimateGas(transaction);
      const check = balance.gte(gas.mul(gasPrice));
      if (!check) {
        throw 'Not enough balance';
      }
      let transactionDisplay = {};
      const displayGas = ethers.utils.formatEther(gas.mul(gasPrice));
      transactionDisplay = {
        name: 'GLMR',
        amount: 0,
        gas: epsilonRound(displayGas, 8),
      };
      this.setState({
        transactionDisplay,
        transaction,
        loading: false,
        modal: check,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async withdraw() {
    try {
      const aaContract = new ethers.Contract(
        this.state.publicKeySavings,
        abiAAContract,
        this.provider,
      );
      const balanceSavings = await aaContract.getDeposit();
      const transaction =
        await aaContract.populateTransaction.withdrawDepositTo(
          this.state.publicKey,
          balanceSavings,
          {
            from: this.state.publicKey,
          },
        );
      const balance = await this.provider.getBalance(this.state.publicKey);
      const gasPrice = await this.provider.getGasPrice();
      const gas = await this.provider.estimateGas(transaction);
      const check = balance.gte(gas.mul(gasPrice));
      if (!check) {
        throw 'Not enough balance';
      }
      let transactionDisplay = {};
      const displayGas = ethers.utils.formatEther(gas.mul(gasPrice));
      transactionDisplay = {
        name: 'GLMR',
        amount: 0,
        gas: epsilonRound(displayGas, 8),
      };
      this.setState({
        transactionDisplay,
        transaction,
        loading: false,
        modal: check,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async sign() {
    this.setState({
      status: 'Processing...',
      stage: 2,
      explorerURL: '',
    });
    try {
      const privateKey = await getEncryptedStorageValue('privateKey');
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const createReceipt = await wallet.sendTransaction(
        this.state.transaction,
      );
      await createReceipt.wait();
      await this.changePeriod();
      this.setState({
        explorerURL: `${blockchain.blockExplorer}tx/${createReceipt.hash}`,
        status: 'Confirmed',
        loading: false,
      });
    } catch (e) {
      console.log(e);
      this.setState(baseTab2State);
    }
  }

  async refresh() {
    await this.setStateAsync({refreshing: true});
    await this.getSavingsBalance();
    await this.setStateAsync({refreshing: false});
  }

  async getSavingsBalance() {
    const [, ...tokensArray] = blockchain.tokens.map(token => token.address);
    const aaContract = new ethers.Contract(
      this.state.publicKeySavings,
      abiAAContract,
      this.provider,
    );
    const tokenBalances = new ethers.Contract(
      BatchTokenBalancesAddress,
      abiBatchTokenBalances,
      this.provider,
    );
    const [balanceTemp, tempBalances, tempDecimals] = await Promise.all([
      aaContract.getDeposit(),
      tokenBalances.batchBalanceOf(this.state.publicKeySavings, tokensArray),
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
    const balancesSavings = [balance, ...balancesTokens];
    await setAsyncStorageValue({balancesSavings});
    await this.setState({balancesSavings});
  }

  async changePeriod() {
    const savingsDate =
      Date.now() +
      periodsAvailable[this.state.periodSelected].periodValue * 1000;
    await setAsyncStorageValue({savingsDate});
    await this.setStateAsync({savingsDate});
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
    const modalScale = 0.5;
    return (
      <Fragment>
        <Modal
          visible={this.state.modal}
          transparent={true}
          animationType="slide">
          <View
            style={{
              alignSelf: 'center',
              backgroundColor: '#1E2423',
              width: Dimensions.get('window').width * 0.94,
              height: Dimensions.get('window').height * modalScale,
              marginTop: Dimensions.get('window').height * (0.99 - modalScale),
              borderWidth: 2,
              borderColor: mainColor,
              padding: 20,
              borderRadius: 25,
              justifyContent: 'space-around',
              alignItems: 'center',
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              Transaction
            </Text>
            <View
              style={{
                backgroundColor: mainColor,
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 26,
                width: '100%',
              }}>
              eth_signTransaction
            </Text>
            <View
              style={{
                backgroundColor: mainColor,
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 20,
                width: '100%',
              }}>
              Amount:
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 24,
                width: '100%',
              }}>
              {`${epsilonRound(this.state.transactionDisplay.amount, 8)}`}{' '}
              {this.state.transactionDisplay.name}
              {' ( $'}
              {epsilonRound(
                this.state.transactionDisplay.amount *
                  this.state.usdConversion[0],
                2,
              )}
              {' )'}
            </Text>
            <View
              style={{
                backgroundColor: mainColor,
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 20,
                width: '100%',
              }}>
              Gas:
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 24,
                width: '100%',
              }}>
              {this.state.transactionDisplay.gas} {blockchain.token}
              {' ( $'}
              {epsilonRound(
                this.state.transactionDisplay.gas * this.state.usdConversion[0],
                2,
              )}
              {' )'}
            </Text>
            <View
              style={{
                backgroundColor: mainColor,
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
              }}>
              <Pressable
                style={[
                  GlobalStyles.singleModalButton,
                  {
                    width: '45%',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRightColor: 'black',
                    borderRightWidth: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
                onPress={async () => {
                  await this.setStateAsync({
                    modal: false,
                  });
                  this.setState({
                    stage: 1,
                  });
                }}>
                <Text style={[GlobalStyles.singleModalButtonText]}>Accept</Text>
              </Pressable>
              <Pressable
                style={[
                  GlobalStyles.singleModalButton,
                  {
                    width: '45%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  },
                ]}
                onPress={() => this.setState(baseTab2State)}>
                <Text style={[GlobalStyles.singleModalButtonText]}>Reject</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <View
          style={{
            width: Dimensions.get('window').width,
          }}>
          <View
            style={{
              justifyContent: 'space-evenly',
              alignItems: 'center',
              height: '100%',
            }}>
            <ScrollView
              style={GlobalStyles.tab2Container}
              contentContainerStyle={[
                GlobalStyles.tab2ScrollContainer,
                {
                  height:
                    this.state.publicKeySavings !==
                    '0x0000000000000000000000000000000000000000'
                      ? 'auto'
                      : '100%',
                },
              ]}>
              {this.state.publicKeySavings !==
              '0x0000000000000000000000000000000000000000' ? (
                <Fragment>
                  {
                    // Stage 0
                    this.state.stage === 0 && (
                      <Fragment>
                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderBottomWidth: 2,
                            paddingVertical: 20,
                            borderColor: mainColor,
                            width: '90%',
                          }}>
                          <Text style={[GlobalStyles.titleSaves]}>
                            Savings Account Balance{' '}
                          </Text>
                          <Text
                            style={{
                              fontSize: 38,
                              color: 'white',
                              marginTop: 10,
                            }}>
                            {`$ ${epsilonRound(
                              arraySum(
                                this.state.balancesSavings.map(
                                  (x, i) => x * this.state.usdConversion[i],
                                ),
                              ),
                              2,
                            )} USD`}
                          </Text>
                        </View>
                        <View
                          style={{
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            width: '90%',
                          }}>
                          <View
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignContent: 'center',
                              width: '100%',
                              borderBottomWidth: 2,
                              marginTop: 20,
                              paddingBottom: 20,
                              borderColor: mainColor,
                            }}>
                            <Text style={[GlobalStyles.titleSaves]}>
                              Activate Savings
                            </Text>
                            <Switch
                              style={{
                                transform: [{scaleX: 1.3}, {scaleY: 1.3}],
                              }}
                              trackColor={{
                                false: '#3e3e3e',
                                true: mainColor + '77',
                              }}
                              thumbColor={
                                this.state.savingsFlag ? mainColor : '#f4f3f4'
                              }
                              ios_backgroundColor="#3e3e3e"
                              onValueChange={async () => {
                                await setAsyncStorageValue({
                                  savingsFlag: !this.state.savingsFlag,
                                });
                                await this.setStateAsync({
                                  savingsFlag: !this.state.savingsFlag,
                                });
                              }}
                              value={this.state.savingsFlag}
                            />
                          </View>
                          {this.state.savingsFlag && (
                            <React.Fragment>
                              <View
                                style={{
                                  borderBottomWidth: 2,
                                  paddingBottom: 20,
                                  borderColor: mainColor,
                                }}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                  }}>
                                  <Text style={[GlobalStyles.titleSaves]}>
                                    Savings Period
                                  </Text>
                                  <RNPickerSelect
                                    style={{
                                      inputAndroidContainer: {
                                        textAlign: 'center',
                                      },
                                      inputAndroid: {
                                        textAlign: 'center',
                                        color: 'gray',
                                      },
                                      viewContainer: {
                                        ...GlobalStyles.input,
                                        width: '55%',
                                      },
                                    }}
                                    value={this.state.periodSelected}
                                    items={periodsAvailable}
                                    onValueChange={async value => {
                                      await setAsyncStorageValue({
                                        periodSelected: value,
                                      });
                                      await this.setStateAsync({
                                        periodSelected: value,
                                      });
                                    }}
                                  />
                                </View>
                                <Pressable
                                  disabled={this.state.loading}
                                  style={[
                                    GlobalStyles.buttonStyle,
                                    this.state.loading ? {opacity: 0.5} : {},
                                  ]}
                                  onPress={async () => {
                                    await this.setStateAsync({loading: true});
                                    await this.changePeriod();
                                    await this.setStateAsync({loading: false});
                                  }}>
                                  <Text
                                    style={{
                                      color: 'white',
                                      fontSize: 18,
                                      fontWeight: 'bold',
                                    }}>
                                    {this.state.loading
                                      ? 'Changing...'
                                      : 'Change Savings Period'}
                                  </Text>
                                </Pressable>
                              </View>
                              <View
                                style={
                                  ({
                                    width: '100%',
                                  },
                                  this.state.protocolSelected !== 1 && {
                                    borderBottomWidth: 2,
                                    borderColor: mainColor,
                                  })
                                }>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                  }}>
                                  <Text style={[GlobalStyles.titleSaves]}>
                                    Savings Protocol
                                  </Text>
                                  <RNPickerSelect
                                    style={{
                                      inputAndroidContainer: {
                                        textAlign: 'center',
                                      },
                                      inputAndroid: {
                                        textAlign: 'center',
                                        color: 'gray',
                                      },
                                      viewContainer: {
                                        ...GlobalStyles.input,
                                        width:
                                          Dimensions.get('screen').width * 0.5,
                                      },
                                    }}
                                    value={this.state.protocolSelected}
                                    items={protocolsAvailable}
                                    onValueChange={async protocolSelected => {
                                      await setAsyncStorageValue({
                                        protocolSelected,
                                      });
                                      await this.setStateAsync({
                                        protocolSelected,
                                      });
                                    }}
                                  />
                                </View>
                              </View>
                              {this.state.protocolSelected === 1 ? (
                                <View
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignContent: 'center',
                                    width: '100%',
                                    borderBottomWidth: 2,
                                    marginBottom: 20,
                                    paddingBottom: 20,
                                    borderColor: mainColor,
                                  }}>
                                  <Slider
                                    value={this.state.percentage}
                                    style={{
                                      width: '85%',
                                      height: 40,
                                    }}
                                    step={1}
                                    minimumValue={1}
                                    maximumValue={15}
                                    minimumTrackTintColor="#FFFFFF"
                                    maximumTrackTintColor={mainColor}
                                    onValueChange={async value => {
                                      await this.setStateAsync({
                                        percentage: value,
                                      });
                                      await setAsyncStorageValue({
                                        percentage: value,
                                      });
                                    }}
                                  />
                                  <Text
                                    style={{
                                      width: '20%',
                                      fontSize: 24,
                                      color: '#FFF',
                                      fontWeight: 'bold',
                                    }}>
                                    {this.state.percentage}%
                                  </Text>
                                </View>
                              ) : (
                                <View
                                  style={{
                                    width: '100%',
                                    marginBottom: 20,
                                  }}
                                />
                              )}
                              <View
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignContent: 'center',
                                  marginBottom: 20,
                                  width: '100%',
                                }}>
                                <Text style={[GlobalStyles.titleSaves]}>
                                  Next Withdraw Date
                                </Text>
                                <Pressable
                                  disabled={
                                    this.state.loading ||
                                    !(this.state.savingsDate < Date.now())
                                  }
                                  style={[
                                    GlobalStyles.buttonStyle,
                                    {width: '50%'},
                                    this.state.loading ||
                                    !(this.state.savingsDate < Date.now())
                                      ? {opacity: 0.5}
                                      : {},
                                  ]}
                                  onPress={async () => {
                                    await this.setStateAsync({loading: true});
                                    await this.withdraw();
                                    await this.setStateAsync({loading: false});
                                  }}>
                                  <Text
                                    style={{
                                      color: 'white',
                                      fontSize: 18,
                                      fontWeight: 'bold',
                                    }}>
                                    {!(this.state.savingsDate < Date.now())
                                      ? formatDate(
                                          new Date(this.state.savingsDate),
                                        )
                                      : this.state.loading
                                      ? 'Withdrawing...'
                                      : 'Withdraw Now'}
                                  </Text>
                                </Pressable>
                              </View>
                            </React.Fragment>
                          )}
                        </View>
                      </Fragment>
                    )
                  }
                  {
                    // Stage 1
                    this.state.stage === 1 && (
                      <View style={[GlobalStyles.mainSend, {height: '100%'}]}>
                        <CryptoSign
                          transaction={this.state.transaction}
                          cancelTrans={() =>
                            this.setState({
                              stage: 0,
                              explorerURL: '',
                              transaction: {},
                              check: 'Check',
                              loading: false,
                              modal: false,
                              status: 'Processing...',
                              errorText: '',
                            })
                          }
                          signEthereum={() => this.sign()}
                        />
                      </View>
                    )
                  }
                  {
                    // Stage 2
                    this.state.stage === 2 && (
                      <View
                        style={[
                          GlobalStyles.mainSend,
                          {height: Dimensions.get('screen').height * 0.64},
                        ]}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                          }}>
                          <Image
                            source={checkMark}
                            alt="check"
                            style={{width: 200, height: 200}}
                          />
                          <Text
                            style={{
                              textShadowRadius: 1,
                              fontSize: 28,
                              fontWeight: 'bold',
                              color:
                                this.state.status === 'Confirmed'
                                  ? mainColor
                                  : '#6978ff',
                            }}>
                            {this.state.status}
                          </Text>
                          <View>
                            <View
                              style={[
                                GlobalStyles.networkShow,
                                {width: Dimensions.get('screen').width * 0.9},
                              ]}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-around',
                                }}>
                                <View style={{marginHorizontal: 20}}>
                                  <Text style={{fontSize: 20, color: 'white'}}>
                                    Transaction
                                  </Text>
                                  <Text style={{fontSize: 14, color: 'white'}}>
                                    Savings Account Withdraw
                                  </Text>
                                </View>
                              </View>
                              <View
                                style={{
                                  marginHorizontal: 20,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <View style={{marginHorizontal: 10}}>
                                  {blockchain.tokens[0].icon}
                                </View>
                                <Text style={{color: 'white'}}>
                                  {`${epsilonRound(
                                    this.state.transactionDisplay.gas,
                                    4,
                                  )}`}{' '}
                                  {'GLMR'}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View>
                            <Pressable
                              disabled={this.state.explorerURL === ''}
                              style={[
                                GlobalStyles.buttonStyle,
                                this.state.explorerURL === ''
                                  ? {opacity: 0.5}
                                  : {},
                              ]}
                              onPress={() =>
                                Linking.openURL(this.state.explorerURL)
                              }>
                              <Text
                                style={{
                                  fontSize: 24,
                                  fontWeight: 'bold',
                                  color: 'white',
                                  textAlign: 'center',
                                }}>
                                View on Explorer
                              </Text>
                            </Pressable>
                            <Pressable
                              style={[
                                GlobalStyles.buttonStyle,
                                {
                                  backgroundColor: '#6978ff',
                                },
                                this.state.explorerURL === ''
                                  ? {opacity: 0.5}
                                  : {},
                              ]}
                              onPress={async () => {
                                await this.refresh();
                                await this.setStateAsync({
                                  stage: 0,
                                  explorerURL: '',
                                  transaction: {},
                                  transactionDisplay:
                                    baseTab2State.transactionDisplay,
                                  check: 'Check',
                                  loading: false,
                                  modal: false,
                                  status: 'Processing...',
                                  errorText: '',
                                });
                              }}
                              disabled={this.state.explorerURL === ''}>
                              <Text
                                style={{
                                  color: 'white',
                                  fontSize: 24,
                                  fontWeight: 'bold',
                                }}>
                                Done
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    )
                  }
                </Fragment>
              ) : (
                <>
                  {
                    // Stage 0
                    this.state.stage === 0 && (
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '90%',
                        }}>
                        <Text
                          style={[
                            GlobalStyles.exoTitle,
                            {
                              textAlign: 'center',
                              fontSize: 24,
                              paddingBottom: 20,
                            },
                          ]}>
                          Create Savings Account
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            width: '100%',
                          }}>
                          <Pressable
                            disabled={this.state.loading}
                            style={[
                              GlobalStyles.buttonStyle,
                              this.state.loading ? {opacity: 0.5} : {},
                            ]}
                            onPress={() => this.createAccount()}>
                            <Text style={[GlobalStyles.buttonText]}>
                              {this.state.loading
                                ? 'Creating...'
                                : 'Create Account'}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )
                  }
                  {
                    // Stage 1
                    this.state.stage === 1 && (
                      <View style={[GlobalStyles.mainSend, {height: '100%'}]}>
                        <CryptoSign
                          transaction={this.state.transaction}
                          cancelTrans={e =>
                            this.setState({
                              stage: 0,
                              explorerURL: '',
                              transaction: {},
                              check: 'Check',
                              loading: false,
                              modal: false,
                              status: 'Processing...',
                              errorText: '',
                            })
                          }
                          signEthereum={e => this.sign()}
                        />
                      </View>
                    )
                  }
                  {
                    // Stage 2
                    this.state.stage === 2 && (
                      <View style={[GlobalStyles.mainSend, {height: '90%'}]}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                          }}>
                          <Image
                            source={checkMark}
                            alt="check"
                            style={{width: 200, height: 200}}
                          />
                          <Text
                            style={{
                              textShadowRadius: 1,
                              fontSize: 28,
                              fontWeight: 'bold',
                              color:
                                this.state.status === 'Confirmed'
                                  ? mainColor
                                  : '#6978ff',
                            }}>
                            {this.state.status}
                          </Text>
                          <View>
                            <View
                              style={[
                                GlobalStyles.networkShow,
                                {width: Dimensions.get('screen').width * 0.9},
                              ]}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-around',
                                }}>
                                <View style={{marginHorizontal: 20}}>
                                  <Text style={{fontSize: 20, color: 'white'}}>
                                    Transaction
                                  </Text>
                                  <Text style={{fontSize: 14, color: 'white'}}>
                                    Savings Account Created
                                  </Text>
                                </View>
                              </View>
                              <View
                                style={{
                                  marginHorizontal: 20,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <View style={{marginHorizontal: 10}}>
                                  {blockchain.tokens[0].icon}
                                </View>
                                <Text style={{color: 'white'}}>
                                  {`${epsilonRound(
                                    this.state.transactionDisplay.gas,
                                    4,
                                  )}`}{' '}
                                  {'GLMR'}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View>
                            <Pressable
                              disabled={this.state.explorerURL === ''}
                              style={[
                                GlobalStyles.buttonStyle,
                                this.state.explorerURL === ''
                                  ? {opacity: 0.5}
                                  : {},
                              ]}
                              onPress={() =>
                                Linking.openURL(this.state.explorerURL)
                              }>
                              <Text
                                style={{
                                  fontSize: 24,
                                  fontWeight: 'bold',
                                  color: 'white',
                                  textAlign: 'center',
                                }}>
                                View on Explorer
                              </Text>
                            </Pressable>
                            <Pressable
                              style={[
                                GlobalStyles.buttonStyle,
                                {
                                  backgroundColor: '#6978ff',
                                },
                                this.state.explorerURL === ''
                                  ? {opacity: 0.5}
                                  : {},
                              ]}
                              onPress={async () => {
                                await this.onceRefresh();
                              }}
                              disabled={this.state.explorerURL === ''}>
                              <Text
                                style={{
                                  color: 'white',
                                  fontSize: 24,
                                  fontWeight: 'bold',
                                }}>
                                Done
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    )
                  }
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Fragment>
    );
  }
}
