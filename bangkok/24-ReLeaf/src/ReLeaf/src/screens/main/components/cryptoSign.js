// Basic Imports
import React, {Component} from 'react';
import {Dimensions, Pressable, Text, View} from 'react-native';
// Styles
import GlobalStyles from '../../../styles/styles';
// Utils
import ReactNativeBiometrics from 'react-native-biometrics';
import Icon from 'react-native-vector-icons/Entypo';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import ContextModule from '../../../utils/contextModule';
import {getEncryptedStorageValue} from '../../../utils/utils';

const baseStateCryptoSign = {
  biometrics: false,
  clear: false,
  pin: '',
};

class CryptoSign extends Component {
  constructor(props) {
    super(props);
    this.state = baseStateCryptoSign;
  }

  static contextType = ContextModule;

  async signTransaction() {
    try {
      this.props.signEthereum();
    } catch (e) {
      console.log(e);
      this.props.cancelTrans();
    }
  }

  async checkPin(pin) {
    return new Promise(async resolve => {
      const myPin = await getEncryptedStorageValue('pin');
      if (myPin) {
        if (myPin === pin) {
          resolve(true);
        }
        resolve(false);
      } else {
        resolve(false);
      }
    });
  }

  async checkBiometrics() {
    return new Promise(async resolve => {
      const rnBiometrics = new ReactNativeBiometrics();
      rnBiometrics
        .simplePrompt({promptMessage: 'Confirm fingerprint'})
        .then(resultObject => {
          const {success} = resultObject;
          if (success) {
            console.log('successful biometrics provided');
            this.signTransaction();
            resolve(true);
          } else {
            console.log('user cancelled biometric prompt');
            resolve(false);
          }
        })
        .catch(() => {
          console.log('biometrics failed');
          resolve(false);
        });
    });
  }

  async changeText(val) {
    if (val.length < 4) {
      this.setState({
        pin: val,
      });
    }
    if (val.length === 4) {
      const flag = await this.checkPin(val);
      flag ? this.signTransaction() : await this.resetKeyboard();
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

  async componentDidMount() {
    // Only Debug
    const biometrics = await getEncryptedStorageValue('biometrics');
    this.setState({biometrics});
  }

  render() {
    return (
      <View
        style={{
          height: '80%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text style={GlobalStyles.title}>
          Sign with PIN{'\n'}
          {this.state.biometrics && 'or Biometrics'}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
          {[...Array(4).keys()].map((item, index) => (
            <Text
              key={'pin:' + index}
              style={{
                color: 'white',
                width: Dimensions.get('window').width * 0.2,
                textAlign: 'center',
                fontSize: 24,
              }}>
              {this.state.pin.substring(index, index + 1) !== '' ? '•' : '·'}
            </Text>
          ))}
        </View>
        <VirtualKeyboard
          rowStyle={{
            width: Dimensions.get('window').width,
          }}
          cellStyle={{
            height: Dimensions.get('window').height / 10,
            borderWidth: 0,
            margin: 1,
          }}
          colorBack={'black'}
          color="white"
          pressMode="string"
          onPress={val => this.changeText(val)}
          clear={this.state.clear}
        />
        {this.state.biometrics && (
          <Pressable
            onPress={() => {
              this.checkBiometrics();
            }}>
            <Icon name="fingerprint" size={100} color={'white'} />
          </Pressable>
        )}
      </View>
    );
  }
}

export default CryptoSign;
