import AsyncStorage from '@react-native-async-storage/async-storage';
// showing a screen when the app boots up
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

import Colors from '../constants/Colors';
import * as authActions from '../store/actions/auth';

const StartupScreen = (props) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const tryLogin = async () => {
      const userData = await AsyncStorage.getItem('userData');

      // if the userData doesn't exist, then navigate to the Auth screen and return from the function
      if (!userData) {
        props.navigation.navigate('Auth');
        return;
      }

      // Now if the user made it past that, it means that they have an existing account and that we can destructure their data from the transformed data
      const transformedData = JSON.parse(userData);
      const { token, userId, expiryDate } = transformedData;
      const expirationDate = new Date(expiryDate);

      // if expiration date is in the past, the token OR the userId doesn't exist, simply return
      if (expirationDate <= new Date() || !token || !userId) {
        props.navigation.navigate('Auth');
        return;
      }

      // IF it passes both of the above conditionals, that means we do have a userId and a token
      // Simply navigate over to the Shop and the user doesn't need to RE-authenticate
      props.navigation.navigate('Shop');
      dispatch(authActions.authenticate(userId, token));
    };
    tryLogin();
  }, [dispatch]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator size='large' color={Colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StartupScreen;
