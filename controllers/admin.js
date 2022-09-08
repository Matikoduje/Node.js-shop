const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    docTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;

  // magiczna metoda sequealizera, generowane są na bazie relacji pomiędzy tabelami. I tak przy belongTo lub
  // hasMany user posiada metodę createProduct
  req.user
    .createProduct({
      description: description,
      imageUrl: imageUrl,
      price: price,
      title: title,
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // wczytuje dane dołączone jako query do ścieżki. Po ?zmienna=wartość
  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;
  Product.findByPk(productId)
    .then((product) => {
      res.render("admin/edit-product", {
        product: product,
        docTitle: "Edit Product",
        path: "/admin/products",
        editing: editMode,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/");
    });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedDescription = req.body.description;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;

  Product.update(
    {
      title: updatedTitle,
      description: updatedDescription,
      imageUrl: updatedImageUrl,
      price: updatedPrice,
    },
    {
      where: { id: productId },
    }
  )
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.destroy({
    where: { id: productId },
  })
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        docTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
