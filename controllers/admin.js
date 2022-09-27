const Product = require("../models/product");

const errorHandler = require("../helpers/error-handler");
const fileHelper = require("../helpers/file");

const addProductPrepareOldValues = (product) => {
  return {
    title: product ? product.title : "",
    description: product ? product.description : "",
    price: product ? product.price : "",
  };
};

exports.getAddProduct = (req, res, next) => {
  console.log(res.locals);
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    errorMessages: req.flash("error"),
    fieldsErrors: [],
    oldInput: addProductPrepareOldValues(null),
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;

  const imageUrl = image.path;
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    description: description,
    price: price,
    userId: req.session.userId,
  });

  product
    .save()
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      if (err._message === "Product validation failed") {
        req.flash("error", "Can't add new product. Product validation failed.");
        return res.status(500).redirect("add-product");
      }
      return errorHandler(req, res, next, err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/admin/products");
  }
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return res.redirect("/admin/products");
      }
      res.render("admin/edit-product", {
        productId: product._id,
        pageTitle: "Edit Product",
        path: "/admin/product",
        editing: editMode,
        errorMessages: [],
        fieldsErrors: [],
        oldInput: addProductPrepareOldValues(product),
      });
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedDescription = req.body.description;
  const updatedImageUrl = req.file;
  const updatedPrice = req.body.price;

  Product.findById(productId)
    .then((product) => {
      product.title = updatedTitle;
      product.description = updatedDescription;
      if (updatedImageUrl) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = updatedImageUrl.path;
      }
      product.price = updatedPrice;
      return product.save();
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found."));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.findByIdAndDelete(productId);
    })
    .then(() => {
      res.status(200).json({ message: "Success!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting product failed." });
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.session.userId })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        errorMessages: req.flash("errors"),
      });
    })
    .catch((err) => {
      return errorHandler(req, res, next, err);
    });
};
