import Clipboard from '@react-native-clipboard/clipboard';
import React, {Component} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import QRCodeStyled from 'react-native-qrcode-styled';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import Renders from '../../assets/logo.png';
import Title from '../../assets/title.png';
import GlobalStyles, {header, ratio} from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import {getAsyncStorageValue} from '../../utils/utils';

const baseDepositState = {
  publicKey: '0x0000000000000000000000000000000000000000',
};

class DepositWallet extends Component {
  constructor(props) {
    super(props);
    this.state = baseDepositState;
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      const publicKey = await getAsyncStorageValue('publicKey');
      this.setState({
        publicKey: publicKey ?? baseDepositState.publicKey,
      });
    });
  }

  render() {
    return (
      <View style={GlobalStyles.container}>
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
        <View
          style={[
            GlobalStyles.mainSend,
            {justifyContent: 'space-around', alignItems: 'center'},
          ]}>
          <Text style={GlobalStyles.exoTitle}>
            Receive Moonbeam {'\n'}or ERC-20 Tokens
          </Text>
          <QRCodeStyled
            maxSize={Dimensions.get('screen').width * (ratio > 1.7 ? 0.8 : 0.5)}
            data={this.state.publicKey}
            style={[
              {
                backgroundColor: 'white',
                borderRadius: 10,
              },
            ]}
            errorCorrectionLevel="H"
            padding={16}
            //pieceSize={10}
            pieceBorderRadius={4}
            isPiecesGlued
            color={'black'}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: ratio > 1.7 ? 24 : 20,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                width: '85%',
              }}>
              {(this.state.flag
                ? this.state.savingsAccount
                : this.state.publicKey
              ).substring(0, 21) +
                '\n' +
                (this.state.flag
                  ? this.state.savingsAccount
                  : this.state.publicKey
                ).substring(21)}
            </Text>
            <Pressable
              onPress={() => {
                Clipboard.setString(
                  this.state.flag
                    ? this.state.savingsAccount
                    : this.state.publicKey,
                );
                ToastAndroid.show(
                  'Address copied to clipboard',
                  ToastAndroid.LONG,
                );
              }}
              style={{
                width: '15%',
                alignItems: 'flex-start',
              }}>
              <IconIonicons name="copy" size={30} color={'white'} />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: '100%',
            }}>
            <Pressable
              style={[GlobalStyles.buttonStyle]}
              onPress={() => this.props.navigation.goBack()}>
              <Text style={[GlobalStyles.buttonText]}>Return</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }
}

export default DepositWallet;
