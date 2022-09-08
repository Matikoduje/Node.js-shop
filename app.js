const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const sequelize = require("./helpers/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const Order = require("./models/order");
const CartItem = require("./models/cart-item");
const OrderItem = require("./models/order-item");

const app = express();

app.set("view engine", "ejs"); // Globalna konfiguracja expressa - w tym przypadku wybór używanego engine do templatek. pug/
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const httpControlers = require("./controllers/http");
const { user } = require("./configuration/database");

app.use(bodyParser.urlencoded({ extended: true })); // Parsuje przesłane w requeście dane tak aby zwrócić dane w formularzu
app.use(express.static(path.join(__dirname, "public"))); // Umożliwia publiczny dostęp do wskazanego folderu, statyczne dane do odczytu przez użytkownika: css,js,obrazki,etc

// tworzony middleware jest na początku naszego łańcucha middlewarów po to by był dostępny w każdym z naszych middleware, należy dać next by się nie zatrzymywał na nim.
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(httpControlers.get404);

// Użytkownik jest nadrzędny wobec produktu. Po usunięciu użytkownika usuwane zostają wszystkie produkty przez niego utworzone
Product.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
});
User.hasMany(Product); // użytkownik może tworzyć wiele produktów
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem }); // koszyk może mieć wiele produktów, powiązanie jednak odbędzie się poprzez through w tabeli cart-item
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({
        name: "Admin",
        email: "admin@gmail.com",
      });
    }
    return Promise.resolve(user); // user.create zwraca promise, oba returny powinny zwracać promise więc poprzez Promise.resolve(user) generujemy promise. Nie jest to jednak kluczowe bo user jako obiekt przerwie po prostu łańcuch promise i kolejne then się nie wykona
  })
  .then((user) => {
    return user.getCart();
  })
  .then((cart) => {
    if (!cart) {
      return Cart.create({
        userId: 1,
      });
    }
    return Promise.resolve(cart);
  })
  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
