const Product = require('../models/product');

module.exports = (req, res, next) => {
  const userId = req.session.userId;
  let productId;

  if (typeof req.body.productId !== 'undefined') {
    productId = req.body.productId;
  } else {
    productId = req.params.productId;
  }

  Product.findOne({userId: userId, _id: productId}).then(product => {
    if (!product) {
      return res.redirect("/admin/products");
    }
    next();
  }).catch(err => {
    throw err;
  });
};
