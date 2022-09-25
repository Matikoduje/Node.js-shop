const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const isAuth = require('../middleware/is-auth');
const isProductCreator = require('../middleware/is-product-creator');

router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", isAuth, adminController.postAddProduct);

router.get("/edit-product/:productId", isAuth, isProductCreator, adminController.getEditProduct);
router.post("/edit-product", isAuth, isProductCreator, adminController.postEditProduct);

router.post("/delete-product", isAuth, isProductCreator, adminController.postDeleteProduct);
router.get("/products", isAuth, adminController.getProducts);

module.exports = router;
