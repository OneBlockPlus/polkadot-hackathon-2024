import {ethers} from 'ethers';
import React, {Component, Fragment} from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import IconIonIcons from 'react-native-vector-icons/Ionicons';
import checkMark from '../../assets/checkMark.png';
import Renders from '../../assets/logo.png';
import Title from '../../assets/title.png';
import {abiAAContract} from '../../contracts/aaContract';
import {abiBatch} from '../../contracts/batch';
import {abiERC20} from '../../contracts/erc20';
import GlobalStyles, {header, mainColor} from '../../styles/styles';
import {BatchTransactionsAddress, blockchain} from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import {
  balancedSaving,
  epsilonRound,
  getAsyncStorageValue,
  getEncryptedStorageValue,
  percentageSaving,
} from '../../utils/utils';
import Cam from './components/cam';
import CryptoSign from './components/cryptoSign';
import KeyboardAwareScrollViewComponent from './components/keyboardAvoid';

function setTokens(array) {
  return array.map((item, index) => {
    return {
      ...item,
      value: index,
      label: item.name,
      key: item.symbol,
    };
  });
}

function findIndexByProperty(array, property, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][property] === value) {
      return i;
    }
  }
  return -1; // Return -1 if the object with the specified property and value is not found
}

const SendWalletBaseState = {
  // Base
  publicKey: '0x0000000000000000000000000000000000000000',
  tokenSelected: [setTokens(blockchain.tokens)[0]], //
  usdConversion: blockchain.tokens.map(() => 1),
  // Transaction settings
  toAddress: [''], // ""
  amount: [''], // ""
  transaction: [{}],
  transactionBatch: {},
  scannerSelector: 0,
  transactionDisplay: {
    name: setTokens(blockchain.tokens)[0].symbol,
    decimals: setTokens(blockchain.tokens)[0].decimals,
    amount: 0,
    gas: 0,
  },
  // Status
  stage: 0,
  hash: '', // ""
  check: 'Check',
  modal: false, // false
  explorerURL: '',
  status: 'Processing...',
  errorText: '',
  maxSelected: false,
  maxLoading: false,
  loading: true,
  // Savings Flag
  savingsFlag: false,
  protocolSelected: 0,
  percentage: 0,
};

class SendWallet extends Component {
  constructor(props) {
    super(props);
    this.state = SendWalletBaseState;
    this.provider = new ethers.providers.JsonRpcProvider(blockchain.rpc);
    this.batchContract = new ethers.Contract(
      BatchTransactionsAddress,
      abiBatch,
      this.provider,
    );
  }

  static contextType = ContextModule;

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      const publicKey = await getAsyncStorageValue('publicKey');
      const usdConversion = await getAsyncStorageValue('usdConversion');
      const savingsFlag = await getAsyncStorageValue('savingsFlag');
      const protocolSelected = await getAsyncStorageValue('protocolSelected');
      const percentage = await getAsyncStorageValue('percentage');
      this.setState({
        publicKey: publicKey ?? SendWalletBaseState.publicKey,
        usdConversion: usdConversion ?? SendWalletBaseState.usdConversion,
        protocolSelected:
          protocolSelected ?? SendWalletBaseState.protocolSelected,
        savingsFlag: savingsFlag ?? SendWalletBaseState.savingsFlag,
        percentage: percentage ?? SendWalletBaseState.percentage,
        loading: false,
      });
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(SendWalletBaseState);
    });
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
        this.state.transactionBatch,
      );
      await createReceipt.wait();
      this.setState({
        explorerURL: `${blockchain.blockExplorer}tx/${createReceipt.hash}`,
        status: 'Confirmed',
      });
    } catch (e) {
      console.log(e);
      ToastAndroid.show(e.message, ToastAndroid.SHORT);
      this.setState({
        stage: 0,
        explorerURL: '',
        transactionBatch: {},
        check: 'Check',
        loading: false,
        modal: false,
        status: 'Processing...',
        errorText: '',
      });
    }
  }

  async getTransaction(address, amountIn, tokenAddress) {
    let transaction = {};
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      transaction = {
        to: address,
        value: ethers.utils.parseEther(amountIn),
        data: '0x',
      };
      return transaction;
    } else {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        abiERC20,
        this.provider,
      );
      const tokenDecimals = await tokenContract.decimals();
      const amount = ethers.utils.parseUnits(amountIn, tokenDecimals);
      const data = tokenContract.interface.encodeFunctionData('transfer', [
        address,
        amount,
      ]);
      transaction = {
        to: tokenAddress,
        value: ethers.utils.parseEther('0'),
        data,
      };
    }
    return transaction;
  }

  async getTransactionSavings(address, amountIn) {
    const aaContract = new ethers.Contract(
      address,
      abiAAContract,
      this.provider,
    );
    const transaction = await aaContract.populateTransaction.addDeposit({
      from: this.state.publicKey,
      value: ethers.utils.parseEther(amountIn),
    });
    return transaction;
  }

  async batchTransfer() {
    try {
      let transactions = await Promise.all(
        this.state.toAddress.map((address, index) =>
          this.getTransaction(
            address,
            this.state.amount[index],
            this.state.tokenSelected[index].address,
          ),
        ),
      );
      const usdValues = this.state.toAddress.map((_, index) => {
        try {
          return this.state.usdConversion[
            findIndexByProperty(
              blockchain.tokens,
              'address',
              this.state.tokenSelected[index].address,
            )
          ];
        } catch {
          return 0;
        }
      });
      if (this.state.savingsFlag) {
        const totalInUsd = this.state.toAddress.map(
          (_, index) => this.state.amount[index] * usdValues[index],
        );
        const totalOnETH =
          totalInUsd.reduce((a, b) => a + b, 0) / this.state.usdConversion[0];
        const savedAmount =
          this.state.protocolSelected === 0
            ? balancedSaving(totalOnETH, this.state.usdConversion[0])
            : percentageSaving(totalOnETH, this.state.percentage);
        const publicKeySavings = await getAsyncStorageValue('publicKeySavings');
        const transactionSavings = await this.getTransactionSavings(
          publicKeySavings,
          savedAmount.toString(),
        );
        transactions.push(transactionSavings);
      }
      let totalAmount = ethers.utils.parseEther('0');
      transactions.forEach(item => {
        totalAmount = totalAmount.add(item.value);
      });
      console.log(totalAmount);
      const transactionBatch =
        await this.batchContract.populateTransaction.batchAll(
          [...transactions.map(item => item.to)],
          [...transactions.map(item => item.value)],
          [...transactions.map(item => item.data)],
          [],
          {
            from: this.state.publicKey,
          },
        );
      const balance = await this.provider.getBalance(this.state.publicKey);
      const gasPrice = await this.provider.getGasPrice();
      const gas = await this.provider.estimateGas(transactionBatch);
      const check = balance.gte(gas.mul(gasPrice).add(totalAmount));
      let errorText = '';
      if (!check) {
        errorText = `Not enough balance, you need ${ethers.utils.formatEther(
          gas.mul(gasPrice).sub(balance).abs(),
        )} GLMR to complete transaction`;
        console.log(errorText);
        throw 'Not enough balance';
      }
      const displayGas = ethers.utils.formatEther(gas.mul(gasPrice));
      const transactionDisplay = {
        name: 'GLMR',
        amount: epsilonRound(ethers.utils.formatEther(totalAmount), 8),
        gas: epsilonRound(displayGas, 8),
      };
      this.setState({
        transactionDisplay,
        transactionBatch,
        check: 'Check',
        loading: false,
        modal: check,
        errorText,
      });
    } catch (e) {
      console.log(e);
      console.log('Bad Quote');
    }
  }

  render() {
    const modalScale = 0.5;
    return (
      <SafeAreaView style={GlobalStyles.container}>
        <View
          style={[
            GlobalStyles.headerMain,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent: 'center',
            },
          ]}>
          <View style={GlobalStyles.headerItem}>
            <Image
              source={Renders}
              alt="Logo"
              style={{
                width: 192 / 3,
                height: 192 / 3,
                alignSelf: 'flex-start',
                marginLeft: 20,
              }}
            />
          </View>
          <View style={GlobalStyles.headerItem}>
           
            <Image
              source={Title}
              alt="Logo"
              style={{
                width: 589 * (header / (120 * 2)),
                height: 120 * (header / (120 * 2)),
              }}
            />
          </View>
        </View>
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
                onPress={() =>
                  this.setState({
                    transactionBatch: {},
                    check: 'Check',
                    loading: false,
                    modal: false,
                  })
                }>
                <Text style={[GlobalStyles.singleModalButtonText]}>Reject</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        {this.state.stage === 0 && (
          <KeyboardAwareScrollViewComponent>
            <SafeAreaView style={GlobalStyles.mainSend}>
              <ScrollView
                contentContainerStyle={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {this.state.transaction.map((item, index, array) => (
                  <Fragment key={index}>
                    <View
                      style={{
                        alignItems: 'center',
                      }}>
                      <View style={{marginTop: 20}} />
                      <Text style={GlobalStyles.formTitle}>Address</Text>
                      <View
                        style={{
                          width: Dimensions.get('screen').width,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <View style={{width: '90%'}}>
                          <TextInput
                            style={[GlobalStyles.input, {fontSize: 12}]}
                            keyboardType="default"
                            value={this.state.toAddress[index]}
                            onChangeText={value => {
                              let toAddress = [...this.state.toAddress];
                              toAddress[index] = value;
                              this.setState({toAddress});
                            }}
                          />
                        </View>
                        <Pressable
                          onPress={() => {
                            const scannerSelector = index;
                            this.setStateAsync({
                              scannerSelector,
                              stage: 10,
                            });
                          }}
                          style={{width: '10%'}}>
                          <IconIonIcons
                            name="qr-code"
                            size={30}
                            color={'white'}
                          />
                        </Pressable>
                      </View>
                      <Text style={GlobalStyles.formTitle}>Select Token</Text>
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
                            width: Dimensions.get('screen').width * 0.9,
                          },
                        }}
                        value={this.state.tokenSelected[index].value}
                        items={setTokens(blockchain.tokens)}
                        onValueChange={token => {
                          let tokenSelected = [...this.state.tokenSelected];
                          tokenSelected[index] = setTokens(blockchain.tokens)[
                            token
                          ];
                          this.setState({
                            tokenSelected,
                          });
                        }}
                      />
                      <Text style={GlobalStyles.formTitle}>Amount</Text>
                      <View
                        style={{
                          width: Dimensions.get('screen').width,
                          flexDirection: 'row',
                          justifyContent: 'space-around',
                          alignItems: 'center',
                        }}>
                        <View style={{width: '100%'}}>
                          <TextInput
                            style={[GlobalStyles.input]}
                            keyboardType="decimal-pad"
                            value={this.state.amount[index]}
                            onChangeText={value => {
                              let amount = [...this.state.amount];
                              amount[index] = value;
                              this.setState({amount});
                            }}
                          />
                        </View>
                      </View>
                    </View>
                    {this.state.check === 'Check Again' && (
                      <Text
                        style={{
                          fontSize: 20,
                          color: '#F00',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          paddingHorizontal: 20,
                        }}>
                        {this.state.errorText}
                      </Text>
                    )}
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: mainColor,
                        width: '90%',
                        marginVertical: 20,
                      }}
                    />
                  </Fragment>
                ))}
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyleDot,
                    {
                      width: 50,
                      height: 50,
                    },
                  ]}
                  onPress={() => {
                    let [amount, toAddress, transaction, tokenSelected] = [
                      [...this.state.amount],
                      [...this.state.toAddress],
                      [...this.state.transaction],
                      [...this.state.tokenSelected],
                    ];
                    amount.push('');
                    toAddress.push('');
                    transaction.push({});
                    tokenSelected.push(setTokens(blockchain.tokens)[0]);
                    this.setState({
                      amount,
                      toAddress,
                      transaction,
                      tokenSelected,
                    });
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: Dimensions.get('screen').width / 8,
                      height: Dimensions.get('screen').width / 8,
                    }}>
                    <Text style={[GlobalStyles.buttonText]}>+</Text>
                  </View>
                </Pressable>
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    this.state.loading ? {opacity: 0.5} : {},
                  ]}
                  onPress={async () => {
                    await this.setStateAsync({loading: true});
                    await this.batchTransfer();
                    await this.setStateAsync({loading: false});
                  }}>
                  <Text style={[GlobalStyles.buttonText]}>
                    {this.state.check}
                  </Text>
                </Pressable>
              </ScrollView>
            </SafeAreaView>
          </KeyboardAwareScrollViewComponent>
        )}
        {this.state.stage === 1 && (
          <View style={GlobalStyles.mainSend}>
            <CryptoSign
              transaction={this.state.transactionBatch}
              cancelTrans={e =>
                this.setState({
                  stage: 0,
                  explorerURL: '',
                  transactionBatch: {},
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
        )}
        {this.state.stage === 2 && (
          <View style={GlobalStyles.mainSend}>
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
                style={{width: 200, height: 200, marginTop: 30}}
              />
              <Text
                style={{
                  textShadowRadius: 1,
                  fontSize: 28,
                  fontWeight: 'bold',
                  marginTop: 30,
                  color:
                    this.state.status === 'Confirmed' ? mainColor : '#6978ff',
                }}>
                {this.state.status}
              </Text>
              <ScrollView style={{marginTop: 30}}>
                {this.state.transaction.map((item, index) => {
                  return (
                    <View
                      key={index}
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
                            {this.state.tokenSelected[index].name}
                          </Text>
                          <Text style={{fontSize: 14, color: 'white'}}>
                            eth_signTransaction
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
                          {this.state.tokenSelected[index].icon}
                        </View>
                        <Text style={{color: 'white'}}>
                          {`${epsilonRound(this.state.amount[index], 4)}`}{' '}
                          {this.state.tokenSelected[index].symbol}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
              <View>
                <Pressable
                  disabled={this.state.explorerURL === ''}
                  style={[
                    GlobalStyles.buttonStyle,
                    this.state.explorerURL === '' ? {opacity: 0.5} : {},
                  ]}
                  onPress={() => Linking.openURL(this.state.explorerURL)}>
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
                    this.state.explorerURL === '' ? {opacity: 0.5} : {},
                  ]}
                  onPress={() =>
                    this.setState({...SendWalletBaseState, loading: false})
                  }
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
        )}
        {
          // Scan QR
        }
        {this.state.stage === 10 && (
          <View
            style={[GlobalStyles.mainSend, {justifyContent: 'space-evenly'}]}>
            <View>
              <Text style={{color: 'white', fontSize: 28}}>Scan QR</Text>
            </View>
            <View
              style={{
                height: Dimensions.get('screen').height * 0.5,
                width: Dimensions.get('screen').width * 0.8,
                marginVertical: 20,
                borderColor: mainColor,
                borderWidth: 5,
                borderRadius: 10,
              }}>
              <Cam
                callbackAddress={e => {
                  let [toAddress] = [[...this.state.toAddress]];
                  toAddress[this.state.scannerSelector] = e;
                  this.setState({
                    toAddress,
                    stage: 0,
                  });
                }}
              />
            </View>
            <Pressable
              style={[GlobalStyles.buttonStyle]}
              onPress={async () => {
                this.setState({
                  stage: 0,
                });
              }}>
              <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>
                Cancel
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

export default SendWallet;
