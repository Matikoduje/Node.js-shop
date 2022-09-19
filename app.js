const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const httpControlers = require("./controllers/http");

const mongoConnect = require("./helpers/database").mongoConnect;
const User = require("./models/user");

app.use((req, res, next) => {
  User.findById("631c314648d8c4639f3ef809")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => {
      throw err;
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(httpControlers.get404);

mongoConnect(() => {
  app.listen(3000);
});
