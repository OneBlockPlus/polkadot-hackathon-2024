import AGGREGATOR_ABI from '@stellaswap/swap-sdk/src/abis/aggregator.json';
import {
  AGGREGATOR_ADDRESS,
  PERMIT2_ADDRESS,
} from '@stellaswap/swap-sdk/src/constants';
import permit2 from '@stellaswap/swap-sdk/src/permit2';
import stellaSwap from '@stellaswap/swap-sdk';
import {ethers} from 'ethers';
import {defaultAbiCoder} from 'ethers/lib/utils';
import React, {Component} from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import checkMark from '../../assets/checkMark.png';
import Renders from '../../assets/logo.png';
import Title from '../../assets/title.png';
import {abiBatch} from '../../contracts/batch';
import {abiERC20} from '../../contracts/erc20';
import GlobalStyles, {header, mainColor} from '../../styles/styles';
import {BatchTransactionsAddress, blockchain} from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import {
  epsilonRound,
  getAsyncStorageValue,
  getEncryptedStorageValue,
} from '../../utils/utils';
import {getQuote} from '../../utils/utilsStellaSwap';
import KeyboardAwareScrollViewComponent from '../sendWallet/components/keyboardAvoid';
import {SafeAreaView} from 'react-native-safe-area-context';
import CryptoSign from '../sendWallet/components/cryptoSign';

function setTokens(array) {
  return array.map((item, index) => {
    return {
      ...item,
      value: index,
      label: item.symbol,
      key: item.symbol,
    };
  });
}

const baseSwapWalletState = {
  publicKey: '0x0000000000000000000000000000000000000000',
  tokenSelected1: setTokens(blockchain.tokens)[0],
  tokenSelected2: setTokens(blockchain.tokens)[2],
  transaction: {},
  transactionDisplay: {
    name: setTokens(blockchain.tokens)[0].symbol,
    amount: 0,
    amount2: 0,
    gas: 0,
  },
  usdConversion: blockchain.tokens.map(() => 1),
  amount: '0.1',
  splippage: 0.01, // Auto splippage
  stage: 0,
  hash: '',
  modal: false, // false
  status: 'Processing...',
  errorText: '',
};

class SwapWallet extends Component {
  constructor(props) {
    super(props);
    this.state = baseSwapWalletState;
    this.provider = new ethers.providers.JsonRpcProvider(blockchain.rpc, {
      name: blockchain.name,
      chainId: blockchain.chainId,
    });
    this.swapContract = new ethers.Contract(
      AGGREGATOR_ADDRESS,
      AGGREGATOR_ABI,
      this.provider,
    );
    this.batchContract = new ethers.Contract(
      BatchTransactionsAddress,
      abiBatch,
      this.provider,
    );
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      const publicKey = await getAsyncStorageValue('publicKey');
      const usdConversion = await getAsyncStorageValue('usdConversion');
      this.setState({
        publicKey: publicKey ?? baseSwapWalletState.publicKey,
        usdConversion: usdConversion ?? baseSwapWalletState.usdConversion,
      });
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
        this.state.transaction,
      );
      await createReceipt.wait();
      this.setState({
        explorerURL: `${blockchain.blockExplorer}tx/${createReceipt.hash}`,
        status: 'Confirmed',
      });
    } catch (e) {
      console.log(e);

      this.setState({
        stage: 0,
        explorerURL: '',
        transaction: {},
        check: 'Check',
        loading: false,
        modal: false,
        status: 'Processing...',
        errorText: '',
      });
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

  async checkSwap() {
    if (
      this.state.tokenSelected1.address ===
      '0x0000000000000000000000000000000000000000'
    ) {
      console.log('swapETH2Token');
      this.setState({
        loading: true,
      });
      await this.swapETH2Token();
      this.setState({
        loading: false,
      });
    } else if (
      this.state.tokenSelected2.address ===
      '0x0000000000000000000000000000000000000000'
    ) {
      console.log('swapToken2ETH');
      this.setState({
        loading: true,
      });
      await this.swapTest();
      this.setState({
        loading: false,
      });
    } else {
      console.log('swapToken2Token');
      this.setState({
        loading: true,
      });
      await this.swapToken2Token();
      this.setState({
        loading: false,
      });
    }
  }

  async swapToken2Token() {
    try {
      const tokenAddress = new ethers.Contract(
        this.state.tokenSelected1.address,
        abiERC20,
        this.provider,
      );
      const getDecimals = await tokenAddress.decimals();
      const quote = await getQuote(
        this.state.tokenSelected1.address,
        this.state.tokenSelected2.address,
        ethers.utils.parseUnits(this.state.amount, getDecimals),
        this.state.publicKey,
        (this.state.splippage * 100).toString(),
      );
      console.log(quote);
      const {commands, inputs} = quote?.execution;
      const privateKey = await getEncryptedStorageValue('privateKey');
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const {signature, permit} = await permit2.getPermit2Signature(
        this.state.tokenSelected1.address,
        ethers.utils.parseUnits(this.state.amount, getDecimals),
        wallet,
      );

      const permit2Command = {instruction: 4};
      const permit2Input = defaultAbiCoder.encode(
        [
          'uint256',
          'address',
          'address',
          'address',
          'uint256',
          'uint256',
          'bytes',
        ],
        [
          permit.permitted.amount,
          this.state.publicKey,
          permit.spender,
          permit.permitted.token,
          permit.nonce,
          permit.deadline,
          signature,
        ],
      );

      commands.unshift(permit2Command);
      inputs.unshift(permit2Input);

      const sweeps = commands.filter(command => command.instruction === 7);
      const permits = commands.filter(command => command.instruction === 4);
      if (sweeps.length >= 2 && permits.length === 1) {
        const data = this.swapContract.interface.encodeFunctionData('execute', [
          commands,
          inputs,
        ]);
        const allowance = await tokenAddress.interface.encodeFunctionData(
          'approve',
          [
            PERMIT2_ADDRESS,
            ethers.utils.parseUnits(this.state.amount, getDecimals),
          ],
        );
        const batchData = this.batchContract.interface.encodeFunctionData(
          'batchAll',
          [
            [this.state.tokenSelected1.address, AGGREGATOR_ADDRESS],
            [],
            [allowance, data],
            [],
          ],
        );
        let transaction = {
          from: this.state.publicKey,
          to: BatchTransactionsAddress,
          data: batchData,
        };
        console.log(transaction);
        const balance = await this.provider.getBalance(this.state.publicKey);
        const gasPrice = await this.provider.getGasPrice();
        const gas = await this.provider.estimateGas(transaction);
        const check = balance.gte(gas.mul(gasPrice));
        let errorText = '';
        if (!check) {
          errorText = `Not enough balance, you need ${ethers.utils.formatEther(
            gas.mul(gasPrice).sub(balance).abs(),
          )} GLMR to complete transaction`;
          console.log(errorText);
          throw 'Not enough balance';
        }

        let transactionDisplay = {};
        const displayAmount2 = ethers.utils.formatUnits(
          quote.amountOutBn,
          this.state.tokenSelected2.decimals,
        );
        const displayGas = ethers.utils.formatEther(gas.mul(gasPrice));
        transactionDisplay = {
          name: this.state.tokenSelected1.symbol,
          amount: epsilonRound(parseFloat(this.state.amount), 8),
          amount2: epsilonRound(displayAmount2, 8),
          gas: epsilonRound(displayGas, 8),
        };
        this.setState({
          transactionDisplay,
          transaction,
          check: 'Check',
          loading: false,
          modal: check,
          errorText,
        });
      } else {
        throw 'Bad Quote';
      }
    } catch (e) {
      console.log(e);
      console.log('Bad Quote');
    }
  }

  async swapETH2Token() {
    try {
      const quote = await getQuote(
        'ETH',
        this.state.tokenSelected2.address,
        ethers.utils.parseEther(this.state.amount),
        this.state.publicKey,
        (this.state.splippage * 100).toString(),
      );
      console.log(quote);
      const {commands, inputs} = quote?.execution;
      const data = this.swapContract.interface.encodeFunctionData('execute', [
        commands,
        inputs,
      ]);
      const batchData = this.batchContract.interface.encodeFunctionData(
        'batchAll',
        [
          [AGGREGATOR_ADDRESS],
          [ethers.utils.parseEther(this.state.amount)],
          [data],
          [],
        ],
      );
      let transaction = {
        from: this.state.publicKey,
        to: BatchTransactionsAddress,
        data: batchData,
        value: ethers.utils.parseEther('0'),
      };
      console.log(transaction);
      const balance = await this.provider.getBalance(this.state.publicKey);
      const gasPrice = await this.provider.getGasPrice();
      const gas = await this.provider.estimateGas(transaction);
      const value = ethers.utils.parseEther(this.state.amount);
      const check = balance.gte(value.add(gas.mul(gasPrice)));
      let errorText = '';
      if (!check) {
        errorText = `Not enough balance, you need ${ethers.utils.formatEther(
          value.add(gas.mul(gasPrice)).sub(balance).abs(),
        )} GLMR to complete transaction`;
        console.log(errorText);
        throw 'Not enough balance';
      }

      let transactionDisplay = {};

      const displayAmount = ethers.utils.formatEther(value);
      const displayAmount2 = ethers.utils.formatUnits(
        quote.amountOutBn,
        this.state.tokenSelected2.decimals,
      );
      const displayGas = ethers.utils.formatEther(gas.mul(gasPrice));
      transactionDisplay = {
        name: 'GLMR',
        amount: epsilonRound(displayAmount, 8),
        amount2: epsilonRound(displayAmount2, 8),
        gas: epsilonRound(displayGas, 8),
      };
      this.setState({
        transactionDisplay,
        transaction,
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

  async swapToken2ETH() {
    try {
      const tokenAddress = new ethers.Contract(
        this.state.tokenSelected1.address,
        abiERC20,
        this.provider,
      );
      const getDecimals = await tokenAddress.decimals();
      const quote = await getQuote(
        this.state.tokenSelected1.address,
        'ETH',
        ethers.utils.parseUnits(this.state.amount, getDecimals),
        this.state.publicKey,
        (this.state.splippage * 100).toString(),
      );
      console.log(quote);
      const {commands, inputs} = quote?.execution;
      const privateKey = await getEncryptedStorageValue('privateKey');
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const {signature, permit} = await permit2.getPermit2Signature(
        this.state.tokenSelected1.address,
        ethers.utils.parseUnits(this.state.amount, getDecimals),
        wallet,
      );

      const permit2Command = {instruction: 4};
      const permit2Input = defaultAbiCoder.encode(
        [
          'uint256',
          'address',
          'address',
          'address',
          'uint256',
          'uint256',
          'bytes',
        ],
        [
          permit.permitted.amount,
          this.state.publicKey,
          permit.spender,
          permit.permitted.token,
          permit.nonce,
          permit.deadline,
          signature,
        ],
      );

      commands.unshift(permit2Command);
      inputs.unshift(permit2Input);

      const sweeps = commands.filter(command => command.instruction === 7);
      const permits = commands.filter(command => command.instruction === 4);
      if (sweeps.length >= 2 && permits.length === 1) {
        const data = this.swapContract.interface.encodeFunctionData('execute', [
          commands,
          inputs,
        ]);
        const allowance = await tokenAddress.interface.encodeFunctionData(
          'approve',
          [
            PERMIT2_ADDRESS,
            ethers.utils.parseUnits(this.state.amount, getDecimals),
          ],
        );
        const batchData = this.batchContract.interface.encodeFunctionData(
          'batchAll',
          [
            [this.state.tokenSelected1.address, AGGREGATOR_ADDRESS],
            [],
            [allowance, data],
            [],
          ],
        );
        let transaction = {
          from: this.state.publicKey,
          to: BatchTransactionsAddress,
          data: batchData,
        };
        console.log(transaction);
        const balance = await this.provider.getBalance(this.state.publicKey);
        const gasPrice = await this.provider.getGasPrice();
        const gas = await this.provider.estimateGas(transaction);
        const check = balance.gte(gas.mul(gasPrice));
        let errorText = '';
        if (!check) {
          errorText = `Not enough balance, you need ${ethers.utils.formatEther(
            gas.mul(gasPrice).sub(balance).abs(),
          )} GLMR to complete transaction`;
          console.log(errorText);
          throw 'Not enough balance';
        }

        let transactionDisplay = {};
        const displayAmount2 = ethers.utils.formatUnits(
          quote.amountOutBn,
          this.state.tokenSelected2.decimals,
        );
        const displayGas = ethers.utils.formatEther(gas.mul(gasPrice));
        transactionDisplay = {
          name: this.state.tokenSelected1.symbol,
          amount: epsilonRound(parseFloat(this.state.amount), 8),
          amount2: epsilonRound(displayAmount2, 8),
          gas: epsilonRound(displayGas, 8),
        };
        this.setState({
          transactionDisplay,
          transaction,
          check: 'Check',
          loading: false,
          modal: check,
          errorText,
        });
      } else {
        throw 'Bad Quote';
      }
    } catch (e) {
      console.log(e);
      console.log('Bad Quote');
    }
  }

  async swapTest() {
    const privateKey = await getEncryptedStorageValue('privateKey');
    const signer = new ethers.Wallet(privateKey, this.provider);
    const amount = ethers.utils.parseUnits(
      this.state.amount,
      this.state.tokenSelected1.decimals,
    );
    const allowance = await stellaSwap.checkAllowance(
      this.state.tokenSelected1.address,
      signer,
      PERMIT2_ADDRESS,
    );
    console.log(allowance);
    const txApprove = await stellaSwap.approve(
      this.state.tokenSelected1.address,
      amount,
      signer,
      PERMIT2_ADDRESS,
    );
    console.log(txApprove);
    const quote = await stellaSwap.getQuote(
      this.state.tokenSelected1.address,
      'ETH',
      amount,
      signer.address,
      (this.state.splippage * 100).toString(),
    );
    console.log(quote);
    const tx = await stellaSwap.executeSwap(
      this.state.tokenSelected1.address,
      'ETH',
      amount,
      signer,
      (this.state.splippage * 100).toString(),
    );
    console.log(tx);
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
                  this.state.usdConversion[this.state.tokenSelected1.value],
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
                    transaction: {},
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
            <View
              style={[
                GlobalStyles.mainSend,
                {justifyContent: 'space-around', alignItems: 'center'},
              ]}>
              <View style={{width: '100%'}}>
                <Text
                  style={[
                    GlobalStyles.exoTitle,
                    {
                      textAlign: 'center',
                      marginBottom: 20,
                      marginTop: 20,
                      fontSize: 24,
                      fontWeight: 'bold',
                    },
                  ]}>
                  Amount
                </Text>
                <View style={{width: '100%'}}>
                  <TextInput
                    style={[GlobalStyles.input]}
                    keyboardType="decimal-pad"
                    value={this.state.amount}
                    onChangeText={value => this.setState({amount: value})}
                  />
                </View>
                <Text
                  style={[
                    GlobalStyles.exoTitle,
                    {
                      textAlign: 'center',
                      marginBottom: 20,
                      marginTop: 20,
                      fontSize: 24,
                      fontWeight: 'bold',
                    },
                  ]}>
                  From
                </Text>
                <RNPickerSelect
                  disabled={true}
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
                  value={this.state.tokenSelected1.value}
                  items={setTokens(blockchain.tokens)}
                  onValueChange={item => {
                    this.setState({
                      tokenSelected1: setTokens(blockchain.tokens)[item],
                    });
                  }}
                />
                <Text
                  style={[
                    GlobalStyles.exoTitle,
                    {
                      textAlign: 'center',
                      marginBottom: 20,
                      marginTop: 20,
                      fontSize: 24,
                      fontWeight: 'bold',
                    },
                  ]}>
                  To
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
                      width: Dimensions.get('screen').width * 0.9,
                    },
                  }}
                  value={this.state.tokenSelected2.value}
                  items={setTokens(blockchain.tokens)}
                  onValueChange={item => {
                    this.setState({
                      tokenSelected2: setTokens(blockchain.tokens)[item],
                    });
                  }}
                />
              </View>
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
                  onPress={() => this.checkSwap()}>
                  <Text style={[GlobalStyles.buttonText]}>Swap</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAwareScrollViewComponent>
        )}
        {this.state.stage === 1 && (
          <View style={GlobalStyles.mainSend}>
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
                style={{width: 200, height: 200}}
              />
              <Text
                style={{
                  textShadowRadius: 1,
                  fontSize: 28,
                  fontWeight: 'bold',
                  color:
                    this.state.status === 'Confirmed' ? mainColor : '#6978ff',
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
                        Stellaswap
                      </Text>
                      <Text style={{fontSize: 14, color: 'white'}}>Send</Text>
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
                      {this.state.tokenSelected1.icon}
                    </View>
                    <Text>
                      {`${epsilonRound(
                        this.state.transactionDisplay.amount,
                        4,
                      )}`}{' '}
                      {this.state.tokenSelected1.symbol}
                    </Text>
                  </View>
                </View>
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
                        Stellaswap
                      </Text>
                      <Text style={{fontSize: 14, color: 'white'}}>
                        Receive
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
                      {this.state.tokenSelected2.icon}
                    </View>
                    <Text style={{color: 'white'}}>
                      {`${epsilonRound(
                        this.state.transactionDisplay.amount2,
                        4,
                      )}`}{' '}
                      {this.state.tokenSelected2.symbol}
                    </Text>
                  </View>
                </View>
              </View>

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
                    this.setState({
                      ...baseSwapWalletState,
                      publicKey: this.state.publicKey,
                      usdConversion: this.state.usdConversion,
                      loading: false,
                    })
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
      </SafeAreaView>
    );
  }
}

export default SwapWallet;
