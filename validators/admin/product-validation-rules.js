const { check, checkSchema, validationResult } = require("express-validator");

const prepareRenderParams = (req, extractedErrors, fieldsErrors) => {
  const preparedParams = {
    pageTitle: req.body.productId ? "Edit Product" : "Add Product",
    path: req.body.productId ? "/admin/product" : "/admin/add-product",
    editing: req.body.productId ? true : false,
    errorMessages: extractedErrors,
    fieldsErrors: fieldsErrors,
    oldInput: {
      title: req.body.title,
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
    check("title", "Title should not be empty.")
      .trim()
      .notEmpty()
      .bail()
      .escape(),
    check("description", "Description should not be empty.")
      .trim()
      .notEmpty()
      .bail()
      .isLength({ min: 5, max: 400 })
      .escape(),
    check("price", "Price should not be empty.")
      .trim()
      .notEmpty()
      .bail()
      .isFloat(),
    checkSchema({
      productImage: {
        custom: {
          options: (value, { req, path }) => {
            return !!req.file.path;
          },
          errorMessage: "You should upload a JPG or PNG image.",
        },
      },
    }),
  ];
};

const addProductValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (req.body.productId) {
    errors.errors = errors.errors.filter((el) => {
      return el.param != "productImage";
    });
  }

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
