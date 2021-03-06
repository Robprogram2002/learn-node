const mongodb = require("mongodb");
const { static } = require("express");
const getDb = require("../util/database").getDb;

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart;
    this._id = id ? mongodb.ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: mongodb.ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: mongodb.ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((elem) => {
      return elem.productId;
    });

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      });
  }

  /* Other options for the getCart method 

  getCart() {
        const productPromises = this.cart.items.map(cartItem => {
            return Product
                    .findById(cartItem.productId)
                    .then(product => {
                        return {...product, quantity: cartItem.quantity};
                    });
        });
        return Promise.all(productPromises).then(products => {
            return products;
        }).catch(console.error);
    }

    ******************************+

    getCart() {
    const db = getDb();
 
    const productIds = [];
    const quantities = {};
 
    this.cart.items.forEach((ele) => {
        let prodId = ele.productId;
 
        productIds.push(prodId);
        quantities[prodId] = ele.quantity;
    });
 
    return db
        .collection('products')
        .find({ _id: { $in: productIds } })
        .toArray()
        .then((products) => {
            return products.map((p) => {
                return { ...p, quantity: quantities[p._id] };
            });
        });
}

*/
  deleteCartItem(productId) {
    const updatedProducts = this.cart.items.filter((elem) => {
      return elem.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: this._id },
        { $set: { cart: { items: updatedProducts } } }
      );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: this._id,
            name: this.username,
            email: this.email,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
      });
  }

  getOrders() {
    const db = getDb();
    return db.collection("orders").find({ "user._id": this._id }).toArray();
  }

  static fetchById(id) {
    const db = getDb();
    return db.collection("users").findOne({ _id: mongodb.ObjectId(id) });
  }
}

module.exports = User;
