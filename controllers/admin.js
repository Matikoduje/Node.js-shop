const Product = require("../models/product");

const addProductPrepareOldValues = (product) => {
  return {
    title: product ? product.title : "",
    imageUrl: product ? product.imageUrl : "",
    description: product ? product.description : "",
    price: product ? product.price : "",
  };
};

exports.getAddProduct = (req, res, next) => {
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
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;

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
      res.status(500).redirect("/500");
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
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedDescription = req.body.description;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;

  Product.findById(productId)
    .then((product) => {
      product.title = updatedTitle;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;
      product.price = updatedPrice;
      return product.save();
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      throw new Error(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.findByIdAndDelete(productId)
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      throw new Error(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.session.userId })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      throw new Error(err);
    });
};
