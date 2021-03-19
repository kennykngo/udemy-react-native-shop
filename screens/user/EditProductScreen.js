import React, { useCallback, useEffect, useReducer, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useDispatch, useSelector } from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
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
    if (!titleIsValid) {
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
        productActions.updateProduct(prodId, title, description, imageUrl)
      );
    } else {
      dispatch(
        productActions.createProduct(title, description, imageUrl, +price)
      );
      props.navigation.goBack();
    }
    // since we're checking for the titleIsValid, we MUST place it on the dependency array
  }, [dispatch, prodId, title, description, imageUrl, titleIsValid]);

  // makes the submitHandler() retriveable from navigationOptions
  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, [submitHandler]);

  // created a reu
  const textChangeHandler = (inputIdentifier, text) => {
    let isValid = false;
    if (text.trim().length > 0) {
      isValid = true;
    }
    dispatchFormState({
      type: FORM_INPUT_UPDATE,
      value: text,
      isValid,
      // same as the key in the u
      input: inputIdentifier,
    });
  };

  return (
    <ScrollView>
      <View style={styles.form}>
        <View style={styles.formControl}>
          <Text style={styles.label}> Title</Text>
          <TextInput
            style={styles.input}
            value={formState.inputValues.title}
            onChangeText={textChangeHandler.bind(this, 'title')}
            keyboardType='default'
            autoCapitalize='sentences'
            autoCorrect={false}
            returnKeyType='next'
          />
          {!titleIsValid && <Text> Please enter a valid text </Text>}
        </View>
        <View style={styles.formControl}>
          <Text style={styles.label}> Image Url</Text>
          <TextInput
            style={styles.input}
            value={formState.inputValues.imageUrl}
            onChangeText={textChangeHandler.bind(this, 'imageUrl')}
          />
        </View>
        {/* if editedProduct exists, return null instead of price */}
        {editedProduct ? null : (
          <View style={styles.formControl}>
            <Text style={styles.label}> Price </Text>
            <TextInput
              style={styles.input}
              value={formState.inputValues.price}
              onChangeText={textChangeHandler.bind(this, 'price')}
              keyboardType='decimal-pad'
            />
          </View>
        )}
        <View style={styles.formControl}>
          <Text style={styles.label}> Description</Text>
          <TextInput
            style={styles.input}
            value={formState.inputValues.description}
            onChangeText={textChangeHandler.bind(this, 'description')}
          />
        </View>
      </View>
    </ScrollView>
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
  formControl: {
    width: '100%',
  },
  label: {
    fontFamily: 'open-sans-bold',
    marginVertical: 8,
  },
  input: {
    paddingHorizontal: 2,
    paddingVertical: 5,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});

export default EditProductScreen;
