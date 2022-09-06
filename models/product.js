const fs = require("fs");
const path = require("path");

const Cart = require("./cart");
const mainDirectory = require("../helpers/path");

const productsDataPath = path.join(mainDirectory, "data", "products.json");

const getProductsFromFile = (callback) => {
  fs.readFile(productsDataPath, (err, fileContent) => {
    if (err) {
      callback([]);
    } else {
      callback(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (prod) => prod.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(
          productsDataPath,
          JSON.stringify(updatedProducts),
          (err) => {}
        );
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(productsDataPath, JSON.stringify(products), (err) => {});
      }
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }

  static loadProductById(id, callback) {
    getProductsFromFile((products) => {
      const product = products.find((p) => {
        return p.id === id;
      });
      callback(product);
    });
  }

  static deleteProductById(productId) {
    getProductsFromFile((products) => {
      const productToRemove = products.find((prod) => prod.id === productId);
      // krótszy zapis za pomocą .filter, który zwraca nową tablicę z elementami które spełniają kryterium filtru (funkcja anonimowa)
      const updatedProducts = products.filter((prod) => prod.id !== productId);
      // zapis z użyciem splice do usunięcia produktu z tablicy po indeksie.
      // const existingProductIndex = products.findIndex((prod) => prod.id === productId);
      // const updatedProducts = [...products];
      // updatedProducts.splice(existingProductIndex, 1);
      fs.writeFile(productsDataPath, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(productId, productToRemove.price);
        }
      });
    });
  }
};
