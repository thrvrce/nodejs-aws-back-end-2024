'use strict';
const productsMock = [
  {
    "count": 4,
    "description": "Short Product Description1",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    "price": 300,
    "title": "Intel CPU",
    imageUrl: 'https://images.unsplash.com/photo-1540829917886-91ab031b1764?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aW50ZWx8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    "count": 6,
    "description": "Short Product Description3",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a0",
    "price": 250,
    "title": "AMD CPU",
    imageUrl: 'https://images.unsplash.com/photo-1568209865332-a15790aed756?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YW1kfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    "count": 7,
    "description": "Short Product Description2",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
    "price": 170,
    "title": "Motherboard",
    imageUrl: 'https://images.unsplash.com/photo-1522920192563-6df902920a8a?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YXN1cyUyMG1vdGhlcmJvYXJkfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    "count": 12,
    "description": "Short Product Description7",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    "price": 100,
    "title": "RAM",
    imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cmFtfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    "count": 7,
    "description": "Short Product Description2",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    "price": 100,
    "title": "SSD",
    imageUrl: 'https://images.unsplash.com/photo-1615293889204-6db03c596147?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8c3NkfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    "count": 8,
    "description": "Short Product Description4",
    "id": "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    "price": 1000,
    "title": "Videocard",
    imageUrl: 'https://media.istockphoto.com/photos/graphic-card-picture-id185249594?b=1&k=20&m=185249594&s=170667a&w=0&h=WS7GN92b8zbyod8sOUdjk_ZlN9kgPls0MnjrGb4K708='
  },
  {
    "count": 2,
    "description": "Short Product Descriptio1",
    "id": "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    "price": 50,
    "title": "Mouse",
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8bW91c2V8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    "count": 3,
    "description": "Short Product Description7",
    "id": "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    "price": 40,
    "title": "Keyboard",
    imageUrl: 'https://images.unsplash.com/photo-1584727129739-cd30984745bc?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8a2V5Ym9hcmQlMjBhbmQlMjBtb3VzZXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
]

const getProductsById = async (event) => {
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}
  try {
    const { productId = '' } = event.pathParameters;
    const searchedProduct = productsMock.find((product) => product.id === productId);
    return {
      headers,
      statusCode: 200,
      body: JSON.stringify(
        {
          message: searchedProduct ? 'product was founded' : 'product was not founded',
          searchedProduct
        }
      ),
    };

  } catch ({message}) {
    return {
      headers,
      statusCode: 400,
      body: JSON.stringify({ message})
      }
  }

  };

module.exports.getProductsById = getProductsById;
