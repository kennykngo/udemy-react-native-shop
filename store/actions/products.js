import Product from '../../models/product';

export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_PRODUCTS = 'SET_PRODUCTS';

// dispatch function only possible via Redux Thunk
export const fetchProducts = () => {
  return async (dispatch) => {
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
          new Product(
            key,
            'u1',
            resData[key].title,
            resData[key].imageUrl,
            resData[key].description,
            resData[key].price
          )
        );
      }

      dispatch({ type: SET_PRODUCTS, products: loadedProducts });
    } catch (err) {
      // send to custom analytics server
      throw err;
    }
  };
};

export const deleteProduct = (productId) => {
  return { type: DELETE_PRODUCT, pid: productId };
};

// Now returns a Promise
export const createProduct = (title, description, imageUrl, price) => {
  return async (dispatch) => {
    // use any async code you want!
    // fetch not only GETs the data, but you can also use other HTTP requests
    // DEFAULT method is 'GET'
    const response = await fetch(
      'https://rn-complete-guide-91950-default-rtdb.firebaseio.com/products.json',
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
        }),
      }
    );

    const resData = await response.json();

    console.log(resData);

    // will only be dispatched when the above operations are done
    dispatch({
      type: CREATE_PRODUCT,
      productData: {
        id: resData.name,
        title,
        description,
        imageUrl,
        price,
      },
    });
  };
};

export const updateProduct = (id, title, description, imageUrl) => {
  return {
    type: UPDATE_PRODUCT,
    pid: id,
    productData: {
      title,
      description,
      imageUrl,
    },
  };
};
