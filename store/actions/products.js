export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';

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
