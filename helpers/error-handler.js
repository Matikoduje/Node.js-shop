const errorHandler = (req, res, next, err) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  console.log(error);
  return next(error);
};

module.exports = errorHandler;
