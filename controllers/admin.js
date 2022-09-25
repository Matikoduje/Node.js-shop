const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
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
    userId: req.session.userId, // mongoose z objektu użytkownika automatycznie zapisze _id, można ręcznie dodać ._id
  });

  product
    .save()
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      throw err;
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        product: product,
        pageTitle: "Edit Product",
        path: "/admin/product",
        editing: editMode,
      });
    })
    .catch((err) => {
      throw err;
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
      throw err;
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.findByIdAndDelete(productId)
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      throw err;
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.session.userId})
    // .select('title price')
    // .populate('userId')
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch((err) => {
      throw err;
    });
};
