const path = require("path");

const express = require("express");
const session = require("express-session");

const MONGO_URI = require("./configuration/database-env-setup");
const DEV_ENV_SETUP = require("./configuration/dev-env-setup");

const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);

const bodyParser = require("body-parser");
const csrf = require("csurf");
const csrfProtection = csrf();
const flash = require("connect-flash");
const app = express();

const sessionStore = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});

const { multer, upload } = require("./middleware/upload");

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/public/files/images",
  express.static(path.join(__dirname, "public/files/images"))
);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: DEV_ENV_SETUP.sessionHash,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use(upload.single("productImage"));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.errorMessages = [];
  res.locals.informationMessages = [];

  next();
});

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorsController = require("./controllers/error");

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorsController.get404);
/** Error middleware. */
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    throw err;
  });
