const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");
const isUserInvoice = require("../middleware/is-user-invoice");
const preparePagination = require("../middleware/prepare-pagination");
const router = express.Router();

router.get("/", preparePagination, shopController.getIndex);

router.get("/products", preparePagination, shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postDeleteCartItem);

router.get("/checkout", isAuth, shopController.getCheckout);
router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);
router.get("/checkout/cancel", isAuth, shopController.getCheckout);

router.get("/orders", isAuth, shopController.getOrders);
router.get(
  "/orders/:orderId",
  isAuth,
  isUserInvoice,
  shopController.getInvoice
);

module.exports = router;
