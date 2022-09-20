const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const httpControlers = require("./controllers/http");
const dbConfiguration = require("./configuration/database-env-setup");

const User = require("./models/user");

app.use((req, res, next) => {
  User.findById("63289f9bc9d7bb6d7c649269")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      throw err;
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(httpControlers.get404);

mongoose
  .connect(dbConfiguration)
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "admin",
          email: "admin@test.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });

    app.listen(3000);
  })
  .catch((err) => {
    throw err;
  });
