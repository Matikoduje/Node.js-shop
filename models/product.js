const db = require("../helpers/database");

const Cart = require("./cart");

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    let insertQuery = "INSERT INTO products (title, imageUrl, description, price) VALUES (?,?,?,?)"
    return db.execute(insertQuery, [this.title, this.imageUrl, this.description, this.price]);
  }

  static fetchAll() {
    return db.execute("SELECT * FROM products"); // zwracamy promise by obsłużyć go w kontrolerze
  }

  static loadProductById(id) {
    return db.execute("SELECT * FROM products WHERE id=?", [id]);
  }

  static deleteProductById(productId) {}
};
