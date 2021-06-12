const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
//const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("5f53e998a034333cc0f6a3cf")
    .then((user) => {
      req.user = user;
      console.log(user.cart);
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://Robert:passwordSegura20@first-cluster.s2e70.mongodb.net/ecomerce?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((result) => {
    // const user = new User({
    //   name: "Robert Martz",
    //   email: "robert.laksee20@gmail.com",
    //   cart: {
    //     items: [
    //       {
    //         productId: "5f53c809cf4a9917d4514b7b",
    //         quantity: 1,
    //       },
    //     ],
    //   },
    // });
    // user.save();

    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
