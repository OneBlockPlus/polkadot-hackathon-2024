import {Wallet} from 'ethers';
import React, {Component} from 'react';
import {Dimensions, Image, Pressable, Text, View} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Entypo';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import logo from '../../assets/logo.png';
import GlobalStyles, {ratio} from '../../styles/styles';
import {
  checkBiometrics,
  getAsyncStorageValue,
  setAsyncStorageValue,
  setEncryptedStorageValue,
} from '../../utils/utils';

const baseSetupState = {
  stage: 0, // 0
  creationEOA: false, // false
  creationAA: false, // false
  loading: false, // false
  mnemonic: '', // ""
  publicKey: '', // ""
  privateKey: '', // ""
  pin: '',
  // Options
  biometrics: false, // false
  // Utils
  clear: false,
};

export default class Setup extends Component {
  constructor(props) {
    super(props);
    this.state = baseSetupState;
    this.biometrics = new ReactNativeBiometrics();
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      const flag = await getAsyncStorageValue('biometricsAvailable');
      if (flag === null) {
        const biometricsAvailable = (await this.biometrics.isSensorAvailable())
          .available;
        await setAsyncStorageValue({biometricsAvailable});
        this.setState({
          biometrics: biometricsAvailable,
        });
      } else {
        this.setState({
          biometrics: flag,
        });
      }
    });
    this.props.navigation.addListener('blur', async () => {});
  }

  async createWalletEOA() {
    await this.setStateAsync({
      loading: true,
    });
    setTimeout(() => {
      const wallet = Wallet.createRandom();
      const mnemonic = wallet.mnemonic.phrase;
      const publicKey = wallet.address;
      const privateKey = wallet.privateKey;
      this.setState({
        mnemonic: mnemonic.split(' ').slice(0, 12).join(' '),
        publicKey,
        privateKey,
        loading: false,
        stage: 1,
        creationEOA: true,
      });
    }, 100); // Delay for heavy load function
  }

  async createWalletAA() {
    await this.setStateAsync({
      loading: true,
    });
    setTimeout(() => {
      const wallet = Wallet.createRandom();
      const mnemonic = wallet.mnemonic.phrase;
      const publicKey = wallet.address;
      const privateKey = wallet.privateKey;
      this.setState({
        mnemonic: mnemonic.split(' ').slice(0, 12).join(' '),
        publicKey,
        privateKey,
        loading: false,
        stage: 1,
        creationAA: true,
      });
    }, 100); // Delay for heavy load function
  }

  async completeSetup() {
    await this.setStateAsync({
      loading: true,
    });
    await setEncryptedStorageValue({
      aaFlag: this.state.creationAA,
      mnemonic: this.state.mnemonic,
      privateKey: this.state.privateKey,
    });
    await setAsyncStorageValue({
      publicKey: this.state.publicKey,
    });
    await this.setStateAsync({
      stage: 2,
      loading: false,
    });
  }

  async changeText(val) {
    if (val.length <= 4) {
      this.setState({
        pin: val,
      });
    } else {
      await this.resetKeyboard();
    }
  }

  resetKeyboard() {
    return new Promise((resolve, reject) => {
      this.setState(
        {
          clear: true,
        },
        () =>
          this.setState(
            {
              clear: false,
              pin: '',
            },
            () => resolve('ok'),
          ),
      );
    });
  }

  async setBiometrics() {
    const flag = await checkBiometrics();
    await setEncryptedStorageValue({biometrics: flag});
  }

  // Component Utils
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
    const size = Dimensions.get('window').width * (ratio > 1.7 ? 0.8 : 0.6);
    return (
      <SafeAreaView style={GlobalStyles.containerSafe}>
        {
          // General Layout
        }
        {this.state.stage === 0 && (
          <React.Fragment>
            <View
              style={{
                justifyContent: 'space-evenly',
                alignItems: 'center',
                height: '70%',
              }}>
              <Image
                source={logo}
                alt="Cat"
                style={{
                  width: size,
                  height: size,
                }}
              />
              <Text
                style={{
                  fontSize: 28,
                  textAlign: 'center',
                  marginHorizontal: 40,
                  color: 'white',
                  fontFamily: 'DMSans-Medium',
                }}>
                ReLeaf Wallet: Batch transactions, smart savings, and easy card
                payments.
              </Text>
            </View>
            <View
              style={{
                justifyContent: 'space-evenly',
                alignItems: 'center',
                height: '30%',
              }}>
              <Pressable
                disabled={this.state.loading}
                style={[
                  GlobalStyles.buttonStyle,
                  this.state.loading ? {opacity: 0.5} : {},
                ]}
                onPress={() => this.createWalletEOA()}>
                <Text
                  style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>
                  Create Wallet
                </Text>
              </Pressable>
            </View>
          </React.Fragment>
        )}
        {
          // EOA Setup
        }
        {this.state.creationEOA && (
          <React.Fragment>
            {this.state.stage === 1 && (
              <React.Fragment>
                <View
                  style={{
                    height: '70%',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}>
                  <Text style={GlobalStyles.title}>
                    Secret{'\n'}Recovery Phrase
                  </Text>
                  <View style={{width: '94%'}}>
                    <Text style={GlobalStyles.description}>
                      This is the only way for recovering your wallet. Be sure
                      to keep it stored securely!
                    </Text>
                  </View>
                  <View
                    style={{
                      flexWrap: 'wrap',
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      alignItems: 'stretch',
                    }}>
                    {this.state.mnemonic.split(' ').map((item, index) => (
                      <React.Fragment key={'seed:' + index}>
                        <View
                          style={{
                            backgroundColor: 'black',
                            width: Dimensions.get('screen').width * 0.3,
                            marginVertical: 10,
                            alignItems: 'flex-start',
                            borderRadius: 10,
                            borderColor: 'white',
                            borderWidth: 0.5,
                          }}>
                          <Text
                            style={{margin: 10, fontSize: 15, color: 'white'}}>
                            {`${index + 1} | `}
                            {item}
                          </Text>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                </View>
                <View
                  style={{
                    height: '30%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 10,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {[...Array(this.state.biometrics ? 5 : 4).keys()].map(
                      (item, index) => (
                        <Text
                          key={'dot:' + index}
                          style={{
                            color:
                              this.state.stage >= index ? 'white' : '#a3a3a3',
                            marginHorizontal: 20,
                            fontSize: 38,
                          }}>
                          {this.state.stage >= index ? '•' : '·'}
                        </Text>
                      ),
                    )}
                  </View>
                  <Pressable
                    disabled={this.state.loading}
                    style={[GlobalStyles.buttonStyle]}
                    onPress={async () => {
                      await this.completeSetup();
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 'bold',
                      }}>
                      Continue
                    </Text>
                  </Pressable>
                  <Pressable
                    disabled={this.state.loading}
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        backgroundColor: '#6978ff',
                      },
                    ]}
                    onPress={async () => {
                      this.setState(baseSetupState);
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 'bold',
                      }}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
        {
          // AA Setup
        }
        {this.state.creationAA && (
          <React.Fragment>
            {this.state.stage === 1 && (
              <React.Fragment>
                <View
                  style={{
                    height: '70%',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}>
                  <Text style={GlobalStyles.title}>
                    Secret{'\n'}Recovery Phrase
                  </Text>
                  <View style={{width: '94%'}}>
                    <Text style={GlobalStyles.description}>
                      This is the only way for recovering your wallet. Be sure
                      to keep it stored securely!
                    </Text>
                  </View>
                  <View
                    style={{
                      flexWrap: 'wrap',
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      alignItems: 'stretch',
                    }}>
                    {this.state.mnemonic.split(' ').map((item, index) => (
                      <React.Fragment key={'seed:' + index}>
                        <View
                          style={{
                            backgroundColor: 'black',
                            width: Dimensions.get('screen').width * 0.3,
                            marginVertical: 10,
                            alignItems: 'flex-start',
                            borderRadius: 10,
                            borderColor: 'white',
                            borderWidth: 0.5,
                          }}>
                          <Text
                            style={{margin: 10, fontSize: 15, color: 'white'}}>
                            {`${index + 1} | `}
                            {item}
                          </Text>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                </View>
                <View
                  style={{
                    height: '30%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 10,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {[...Array(this.state.biometrics ? 5 : 4).keys()].map(
                      (item, index) => (
                        <Text
                          key={'dot:' + index}
                          style={{
                            color:
                              this.state.stage >= index ? 'white' : '#a3a3a3',
                            marginHorizontal: 20,
                            fontSize: 38,
                          }}>
                          {this.state.stage >= index ? '•' : '·'}
                        </Text>
                      ),
                    )}
                  </View>
                  <Pressable
                    disabled={this.state.loading}
                    style={[GlobalStyles.buttonStyle]}
                    onPress={async () => {
                      await this.completeSetup();
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 'bold',
                      }}>
                      Continue
                    </Text>
                  </Pressable>
                  <Pressable
                    disabled={this.state.loading}
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        backgroundColor: '#6978ff',
                      },
                    ]}
                    onPress={async () => {
                      this.setState(baseSetupState);
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 'bold',
                      }}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
        {
          // General Setup Stage
        }
        {this.state.stage === 2 && (
          <React.Fragment>
            <View
              style={{
                height: ratio > 1.7 ? '75%' : '70%',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                paddingTop: '10%',
              }}>
              <Text style={GlobalStyles.title}>Protect with a PIN</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  paddingTop: '10%',
                }}>
                <Text
                  style={{
                    color: 'white',
                    width: Dimensions.get('window').width * 0.2,
                    textAlign: 'center',
                    fontSize: 24,
                  }}>
                  {this.state.pin.substring(0, 1) !== ''
                    ? this.state.pin.substring(0, 1)
                    : '•'}
                </Text>
                <Text
                  style={{
                    color: 'white',
                    width: Dimensions.get('window').width * 0.2,
                    textAlign: 'center',
                    fontSize: 24,
                  }}>
                  {this.state.pin.substring(1, 2) !== ''
                    ? this.state.pin.substring(1, 2)
                    : '•'}
                </Text>
                <Text
                  style={{
                    color: 'white',
                    width: Dimensions.get('window').width * 0.2,
                    textAlign: 'center',
                    fontSize: 24,
                  }}>
                  {this.state.pin.substring(2, 3) !== ''
                    ? this.state.pin.substring(2, 3)
                    : '•'}
                </Text>
                <Text
                  style={{
                    color: 'white',
                    width: Dimensions.get('window').width * 0.2,
                    textAlign: 'center',
                    fontSize: 24,
                  }}>
                  {this.state.pin.substring(3, 4) !== ''
                    ? this.state.pin.substring(3, 4)
                    : '•'}
                </Text>
              </View>
              <VirtualKeyboard
                rowStyle={{
                  width: Dimensions.get('window').width,
                }}
                cellStyle={{
                  height:
                    Dimensions.get('window').height / (ratio > 1.7 ? 10 : 14),
                  borderWidth: 0,
                  margin: 1,
                }}
                colorBack={'black'}
                color="white"
                pressMode="string"
                onPress={val => this.changeText(val)}
                clear={this.state.clear}
              />
            </View>
            <View
              style={{
                height: ratio > 1.7 ? '25%' : '30%',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingVertical: 0,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {[...Array(this.state.biometrics ? 5 : 4).keys()].map(
                  (item, index) => (
                    <Text
                      key={'dot:' + index}
                      style={{
                        color: this.state.stage >= index ? 'white' : '#a3a3a3',
                        marginHorizontal: 20,
                        fontSize: 38,
                      }}>
                      {this.state.stage >= index ? '•' : '·'}
                    </Text>
                  ),
                )}
              </View>
              <Pressable
                disabled={this.state.loading || this.state.pin.length !== 4}
                style={[
                  GlobalStyles.buttonStyle,
                  this.state.loading || this.state.pin.length !== 4
                    ? {opacity: 0.5}
                    : {},
                ]}
                onPress={async () => {
                  this.setState({
                    loading: true,
                  });
                  await setEncryptedStorageValue({pin: this.state.pin});
                  this.setState({
                    stage: this.state.biometrics ? 3 : 4,
                    loading: false,
                  });
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}>
                  Set Pin
                </Text>
              </Pressable>
              <Pressable
                disabled={this.state.loading}
                style={[
                  GlobalStyles.buttonStyle,
                  {
                    backgroundColor: '#6978ff',
                  },
                  this.state.loading ? {opacity: 0.5} : {},
                ]}
                onPress={async () => {
                  this.setState(baseSetupState);
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </React.Fragment>
        )}
        {this.state.stage === 3 && (
          <React.Fragment>
            <View
              style={{
                height: ratio > 1.7 ? '70%' : '55%',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <Text style={GlobalStyles.title}>Protect with Biometrics</Text>
              <Icon
                name="fingerprint"
                size={ratio > 1.7 ? 200 : 150}
                color={'white'}
                style={{
                  marginVertical: ratio > 1.7 ? '20%' : '0%',
                }}
              />
            </View>
            <View
              style={{
                height: ratio > 1.7 ? '30%' : '45%',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 10,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {[...Array(this.state.biometrics ? 5 : 4).keys()].map(
                  (item, index) => (
                    <Text
                      key={'dot:' + index}
                      style={{
                        color: this.state.stage >= index ? 'white' : '#a3a3a3',
                        marginHorizontal: 20,
                        fontSize: 38,
                      }}>
                      {this.state.stage >= index ? '•' : '·'}
                    </Text>
                  ),
                )}
              </View>
              <Pressable
                disabled={this.state.loading}
                style={[
                  GlobalStyles.buttonStyle,
                  this.state.loading ? {opacity: 0.5} : {},
                ]}
                onPress={async () => {
                  this.setState({
                    loading: true,
                  });
                  await this.setBiometrics();
                  this.setState({
                    stage: 4,
                    loading: false,
                  });
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}>
                  Set Biometrics
                </Text>
              </Pressable>
              <Pressable
                disabled={this.state.loading}
                style={[
                  GlobalStyles.buttonStyle,
                  {
                    backgroundColor: '#6978ff',
                  },
                  this.state.loading ? {opacity: 0.5} : {},
                ]}
                onPress={async () => {
                  this.setState({
                    loading: true,
                  });
                  await this.setBiometrics(false);
                  this.setState({
                    stage: 4,
                    loading: false,
                  });
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}>
                  Skip
                </Text>
              </Pressable>
              <Pressable
                disabled={this.state.loading}
                style={[
                  GlobalStyles.buttonStyle,
                  {
                    backgroundColor: '#ff689e',
                  },
                  this.state.loading ? {opacity: 0.5} : {},
                ]}
                onPress={async () => {
                  this.setState(baseSetupState);
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </React.Fragment>
        )}
        {this.state.stage === 4 && (
          <React.Fragment>
            <View
              style={{
                height: ratio > 1.7 ? '80%' : '70%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: '25%',
              }}>
              <Image
                source={logo}
                alt="Cat"
                style={{
                  width: size,
                  height: size,
                }}
              />
              <Text style={[GlobalStyles.title, {marginVertical: 20}]}>
                All Done!
              </Text>
              <Text style={[GlobalStyles.description, {margin: 40}]}>
                Start your decentralized economy.
              </Text>
            </View>
            <View
              style={{
                height: ratio > 1.7 ? '20%' : '30%',
                justifyContent: 'space-evenly',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {[...Array(this.state.biometrics ? 5 : 4)].map(
                  (item, index) => (
                    <Text
                      key={'dot:' + index}
                      style={{
                        color: this.state.stage >= index ? 'white' : '#a3a3a3',
                        marginHorizontal: 20,
                        fontSize: 38,
                      }}>
                      {this.state.stage >= index ? '•' : '·'}
                    </Text>
                  ),
                )}
              </View>
              <Pressable
                style={[GlobalStyles.buttonStyle]}
                onPress={async () => {
                  this.props.navigation.navigate('SplashLoading');
                }}>
                <Text
                  style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>
                  Finish
                </Text>
              </Pressable>
            </View>
          </React.Fragment>
        )}
      </SafeAreaView>
    );
  }
}
