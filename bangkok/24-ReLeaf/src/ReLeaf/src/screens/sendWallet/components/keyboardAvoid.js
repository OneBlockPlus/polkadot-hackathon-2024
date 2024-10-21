import React from 'react';
import {StyleSheet, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
const KeyboardAwareScrollViewComponent = props => {
  return (
    <View style={styles.inner}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        {props.children}
      </KeyboardAwareScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
});
export default KeyboardAwareScrollViewComponent;
