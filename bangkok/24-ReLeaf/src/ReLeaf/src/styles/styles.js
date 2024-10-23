import {Dimensions, StatusBar, StyleSheet} from 'react-native';
import {Platform} from 'react-native';

const OsVer = Platform.constants['Release'];
const screenHeight = Dimensions.get('screen').height;
const windowHeight = Dimensions.get('window').height;

let GlobalStyles;
let header;
let footer;
let main;
let ratio;
let StatusBarHeight;
let NavigatorBarHeight;
let iconSize;
let mainColor = '#1bf085';
let backgroundColor = '#15272c';

if (OsVer.split('.')[0] >= 8) {
  header = 70;
  footer = 60;
  main = Dimensions.get('window').height - (header + footer);
  ratio = Dimensions.get('window').height / Dimensions.get('window').width;
  StatusBarHeight = StatusBar.currentHeight;
  NavigatorBarHeight = screenHeight - windowHeight;
  iconSize = Math.round(footer / 2.6);
  GlobalStyles = StyleSheet.create({
    // Globals Layout
    container: {
      flex: 1,
      width: Dimensions.get('window').width,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor,
    },
    containerSafe: {
      flex: 1,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor,
    },
    containerSafe2: {
      backgroundColor,
    },
    header: {
      height: header,
      width: Dimensions.get('window').width,
    },
    main: {
      height: main,
      width: Dimensions.get('window').width,
    },
    mainSend: {
      height: main,
      width: Dimensions.get('window').width,
      marginTop: header,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mainComplete: {
      height: '100%',
    },
    footer: {
      width: Dimensions.get('window').width,
      height: footer,
    },
    // General text
    title: {
      fontSize: ratio > 1.7 ? 32 : 26,
      color: '#fff',
      textAlign: 'center',
      fontFamily: 'Exo2-Bold',
    },
    description: {
      fontWeight: 'bold',
      fontSize: ratio > 1.7 ? 18 : 14,
      textAlign: 'center',
      color: '#3d7180',
    },
    formTitle: {
      color: 'white',
      textAlign: 'left',
      textAlignVertical: 'center',
      fontFamily: 'Exo2-Bold',
      fontSize: 24,
    },
    exoTitle: {
      color: 'white',
      textAlign: 'center',
      textAlignVertical: 'center',
      fontFamily: 'Exo2-Bold',
      fontSize: 24,
    },
    // Globals Buttons
    buttonStyle: {
      backgroundColor: mainColor,
      borderRadius: 50,
      padding: 10,
      width: Dimensions.get('window').width * 0.9,
      alignItems: 'center',
      borderColor: 'black',
      borderWidth: 2,
    },
    buttonStyleDot: {
      backgroundColor: mainColor,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: 'black',
      borderWidth: 2,
      marginBottom: 20,
    },
    buttonText: {
      color: 'white',
      fontSize: 24,
      fontFamily: 'Exo2-Bold',
    },
    buttonLogoutStyle: {
      backgroundColor: mainColor,
      borderRadius: 50,
      padding: 10,
      width: Dimensions.get('window').width * 0.2,
      alignItems: 'center',
      borderColor: 'black',
      borderWidth: 2,
    },
    singleButton: {
      backgroundColor: mainColor,
      borderRadius: 50,
      width: ratio > 1.7 ? 60 : 50,
      height: ratio > 1.7 ? 60 : 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    singleButtonText: {
      color: 'white',
      textAlign: 'center',
      textAlignVertical: 'center',
      fontFamily: 'Exo2-Regular',
    },
    // Selectors
    selector: {
      width: Dimensions.get('window').width * 0.3333,
      height: 'auto',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectorText: {
      fontSize: 14,
      color: 'white',
      textAlign: 'center',
      fontFamily: 'Exo2-Regular',
    },
    selectorSelectedText: {
      fontSize: 14,
      color: mainColor,
      textAlign: 'center',
      fontFamily: 'Exo2-Regular',
    },
    // Main Modifiers
    headerMain: {
      height: header,
      width: Dimensions.get('window').width,
      borderBottomWidth: 1,
      borderBottomColor: mainColor,
      position: 'absolute',
      top: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerItem: {
      width: Dimensions.get('window').width / 2,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTextButton: {
      color: 'white',
      fontSize: 18,
      fontFamily: 'Exo2-Bold',
    },
    footerMain: {
      width: Dimensions.get('window').width,
      height: footer,
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: mainColor,
    },
    balanceContainer: {
      display: 'flex',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      height: ratio > 1.7 ? main * 0.4 : main * 0.45,
    },
    tokensContainer: {
      height: ratio > 1.7 ? main * 0.6 : main * 0.55,
      marginBottom: 0,
    },
    // Tab 2
    tab2Container: {
      width: '100%',
      marginBottom: StatusBarHeight,
    },
    tab2ScrollContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 'auto',
    },
    // Networks
    networkShow: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '90%',
      height: 60,
      backgroundColor: '#555555',
      borderRadius: 10,
      marginVertical: 10,
    },
    network: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '90%',
      height: 60,
      backgroundColor: '#555555',
      borderRadius: 10,
      marginVertical: 10,
    },
    // Send Styles
    input: {
      borderRadius: 5,
      width: '90%',
      borderColor: mainColor,
      borderWidth: 2,
      color: 'black',
      backgroundColor: 'white',
      justifyContent: 'center',
      alignContent: 'center',
      alignSelf: 'center',
      textAlign: 'center',
      fontSize: 24,
      height: 50,
      marginBottom: 20,
      marginTop: 20,
    },
    // Modal
    singleModalButton: {
      backgroundColor: mainColor,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    singleModalButtonText: {
      fontSize: 24,
      color: 'white',
      marginVertical: 10,
    },
    // Savings Styles
    titleSaves: {
      fontSize: 18,
      color: '#fff',
      textAlignVertical: 'center',
      fontFamily: 'Exo2-Bold',
    },
  });
} else {
  header = 70;
  footer = 60;
  main =
    Dimensions.get('window').height -
    (header + footer + StatusBar.currentHeight);
  ratio = Dimensions.get('window').height / Dimensions.get('window').width;
  StatusBarHeight = StatusBar.currentHeight;
  NavigatorBarHeight = screenHeight - windowHeight;
  iconSize = Math.round(footer / 2.6);

  GlobalStyles = StyleSheet.create({
    // Globals Layout
    container: {
      flex: 1,
      width: Dimensions.get('window').width,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor,
    },
    containerSafe: {
      flex: 1,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor,
    },
    containerSafe2: {
      backgroundColor,
    },
    header: {
      height: header,
      width: Dimensions.get('window').width,
    },
    main: {
      height: main,
      width: Dimensions.get('window').width,
    },
    mainSend: {
      height: main,
      width: Dimensions.get('window').width,
      marginTop: header,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mainComplete: {
      height: '100%',
    },
    footer: {
      width: Dimensions.get('window').width,
      height: footer,
    },
    // General text
    title: {
      fontSize: ratio > 1.7 ? 32 : 26,
      color: '#fff',
      textAlign: 'center',
      fontFamily: 'Exo2-Bold',
    },
    description: {
      fontWeight: 'bold',
      fontSize: ratio > 1.7 ? 18 : 14,
      textAlign: 'center',
      color: '#3d7180',
    },
    formTitle: {
      color: 'white',
      textAlign: 'left',
      textAlignVertical: 'center',
      fontFamily: 'Exo2-Bold',
      fontSize: 24,
    },
    exoTitle: {
      color: 'white',
      textAlign: 'center',
      textAlignVertical: 'center',
      fontFamily: 'Exo2-Bold',
      fontSize: 24,
    },
    // Globals Buttons
    buttonStyle: {
      backgroundColor: mainColor,
      borderRadius: 50,
      padding: 10,
      width: Dimensions.get('window').width * 0.9,
      alignItems: 'center',
      borderColor: 'black',
      borderWidth: 2,
    },
    buttonStyleDot: {
      backgroundColor: mainColor,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: 'black',
      borderWidth: 2,
      marginBottom: 20,
    },
    buttonText: {
      color: 'white',
      fontSize: 24,
      fontFamily: 'Exo2-Bold',
    },
    buttonLogoutStyle: {
      backgroundColor: mainColor,
      borderRadius: 50,
      padding: 10,
      width: Dimensions.get('window').width * 0.2,
      alignItems: 'center',
      borderColor: 'black',
      borderWidth: 2,
    },
    singleButton: {
      backgroundColor: mainColor,
      borderRadius: 50,
      width: ratio > 1.7 ? 60 : 50,
      height: ratio > 1.7 ? 60 : 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    singleButtonText: {
      color: 'white',
      textAlign: 'center',
      textAlignVertical: 'center',
      fontFamily: 'Exo2-Regular',
    },
    // Selectors
    selector: {
      width: Dimensions.get('window').width * 0.3333,
      height: 'auto',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectorText: {
      fontSize: 14,
      color: 'white',
      textAlign: 'center',
      fontFamily: 'Exo2-Regular',
    },
    selectorSelectedText: {
      fontSize: 14,
      color: mainColor,
      textAlign: 'center',
      fontFamily: 'Exo2-Regular',
    },
    // Main Modifiers
    headerMain: {
      height: header,
      width: Dimensions.get('window').width,
      borderBottomWidth: 1,
      borderBottomColor: mainColor,
      position: 'absolute',
      top: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center',
    },
    headerItem: {
      width: Dimensions.get('window').width / 2,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTextButton: {
      color: 'white',
      fontSize: 18,
      fontFamily: 'Exo2-Bold',
    },
    footerMain: {
      width: Dimensions.get('window').width,
      height: footer,
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: mainColor,
    },
    balanceContainer: {
      display: 'flex',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      height: ratio > 1.7 ? main * 0.4 : main * 0.45,
    },
    tokensContainer: {
      height: ratio > 1.7 ? main * 0.6 : main * 0.55,
      marginBottom: 0,
    },
    // Tab 2
    tab2Container: {
      width: '100%',
      marginBottom: StatusBarHeight,
    },
    tab2ScrollContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 'auto',
    },
    // Networks
    networkShow: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '90%',
      height: 60,
      backgroundColor: '#555555',
      borderRadius: 10,
      marginVertical: 10,
    },
    network: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '90%',
      height: 60,
      backgroundColor: '#555555',
      borderRadius: 10,
      marginVertical: 10,
    },
    // Send Styles
    input: {
      borderRadius: 5,
      width: '90%',
      borderColor: mainColor,
      borderWidth: 2,
      color: 'black',
      backgroundColor: 'white',
      justifyContent: 'center',
      alignContent: 'center',
      alignSelf: 'center',
      textAlign: 'center',
      fontSize: 24,
      height: 50,
      marginBottom: 20,
      marginTop: 20,
    },
    // Modal
    singleModalButton: {
      backgroundColor: mainColor,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    singleModalButtonText: {
      fontSize: 24,
      color: 'white',
      marginVertical: 10,
    },
    // Savings Styles
    titleSaves: {
      fontSize: 18,
      color: '#fff',
      textAlignVertical: 'center',
      fontFamily: 'Exo2-Bold',
    },
  });
}

export default GlobalStyles;
export {
  header,
  footer,
  main,
  ratio,
  StatusBarHeight,
  NavigatorBarHeight,
  iconSize,
  mainColor,
  backgroundColor,
};
