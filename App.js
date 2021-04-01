import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import authReducer from './store/reducers/auth';
import ReduxThunk from 'redux-thunk';

import ShopNavigator from './navigation/ShopNavigator';
import cartReducer from './store/reducers/cart';
import ordersReducer from './store/reducers/orders';
// import { composeWithDevTools } from 'redux-devtools-extension';

import productsReducer from './store/reducers/products';

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
  auth: authReducer,
});

const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

const fetchFonts = () => {
  return Font.loadAsync({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
  });
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => {
          setFontLoaded(true);
        }}
        onError={console.warn()}
      />
    );
  }
  7;

  return (
    <Provider store={store}>
      <ShopNavigator />
    </Provider>
  );
}
