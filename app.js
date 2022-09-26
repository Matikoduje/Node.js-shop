const path = require("path");

const express = require("express");
const session = require("express-session");

const MONGO_URI = require("./configuration/database-env-setup");
const DEV_ENV_SETUP = require("./configuration/dev-env-setup");

const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const csrf = require("csurf");
const flash = require("connect-flash");
const app = express();

const sessionStore = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: DEV_ENV_SETUP.sessionHash,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use(csrfProtection);
app.use(flash());

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorsController = require("./controllers/error");

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.errorMessages = [];
  res.locals.informationMessages = [];
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorsController.get500);
app.use(errorsController.get404);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    throw err;
  });
