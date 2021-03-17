import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { useSelector } from 'react-redux';

const ProductsOverviewScreen = (props) => {
  // state.products -> from App.js
  // .availableProducts -> default state from /reducers/products.js
  const products = useSelector((state) => state.products.availableProducts);

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={(itemData) => {
        return <Text> {itemData.item.title} </Text>;
      }}
    />
  );
};

const styles = StyleSheet.create({});

export default ProductsOverviewScreen;
