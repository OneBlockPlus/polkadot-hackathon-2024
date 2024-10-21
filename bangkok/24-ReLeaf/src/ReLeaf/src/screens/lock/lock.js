import React, {Component} from 'react';
import {Dimensions, Pressable, Text, View} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Entypo';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import GlobalStyles from '../../styles/styles';
import {checkBiometrics, getEncryptedStorageValue} from '../../utils/utils';

const baseLockState = {
  pin: '',
  biometrics: false, // false
  clear: false,
};

export class Lock extends Component {
  constructor(props) {
    super(props);
    this.state = baseLockState;
    this.biometrics = new ReactNativeBiometrics();
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      const biometrics = await getEncryptedStorageValue('biometrics');
      this.setState({
        biometrics,
      });
    });
    this.props.navigation.addListener('blur', async () => {});
    // Avoid return on lock screen
    this.props.navigation.addListener('beforeRemove', async e => {
      e.preventDefault();
    });
  }

  async changeText(val) {
    if (val.length < 4) {
      this.setState({
        pin: val,
      });
    } else {
      const check = await getEncryptedStorageValue('pin');
      if (val === check) {
        this.props.navigation.navigate('Main');
      } else {
        await this.resetKeyboard();
      }
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

  render() {
    return (
      <SafeAreaView style={GlobalStyles.containerSafe}>
        <View
          style={{
            height: '75%',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            paddingTop: '10%',
          }}>
          <Text style={GlobalStyles.title}>Unlock your wallet</Text>
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
              {this.state.pin.substring(0, 1) !== '' ? '•' : '.'}
            </Text>
            <Text
              style={{
                color: 'white',
                width: Dimensions.get('window').width * 0.2,
                textAlign: 'center',
                fontSize: 24,
              }}>
              {this.state.pin.substring(1, 2) !== '' ? '•' : '.'}
            </Text>
            <Text
              style={{
                color: 'white',
                width: Dimensions.get('window').width * 0.2,
                textAlign: 'center',
                fontSize: 24,
              }}>
              {this.state.pin.substring(2, 3) !== '' ? '•' : '.'}
            </Text>
            <Text
              style={{
                color: 'white',
                width: Dimensions.get('window').width * 0.2,
                textAlign: 'center',
                fontSize: 24,
              }}>
              {this.state.pin.substring(3, 4) !== '' ? '•' : '.'}
            </Text>
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
        </View>
        <View
          style={{
            height: '25%',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingVertical: 0,
          }}>
          {this.state.biometrics && (
            <Pressable
              onPress={async () => {
                const flag = await checkBiometrics();
                flag && this.props.navigation.navigate('Main');
              }}>
              <Icon name="fingerprint" size={100} color={'white'} />
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

export default Lock;
