const Order = require("../models/order");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = (req, res, next) => {
  const userId = req.session.userId;
  const orderId = req.params.orderId;

  if (!ObjectId.isValid(orderId)) {
    req.flash("errors", "You can't access to this resource.");
    return res.redirect("/orders");
  }

  Order.findOne({ "user.userId": userId, _id: orderId })
    .then((order) => {
      if (!order) {
        req.flash("errors", "You can't access to this resource.");
        return res.redirect("/orders");
      }
      next();
    })
    .catch((err) => {
      throw err;
    });
};
