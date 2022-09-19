const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        docTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        docTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        docTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        path: "/cart",
        docTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      req.user.addToCart(product);
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      throw err;
    });
};

exports.postDeleteCartItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeCartItem(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      throw err;
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        docTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then((result) => res.redirect("/orders"))
    .catch((err) => {
      throw err;
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    docTitle: "Checkout",
  });
};
