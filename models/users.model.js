/*//->Using During Sequelize<-//
const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    name:Sequelize.STRING,
    email:{
        type:Sequelize.STRING,
        unique:true
    }
});

module.exports = User;
*/

/*//->Using During Mongodb<-//
const mongodb = require("mongodb");
const db = require("../util/database").getDB;

class User {
  constructor(_id, name, email, cart = { items: [], totalAmount: 0 }) {
    this._id = _id;
    this.name = name;
    this.email = email;
    this.cart = cart;
  }

  save() {
    return db()
      .collection("users")
      .insertOne(this)
      .catch((err) => console.log("error in creae user :", err));
  }

  addToCart(productId) {
    let index = this.cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (index >= 0) {
      this.cart.items[index].quantity++;
    } else {
      this.cart.items.push({
        productId: new mongodb.ObjectId(productId),
        quantity: 1,
      });
    }

    return db()
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: this.cart } }
      );
  }

  getCart() {
    const productIds = this.cart.items.map((item) => item.productId);

    return db()
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((pro) => {
          return {
            ...pro,
            quantity: this.cart.items.find(
              (p) => pro._id.toString() === p.productId.toString()
            ).quantity,
          };
        });
      });
  }

  deleteFromCart(productId) {
    this.cart.items = this.cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    return db()
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: this.cart } }
      );
  }

  decreaseCartItem(productId) {
    let index = this.cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (index >= 0) {
      this.cart.items[index].quantity--;
      if (this.cart.items[index].quantity == 0) {
        return this.deleteFromCart(productId);
      }

      return db()
        .collection("users")
        .updateOne(
          { _id: new mongodb.ObjectId(this._id) },
          { $set: { cart: this.cart } }
        );
    }
  }

  addOrder() {
    return this.getCart()
      .then((products) => {
        let order = {
          userId: this._id,
          items: products,
        };
        return order;
      })
      .then((order) => {
        db().collection("orders").insertOne(order);
      })
      .then((result) => {
        return db()
          .collection("users")
          .updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  getOrders() {
    return db()
      .collection("orders")
      .find({ userId: new mongodb.ObjectId(this._id) })
      .toArray();
  }

  static fetchOne(id) {
    return db()
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(id) })
      .catch((err) => console.log("error in fetch user :", err));
  }
}

module.exports = User;*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password:{
    type: String,
    required: true,
  },
  resetoken:String,
  resetTokenExpiraion:Date,
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (productId) {
  //this refer to our schema
  let index = this.cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );

  if (index >= 0) {
    this.cart.items[index].quantity++;
  } else {
    this.cart.items.push({
      productId: productId,
      quantity: 1,
    });
  }

  return this.save();
};

userSchema.methods.deleteFromCart = function (productId) {
  this.cart.items = this.cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  return this.save();
};

userSchema.methods.decreaseCartItem = function (productId) {
  let index = this.cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );

  if (index >= 0) {
    this.cart.items[index].quantity--;
    if (this.cart.items[index].quantity == 0) {
      return this.deleteFromCart(productId);
    }

    return this.save();
  }
};

module.exports = mongoose.model("User", userSchema);
