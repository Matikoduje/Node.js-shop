const Product = require("../models/product");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = (req, res, next) => {
  const userId = req.session.userId;
  let productId;

  if (typeof req.body.productId !== "undefined") {
    productId = req.body.productId;
  } else {
    productId = req.params.productId;
  }

  if (!ObjectId.isValid(productId)) {
    req.flash("errors", "You can't access to this resource.");
    return res.redirect("/admin/products");
  }

  Product.findOne({ userId: userId, _id: productId })
    .then((product) => {
      if (!product) {
        req.flash("errors", "You can't access to this resource.");
        return res.redirect("/admin/products");
      }
      next();
    })
    .catch((err) => {
      throw err;
    });
};
