const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs"); // Globalna konfiguracja expressa - w tym przypadku wybór używanego engine do templatek. pug/
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const httpControlers = require("./controllers/http");

app.use(bodyParser.urlencoded({ extended: true })); // Parsuje przesłane w requeście dane tak aby zwrócić dane w formularzu

app.use(express.static(path.join(__dirname, "public"))); // Umożliwia publiczny dostęp do wskazanego folderu, statyczne dane do odczytu przez użytkownika: css,js,obrazki,etc

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(httpControlers.get404);

app.listen(3000);
