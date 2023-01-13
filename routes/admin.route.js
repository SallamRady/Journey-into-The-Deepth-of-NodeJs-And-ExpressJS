//import our libraries/packages
const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/admin/products.controller");
const { check } = require("express-validator/check");
// const rootDir = require('./util/root.path');

//-> Create Product <-//
//add product page
router.get("/addProduct", ProductController.addProduct);
//save Produc
router.post(
  "/saveProduct",
  check("title","Title must have at least 2 chars").isLength({min:2}),
  check("price", "Invalid Price").isDecimal(),
  check("description", "Description must have at least 10 chars").isLength({
    min: 10,
  }),
  ProductController.saveProduct
);

//show products page
router.get("/showProducts", ProductController.showProducts);

//edit Product
router.post("/editProduct", ProductController.getEditProduct);
router.post("/updateProduct", ProductController.updateProduct);

//delete product
router.post("/deleteProduct", ProductController.deleteProduct);

module.exports = router;
