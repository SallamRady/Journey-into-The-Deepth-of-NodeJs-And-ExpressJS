/*//-> working with sql <-//
const db = require('../util/database');

class Product {
  constructor(data) {
    this.title = data.title;
    this.price = data.price;
    this.imgeUrl = 'image/url';
    this.description = data.description;
    this.creaedAt = '2022-12-23 09:37:18';
    this.updatedAt = '2022-12-23 09:37:18';
    this.userId = '101';
  }

  save() {
    return db.execute('INSERT INTO products (name,price,imageUrl,description,createdAt,userId,updatedAt) VALUES (?,?,?,?,?,?,?)',
    [this.title,this.price,this.imgeUrl,this.description,this.creaedAt,null,this.updatedAt]
    );
  }

  static updateOne(id, data) {
    let { title, price, description } = data;
    for (const product of products) {
      if (product.id === id) {
        product.title = title;
        product.price = price;
        product.description = description;
        return true;
      }
    }
    return false;
  }

  static deleteOne(id) {
    let index = 0;
    for (const product of products) {
      if (product.id === id) {
        break;
      }
      index++;
    }
    if(index == products.length)
      return false;
    
    products.splice(index,1);
  }

  static findOne(id) {
    return db.execute('SELECT * FROM products WHERE products.ID = ?',[id]);
  }

  static findAll() {
    return db.execute('SELECT * FROM products');
  }
}

module.exports = Product;
*/

/*//-> working with sequelize <-//
const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Product = sequelize.define('product',{
  id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true
  },
  title:{
    type:Sequelize.STRING,
    allowNull:false
  },
  price:{
    type:Sequelize.DOUBLE,
    allowNull:false
  },
  description:{
    type:Sequelize.STRING
  }
});

module.exports = Product;
*/

/*//-> working with Mongodb <-//
const mongodb = require("mongodb");
const db = require("../util/database").getDB;

class Product {

  constructor(title, price, description,userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.userId = userId;
  }

  save() {
    return db()
      .collection("products")
      .insertOne(this)
      .catch((err) => console.log("error in create product :", err));
  }

  static fetchAll() {
    return db()
      .collection("products")
      .find()
      .toArray()
      .catch((err) => console.log("error in fetch products :", err));
  }

  static fetchOne(id) {
    return db()
      .collection("products")
      .findOne({ _id: new mongodb.ObjectId(id) })
      .then((product) => {
        return product;
      })
      .catch((err) => {
        console.log("error in fetch product :", err);
      });
  }

  static editOne(id, data) {
    let { title, price, description } = data;
    return db()
      .collection("products")
      .updateOne(
        { _id: new mongodb.ObjectId(id) },
        { $set: { title, price, description } }
      )
      .then((result) => {
        return Product.fetchOne(id);
      })
      .catch((err) => console.log("error in update product :", err));
  }

  static destroy(id) {
    return db()
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(id) })
      .catch((err) => console.log("error in delete product :", err));
  }
  
}

module.exports = Product;
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image:{type:String},
  userId:{
    type:mongoose.Types.ObjectId,
    ref:'User',
    required:true
  }
});

module.exports = mongoose.model("Product", productSchema);
