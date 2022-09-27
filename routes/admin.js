const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const isProductCreator = require("../middleware/is-product-creator");

const {
  productValidationRules,
  addProductValidate,
} = require("../validators/admin/product-validation-rules");

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post(
  "/add-product",
  isAuth,
  productValidationRules(),
  addProductValidate,
  adminController.postAddProduct
);

router.get(
  "/edit-product/:productId",
  isAuth,
  isProductCreator,
  adminController.getEditProduct
);

router.post(
  "/edit-product",
  isAuth,
  isProductCreator,
  productValidationRules(),
  addProductValidate,
  adminController.postEditProduct
);

router.delete(
  "/product/:productId",
  isAuth,
  isProductCreator,
  adminController.deleteProduct
);
router.get("/products", isAuth, adminController.getProducts);

module.exports = router;
