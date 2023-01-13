//import our libraries/packages
const express = require("express");
const router = express.Router();
const ClientController = require("../controllers/client/user.controller");
const isAuth = require("../guards/IsAuth.guard");
// const rootDir = require('../util/root.path');

//home page
router.get("/", ClientController.homePage);

//product details page.
router.get("/product/:id", ClientController.productDetail);

//display card items
router.get("/card", isAuth, ClientController.card);

//add to card
router.post("/card", isAuth, ClientController.addToCard);

//delete one from card
router.post("/deleteCardItem", isAuth, ClientController.deleteCardItem);

//remove from card
router.post("/decreaseCardItem", isAuth, ClientController.decreaseCardItem);

//increaseCarItem
router.post("/increaseCarItem", isAuth, ClientController.increaseCarItem);

//checkout
router.post("/orderNow", isAuth, ClientController.getCheckout);

router.get("/checkout/success", isAuth, ClientController.checkoutSuccess);
router.get("/checkout/cancel", isAuth, ClientController.getCheckout);

//orders
router.get("/orders", isAuth, ClientController.Orders);


router.get("/orders/:orderId", isAuth, ClientController.getOrderInvoice);

module.exports = router;
