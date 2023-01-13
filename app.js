/**         Node.js             **/
/*
// import our libraries.
const http = require("http");
const fs = require('fs');
const roues = require('./routes');

//create server
const server = http.createServer(roues);

//lisnt to comming requests
server.listen(3000);
*/

/***        Express.js              ***/
//import our libraries/packages
const express = require("express");
const path = require("path");
const ClientRoutes = require("./routes/client.route");
const AdminRoutes = require("./routes/admin.route");
const AuthRoutes = require("./routes/auth.route");
const ErrorController = require("./controllers/error.controller");
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);
//prevent CSRF
const csrf = require("csurf");
const flash = require("connect-flash");
//import our guards
const isAuth = require("./guards/IsAuth.guard");

/*//-> Using during Sequelize <-//
 * const sequelize = require("./util/database");
 * const Product = require("./models/products.model");
 * const User = require("./models/users.model");
 * const Cart = require("./models/card.model");
 * const CartItem = require("./models/cartItem.model");
 * const Order = require('./models/order.model');
 * const OrderItem = require('./models/orderItem.model');
 */
/*//-> Using during Mongodb <-//
const mongoConnect = require("./util/database").mongoConect;
const User = require("./models/users.model");
*/

const mongoose = require("mongoose");
const User = require("./models/users.model");
const multer = require("multer");
const store = new MongodbStore({
  uri: "mongodb://localhost:27017/E-Shop",
  collection: "sessions",
});
const csrfProtection = csrf();
//create application && application configration.
const app = express();
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "life is hard man",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
const fileStorage = multer.diskStorage({
  destination:(req,file,cb)=>{cb(null,'images')},
  filename:(req,file,cb)=>{
      cb(null,Date.now().toString()+'_'+file.originalname);
  }
});
const fileFilter = (req,file,cb)=>{
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
      cb(null,true);
  }else{
      cb(null,false);
  }
}
// app.use(csrfProtection);
app.use(flash());
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single("image"));
//SendGrid API Key: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

//declaration of our variables
const port = process.env.PORT | 3000;

//middlewares
app.use((req, res, next) => {
  // res.locals.csrfToken = req.csrfToken();
  res.locals.isLogged = req.session.isLogged;
  res.locals.path = req.url;
  next();
});
//register user
app.use((req, res, next) => {
  /*//-> Using during Sequelize <-// 
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log("error in register user");
    });
  */

  /*//-> Using during Mongodb <-//
  User.fetchOne("63afe60df8a07c03a4f7c9eb")
  .then((user) => {
    req.user = new User(user._id,user.name,user.email,user.cart);
    next();
  })
  .catch((err) => {
    console.log("error in register user");
  });
  */

  User.findById(req.session.user?._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log("error in register user");
    });
});

// Routes
app.use(ClientRoutes);
app.use(AuthRoutes);
app.use("/admin", isAuth, AdminRoutes);

//Error routes
app.use("/500", (error, req, res, next) => {
  let context = { pageTitle: "500|Error" };
  res
    .status(404)
    .render(path.join(__dirname, "views", "500.ejs"), context);
});

app.use(ErrorController.get404);

/*//-> Using during Sequelize <-//
//models relations
//User(1)<->Product(M)
Product.belongsTo(User, { constrains: true, onDelete: "CASCADE" });
User.hasMany(Product);
//User(1)<->Cart(1)
User.hasOne(Cart);
Cart.belongsTo(User);
//Product(M)<------[Bridge:CartItem]------>Cart(N)
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
//User(1) <-----> Order(M)
Order.belongsTo(User);
User.hasMany(Order);
//Order(M)<---[Bridge:OrderItem]--->OrderItem(N)
Order.belongsToMany(Product,{through:OrderItem});
Product.belongsToMany(Order,{through:OrderItem});

sequelize
  // .sync({force:true})
  .sync()
  .then(() => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({
        name: "Sallam",
        email: "sallam@gmail.com",
      });
    }
    return user;
  })
  .then((user) => {
    user.createCart();
  })
  .then(() => {
    // console.log(results);
    app.listen(port);
  })
  .catch((err) => {
    console.log("error in connection :", err);
  });

 */

/* //->Using during Mongodb<-//
mongoConnect((client) => {
  app.listen(port);
});
*/

mongoose
  .connect("mongodb://localhost:27017/E-Shop")
  .then(() => {
    console.log("connected!");
    app.listen(port);
  })
  .catch((err) => console.log("error in db connecion :", err));