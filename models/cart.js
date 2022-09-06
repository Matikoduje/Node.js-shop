const fs = require("fs");
const path = require("path");

const mainDirectory = require("../helpers/path");
const cartDataPath = path.join(mainDirectory, "data", "cart.json");

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(cartDataPath, (err, fileContent) => {
      let cart = {
        products: [],
        totalPrice: 0,
      };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = { ...existingProduct }; // ten zapis dodaje wszystkie parametry obiektu existing product i go klonuje
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice; // rzutowanie na liczbę poprzez + przed nazwą zmiennej
      fs.writeFile(cartDataPath, JSON.stringify(cart), (err) => {});
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(cartDataPath, (err, fileContent) => {
      if (err) {
        return;
      }
      const cart = JSON.parse(fileContent);
      const updatedCart = { ...cart };
      const product = updatedCart.products.find((prod) => prod.id === id);
      if (!product) {
        return;
      }
      const productQuantity = product.qty;
      updatedCart.products = updatedCart.products.filter(
        (prod) => prod.id !== id
      );
      updatedCart.totalPrice =
        updatedCart.totalPrice - productPrice * productQuantity;
      fs.writeFile(cartDataPath, JSON.stringify(updatedCart), (err) => {});
    });
  }

  static getProducts(callback) {
    fs.readFile(cartDataPath, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        callback(null);
      } else {
        callback(cart);
      }
    });
  }
};
