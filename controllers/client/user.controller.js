const path = require("path");
const fs = require("fs");
const Product = require("../../models/products.model");
const Order = require("../../models/order.model");
const Card = require("../../models/card.model");
const CardItem = require("../../models/cartItem.model");
const stripe = require("stripe")(
  "sk_test_51Klc7QIx0ZhOngyzxhAZMfF6pR3ey9pI4sit2KlGwUOw7jB6gg9k2u5mIfnSaNRFYswaxby5F4ktD9rWcPd43ZEf00BspazeIt"
);

const ITEMS_PER_PAGE = 4;
/**
 * Home Page Handle Request method.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.homePage = (req, res, next) => {
  let page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((docsCount) => {
      totalItems = docsCount;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      let context = {
        pageTitle: "Home Page",
        products: products,
        editable: false,
        currentPage: page,
        hasNext: page * ITEMS_PER_PAGE < totalItems,
        hasPrevoious: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      };
      res.render(
        path.join(__dirname, "..", "..", "views", "client", "home.ejs"),
        context
      );
    })
    .catch((err) => {
      console.log("error during DB connection");
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

/**
 * Handle Product Details Request
 * @param {*} req reques objec
 * @param {*} res response object
 * @param {*} next method
 */
module.exports.productDetail = (req, res, next) => {
  let { id } = req.params;

  Product.findById(id)
    .then((product) => {
      let context = {
        pageTitle: "Product Details",
        product: product,
      };
      res.render(
        path.join(
          __dirname,
          "..",
          "..",
          "views",
          "client",
          "productDetails.ejs"
        ),
        context
      );
    })
    .catch((err) => {
      console.log("error in find single product :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

//Cart Operaions
module.exports.card = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      let context = {
        pageTitle: "Card",
        products: user.cart.items,
      };
      res.render(
        path.join(__dirname, "..", "..", "views", "client", "card.ejs"),
        context
      );
    })
    .catch((err) => {
      console.log("error in get cart items", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.addToCard = (req, res, next) => {
  req.user
    .addToCart(req.body.id)
    .then(() => res.redirect("/"))
    .catch((err) => {
      console.log("error in add product to card :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.deleteCardItem = (req, res, next) => {
  let { id } = req.body;
  req.user
    .deleteFromCart(id)
    .then(() => res.redirect("/card"))
    .catch((err) => {
      console.log("error in delete card item :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.decreaseCardItem = (req, res, next) => {
  let { id } = req.body;
  req.user
    .decreaseCartItem(id)
    .then(() => res.redirect("/card"))
    .catch((err) => {
      console.log("error in remove only one item from card:", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.increaseCarItem = (req, res, next) => {
  req.user
    .addToCart(req.body.id)
    .then(() => res.redirect("/card"))
    .catch((err) => {
      console.log("error in add product to card :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.checkoutSuccess = (req, res, next) => {
  let order = new Order({
    userId: req.user._id,
    items: req.user.cart.items,
  });
  order
    .save()
    .then((order) => {
      req.user.cart.items = [];
      return req.user.save();
    })
    .then(() => res.redirect("/orders"))
    .catch((err) => {
      console.log("error in checkout :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.getCheckout = (req, res, next) => {
  let totalSum = 0,products;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      totalSum = 0;
      products = user.cart.items;
      user.cart.items.forEach((element) => {
        totalSum += element.quantity * element.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: user.cart.items.map((pro) => {
          return {
            name: pro.productId.title,
            description: pro.productId.description,
            amount: pro.productId.price * 100,
            currency: "usd",
            quantity: pro.quantity,
          };
        }),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      let context = {
        pageTitle: "Checkout",
        products: products,
        totalSum: totalSum,
        sessionId: session.id,
      };
      res.render(
        path.join(__dirname, "..", "..", "views", "client", "checkout.ejs"),
        context
      );
    })
    .catch((err) => {
      console.log("error in get cart items", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.Orders = (req, res, next) => {
  Order.find({ userId: req.user._id })
    .populate("items.productId")
    .then((orders) => {
      let context = {
        pageTitle: "Orders",
        orders: orders,
      };
      console.log(orders.items);

      res.render(
        path.join(__dirname, "..", "..", "views", "client", "orders.ejs"),
        context
      );
    });
};

module.exports.getOrderInvoice = (req, res, next) => {
  let { orderId } = req.params;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("There is no order with this ID"));
      }
      if (order.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized!"));
      }
      let fileName = "invoice-" + orderId + ".pdf";
      /*//->good way to download smoll files<-//
      fs.readFile(
        path.join(__dirname, "..", "..", "data", "orders", fileName),
        (err, data) => {
          if (err) {
            return next(err);
          }
          res.setHeader("Content-Type", "applicaion/pdf");
          res.setHeader(
            "Content-Disposition",
            'attachment;filename="' + fileName + '"'
          );
          res.send(data);
        }
      );
      */

      //->good way to download smoll/larg files<-//
      const file = fs.createReadStream(
        path.join(__dirname, "..", "..", "data", "orders", fileName)
      );
      res.setHeader("Content-Type", "applicaion/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment;filename="' + fileName + '"'
      );
      file.pipe(res);
    })
    .catch((err) => {
      console.log("error in get order invoice :", err);
      next(err);
    });
};
