import React, {Component} from 'react';
import {AppState} from 'react-native';
import ContextModule from './contextModule';
import {navigationHOC} from './navigationHOC';

class AppStateListener extends Component {
  constructor(props) {
    super(props);
    this.listener = AppState.addEventListener(
      'change',
      this._handleAppStateChange,
    );
  }

  static contextType = ContextModule;

  componentDidMount() {}

  componentWillUnmount() {
    this.listener.remove();
  }

  _handleAppStateChange = nextAppState => {
    console.log('nextAppState', nextAppState);
    if (nextAppState === 'background') {
    }
    if (nextAppState === 'active') {
    }
  };

  render() {
    return <></>;
  }
}

export default navigationHOC(AppStateListener);
