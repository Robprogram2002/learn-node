const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const db = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((error) => {
      console.log(error);
    });
});

Product.belongsTo(User, {constraints: true ,onDelete: "CASCADE" });
User.hasMany(Product, {onDelete: "CASCADE"});
User.hasOne(Cart, {onDelete: "CASCADE"});
Cart.belongsTo(User, {onDelete: "CASCADE"});
Cart.belongsToMany(Product, { through: CartItem , onDelete: "CASCADE"});
Product.belongsToMany(Cart, { through: CartItem, onDelete: "CASCADE" });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});

//db.sync({force:true})
db.sync()
  .then((result) => {
    //console.log(result)

    User.findByPk(1).then((user) => {
        //user.createCart();
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
