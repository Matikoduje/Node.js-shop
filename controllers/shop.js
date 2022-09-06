const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/product-list", {
      prods: products,
      docTitle: "All Products",
      path: "/products",
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId; // pobiera z url parametr productId, działa to ponieważ w rout zapisałem url product/:productId
  Product.loadProductById(prodId, (product) => {
    res.render("shop/product-detail", {
      product: product,
      docTitle:
        typeof product === "object" ? product.title : "Product dont exist",
      path: "/products",
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/index", {
      prods: products,
      docTitle: "Shop",
      path: "/",
    });
  });
};

exports.getCart = (req, res, next) => {
  Cart.getProducts((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (let product of products) {
        const cartProductData = cart.products.find(
          (prod) => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({
            productData: product,
            quantity: cartProductData.qty,
          });
        }
      }
      res.render("shop/cart", {
        path: "/cart",
        docTitle: "Your Cart",
        products: cartProducts
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.loadProductById(productId, (product) => {
    Cart.addProduct(productId, product.price);
  });
  res.redirect("/cart");
};

exports.postDeleteCartItem = (req, res, next) => {
  const productId = req.body.productId;
  Product.loadProductById(productId, (product) => {
    Cart.deleteProduct(productId, product.price);
    res.redirect('/cart');
  })
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    path: "/orders",
    docTitle: "Your Orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    docTitle: "Checkout",
  });
};
