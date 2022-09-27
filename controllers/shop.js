const fs = require("fs");
const path = require("path");
const { stripeSecret } = require("../configuration/dev-env-setup");
const stripe = require("stripe")(stripeSecret);

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

const errorHandler = require("../helpers/error-handler");

const prepareShopProductsParams = (req, res, isIndex, products) => {
  return {
    products,
    totalProducts: res.locals.totalProducts,
    hasNextPage: res.locals.hasNextPage,
    hasPreviousPage: res.locals.hasPreviousPage,
    currentPage: res.locals.currentPage,
    nextPage: res.locals.nextPage,
    previousPage: res.locals.previousPage,
    lastPage: res.locals.lastPage,
    pageTitle: isIndex ? "Shop" : "All Products",
    path: isIndex ? "/" : "/products",
    informationMessages: req.session.flash ? req.flash("information") : [],
  };
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  const itemsPerPage = res.locals.itemsPerPage;

  Product.find({})
    .skip((page - 1) * itemsPerPage)
    .limit(itemsPerPage)
    .then((products) => {
      res.render(
        "shop/product-list",
        prepareShopProductsParams(req, res, false, products)
      );
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  const itemsPerPage = res.locals.itemsPerPage;
  // * We set param into skip() to skip first X element from database
  // * limit() set how many elements should be load from DB

  Product.find()
    .skip((page - 1) * itemsPerPage)
    .limit(itemsPerPage)
    .then((products) => {
      res.render(
        "shop/index",
        prepareShopProductsParams(req, res, true, products)
      );
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
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
          return errorHandler(req, res, next, err);
        });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
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
      return errorHandler(req, res, next, err);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.session.userId })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders,
        errorMessages: req.flash("errors"),
      });
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join("private", "invoices", invoiceName);

  // ? Properly share file with user. By stream. ------------------

  const file = fs.createReadStream(invoicePath);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'inline; filename="' + invoiceName + '"'
  );
  file.pipe(res);

  /** Example of share file with user by preload into memory all data.
   * ! Avoid this solution in production. -------------------------
  fs.readFile(invoicePath, (err, data) => {
    if (err) {
      next(err);
    }
    );
    res.send(data);
  });
  */
};

exports.getCheckoutSuccess = (req, res, next) => {
  User.findById(req.session.userId)
    .populate("cart.items.productId", "-imageUrl -description -userId")
    .then((user) => {
      return user.createOrder();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};

exports.getCheckout = (req, res, next) => {
  let total = 0;
  let products;

  User.findById(req.session.userId)
    .populate("cart.items.productId")
    .then((user) => {
      return user.cart.items.map((item) => {
        return {
          _id: item.productId._id,
          title: item.productId.title,
          quantity: item.quantity,
          price: item.productId.price,
          description: item.productId.description,
        };
      });
    })
    .then((orderProducts) => {
      orderProducts.forEach((orderProduct) => {
        total += orderProduct.quantity * orderProduct.price;
      });
      products = orderProducts;
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            price_data: {
              unit_amount: p.price * 100,
              currency: "usd",
              product_data: {
                name: p.title,
                description: p.description,
              },
            },
            quantity: p.quantity,
          };
        }),
        mode: "payment",
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch();
};
