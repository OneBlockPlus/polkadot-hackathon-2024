import {useNavigation} from '@react-navigation/native';
import React from 'react';

export const navigationHOC = Component => {
  return props => {
    const navigation = useNavigation();
    return <Component navigation={navigation} {...props} />;
  };
};
