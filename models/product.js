const mongoDb = require("mongodb");
const getDb = require("../helpers/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, productId, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.userId = userId;
    if (productId) {
      this._id = new mongoDb.ObjectId(productId);
    }
  }

  save() {
    const db = getDb();
    let dbOperation;

    if (this._id) {
      // Edycja
      dbOperation = db.collection("products").updateOne(
        {
          _id: this._id,
        },
        {
          $set: this,
        }
      );
    } else {
      // Zapis
      dbOperation = db.collection("products").insertOne(this);
    }

    return dbOperation.then().catch((err) => {
      throw err;
    });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((err) => {
        throw err;
      });
  }

  static findById(productId) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new mongoDb.ObjectId(productId) })
      .next()
      .then((product) => {
        return product;
      })
      .catch((err) => {
        throw err;
      });
  }

  static deleteProduct(productId) {
    const db = getDb();

    return db
      .collection("products")
      .deleteOne({ _id: new mongoDb.ObjectId(productId) })
      .then()
      .catch((err) => {
        throw err;
      });
  }
}

module.exports = Product;
