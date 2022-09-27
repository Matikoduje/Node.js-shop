const ITEMS_PER_PAGE = 3;
const Product = require("../models/product");
const errorHandler = require("../helpers/error-handler");

module.exports = (req, res, next) => {
  const page = +req.query.page || 1;

  Product.countDocuments()
    .then((productsCount) => {
      res.locals.totalProducts = productsCount;
      res.locals.itemsPerPage = ITEMS_PER_PAGE;
      res.locals.hasNextPage = ITEMS_PER_PAGE * page < productsCount;
      res.locals.hasPreviousPage = page > 1;
      res.locals.currentPage = page;
      res.locals.nextPage = page + 1;
      res.locals.previousPage = page - 1;
      res.locals.lastPage = Math.ceil(productsCount / ITEMS_PER_PAGE);
      next();
    })
    .catch((err) => next());
};
