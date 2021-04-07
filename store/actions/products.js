import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

import Product from '../../models/product';

export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_PRODUCTS = 'SET_PRODUCTS';

// dispatch function only possible via Redux Thunk
export const fetchProducts = () => {
  return async (dispatch, getState) => {
    const userId = getState().auth.userId;
    try {
      const response = await fetch(
        'https://rn-complete-guide-91950-default-rtdb.firebaseio.com/products.json'
      );

      // If it's NOT within 200 range
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      const resData = await response.json();
      const loadedProducts = [];

      for (const key in resData) {
        loadedProducts.push(
          // as seen on firebase
          new Product(
            key,
            resData[key].ownerId,
            resData[key].ownerPushToken,
            resData[key].title,
            resData[key].imageUrl,
            resData[key].description,
            resData[key].price
          )
        );
      }

      dispatch({
        type: SET_PRODUCTS,
        products: loadedProducts,
        userProducts: loadedProducts.filter((prod) => prod.ownerId === userId),
      });
    } catch (err) {
      // send to custom analytics server
      throw err;
    }
  };
};

export const deleteProduct = (productId) => {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    const response = await fetch(
      `https://rn-complete-guide-91950-default-rtdb.firebaseio.com/products/${productId}.json?auth=${token}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Something went wrong!');
    }

    dispatch({ type: DELETE_PRODUCT, pid: productId });
  };
};

// Now returns a Promise
export const createProduct = (title, description, imageUrl, price) => {
  return async (dispatch, getState) => {
    let pushToken;
    let statusObj = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (statusObj.status !== 'granted') {
      statusObj = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }

    if (statusObj.status !== 'granted') {
      pushToken = null;
    } else {
      // since the async function returns a promise, we should await it
      pushToken = (await Notifications.getExpoPushTokenAsync()).data;
    }

    Notifications.getExpoPushTokenAsync();

    const token = getState().auth.token;
    const userId = getState().auth.userId;
    // use any async code you want!
    // fetch not only GETs the data, but you can also use other HTTP requests
    // DEFAULT method is 'GET'
    const response = await fetch(
      `https://rn-complete-guide-91950-default-rtdb.firebaseio.com/products.json?auth=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't need to POST the 'id' since Firebase does that for us
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          price,
          ownerId: userId,
          ownerPushToken: pushToken,
        }),
      }
    );

    const resData = await response.json();

    // will only be dispatched when the above operations are done
    dispatch({
      type: CREATE_PRODUCT,
      productData: {
        id: resData.name,
        title,
        description,
        imageUrl,
        price,
        ownerId: userId,
        pushToken,
      },
    });
  };
};

export const updateProduct = (id, title, description, imageUrl) => {
  return async (dispatch, getState) => {
    // getState() gives access to the whole redux store, .auth gives access to the 'auth' slice, and .token gives access to the token property IN the auth slice
    const token = getState().auth.token;
    const response = await fetch(
      `https://rn-complete-guide-91950-default-rtdb.firebaseio.com/products/${id}.json?auth=${token}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Something went wrong!');
    }

    dispatch({
      type: UPDATE_PRODUCT,
      pid: id,
      productData: {
        title,
        description,
        imageUrl,
      },
    });
  };
};
