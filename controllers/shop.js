const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

exports.getProducts = (req, res, next) => {
  Product.find({})
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
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
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.getIndex = (req, res, next) => {
  Product.find({})
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        informationMessages: req.session.flash ? req.flash("information") : [],
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.getCart = (req, res, next) => {
  if (!req.session.userId) {
    return res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: [],
    });
  }

  User.findById(req.session.userId)
    .populate("cart.items.productId")
    .then((user) => {
      return user.cart.items.map((item) => {
        return {
          _id: item.productId._id,
          title: item.productId.title,
          quantity: item.quantity,
        };
      });
    })
    .then((products) => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch();
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((product) => {
      return User.findById(req.session.userId)
        .then((user) => {
          return user.addToCart(product);
        })
        .catch((err) => {
          throw err;
        });
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

  User.findById(req.session.userId)
    .then((user) => {
      return user.deleteItemFromCart(productId);
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      throw err;
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.session.userId })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.postOrder = (req, res, next) => {
  User.findById(req.session.userId)
    .populate("cart.items.productId", "-imageUrl -description -userId")
    .then((user) => {
      return user.createOrder();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      throw err;
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
