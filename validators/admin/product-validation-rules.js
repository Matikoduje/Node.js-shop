const { body, validationResult } = require("express-validator");

const prepareRenderParams = (req, extractedErrors, fieldsErrors) => {
  const preparedParams = {
    pageTitle: req.body.productId ? "Edit Product" : "Add Product",
    path: req.body.productId ? "/admin/product" : "/admin/add-product",
    editing: req.body.productId ? true : false,
    errorMessages: extractedErrors,
    fieldsErrors: fieldsErrors,
    oldInput: {
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      description: req.body.description,
      price: req.body.price,
    },
  };

  if (req.body.productId) {
    preparedParams.productId = req.body.productId;
  }
  return preparedParams;
};

const productValidationRules = () => {
  return [
    body("title", "Title should not be empty.")
      .trim()
      .notEmpty()
      .bail()
      .escape(),
    body("description", "Description should not be empty.")
      .trim()
      .notEmpty()
      .bail()
      .isLength({ min: 5, max: 400 })
      .escape(),
    body("price", "Price should not be empty.")
      .trim()
      .notEmpty()
      .bail()
      .isFloat(),
    body("imageUrl", "Image URL should not be empty.")
      .trim()
      .notEmpty()
      .bail()
      .isURL()
      .withMessage("Provide valid URL address."),
  ];
};

const addProductValidate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  const fieldsErrors = [];
  errors.array().map((err) => extractedErrors.push(err.msg));
  errors.array().map((err) => fieldsErrors.push(err.param));

  return res
    .status(422)
    .render(
      "admin/edit-product",
      prepareRenderParams(req, extractedErrors, fieldsErrors)
    );
};

module.exports = {
  productValidationRules,
  addProductValidate,
};
