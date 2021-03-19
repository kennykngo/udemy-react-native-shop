import React, { useCallback, useEffect, useReducer, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useDispatch, useSelector } from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
import Input from '../../components/UI/Input';
import * as productActions from '../../store/actions/products';

const FORM_INPUT_UPDATE = 'UPDATE';

// built outside of the function to avoid rerenders
const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      // dynamically store the keys and dynamically change the values
      // Ex. input - 'title', then storing it in the action's values
      [action.input]: action.value,
    };
    // first store the inputValidities EXISTING values
    const updatedValidities = {
      ...state.updatedValidities,
      [action.input]: action.isValid,
    };

    let updatedFormIsValid = true;
    // checks if ANY one of the updatedValidities[key] is false, it'll automatically override the updatedFormIsValid variable
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }

    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues,
    };
  }
  return state;
};

const EditProductScreen = (props) => {
  // first, take the productId (from editProductHandler of UserProductsScreen)
  const prodId = props.navigation.getParam('productId');
  // Take a slice of the state from the products state and take the .userProducts and see if the prodId matches that id
  const editedProduct = useSelector((state) =>
    state.products.userProducts.find((prod) => prodId === prod.id)
  );

  const dispatch = useDispatch();
  // useReducer takes in the reducer() function AND takes an optional second argument about the initial state
  // This ALSO takes an array that can be distructured

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      title: editedProduct ? editedProduct.title : '',
      imageUrl: editedProduct ? editedProduct.imageUrl : '',
      description: editedProduct ? editedProduct.description : '',
      price: editedProduct ? editedProduct.price : '',
    },
    inputValidities: {
      title: editedProduct ? true : false,
      imageUrl: editedProduct ? true : false,
      description: editedProduct ? true : false,
      price: editedProduct ? true : false,
    },
    formIsValid: editedProduct ? true : false,
  });

  // if that slice of state exists, then we want to pre-populate the value input OR place an empty string

  const submitHandler = useCallback(() => {
    if (!formState.formIsValid) {
      Alert.alert('Wrong Input!', 'Please check the errors in the form.', [
        {
          text: 'Okay',
        },
      ]);
      return;
    }
    // if we're not editing the product, we're adding
    if (editedProduct) {
      dispatch(
        productActions.updateProduct(
          prodId,
          formState.inputValues.title,
          formState.inputValues.description,
          formState.inputValues.imageUrl
        )
      );
      props.navigation.goBack();
    } else {
      dispatch(
        productActions.createProduct(
          formState.inputValues.title,
          formState.inputValues.description,
          formState.inputValues.imageUrl,
          +formState.inputValues.price
        )
      );
      props.navigation.goBack();
    }
    // since we're checking for the titleIsValid, we MUST place it on the dependency array
  }, [dispatch, prodId, formState]);

  // makes the submitHandler() retriveable from navigationOptions
  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, [submitHandler]);

  // created a reu
  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier,
      });
    },
    [dispatchFormState]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior='padding'
      keyboardVerticalOffset={100}
    >
      <ScrollView>
        <View style={styles.form}>
          <Input
            id='title'
            label='Title'
            errorText='Please enter a valid title!'
            keyboardType='default'
            autoCapitalize='sentences'
            autoCorrect={false}
            returnKeyType='next'
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.title : ''}
            initallyValid={!!editedProduct}
            required
          />
          <Input
            id='imageUrl'
            label='ImageUrl'
            errorText='Please enter a valid imageUrl!'
            keyboardType='default'
            returnKeyType='next'
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.title : ''}
            initallyValid={!!editedProduct}
            required
          />
          {/* if editedProduct exists, return null instead of price */}
          {editedProduct ? null : (
            <Input
              id='price'
              label='Price'
              errorText='Please enter a valid price!'
              keyboardType='decimal-pad'
              onInputChange={inputChangeHandler}
              returnKeyType='next'
              required
              min={0}
            />
          )}
          <Input
            id='description'
            label='Description'
            errorText='Please enter a valid description'
            keyboardType='default'
            returnKeyType='next'
            multiline
            numberOfLines={3}
            autoCapitalize='sentences'
            autoCorrect
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.title : ''}
            initallyValid={!!editedProduct}
            required
            minLength={5}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

EditProductScreen.navigationOptions = (navData) => {
  const submitFunction = navData.navigation.getParam('submit');

  return {
    headerTitle: navData.navigation.getParam('productId')
      ? 'Edit Product'
      : 'Add Product',
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title='Add'
          iconName={
            Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'
          }
          onPress={submitFunction}
        />
      </HeaderButtons>
    ),
  };
};

const styles = StyleSheet.create({
  form: {
    margin: 20,
  },
});

export default EditProductScreen;
