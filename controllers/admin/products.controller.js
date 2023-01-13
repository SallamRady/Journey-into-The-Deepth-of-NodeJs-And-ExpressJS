const path = require("path");
const Product = require("../../models/products.model");
const { validationResult } = require("express-validator/check");
const { deleteFile } = require("../../util/storage");
/**
 * Add Product [Handle Request method].
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.addProduct = (req, res, next) => {
  let context = { pageTitle: "Add Prodeuct", errors: req.flash("errors") };
  res.render(
    path.join(__dirname, "..", "..", "views", "admin", "addProduct.ejs"),
    context
  );
};

/**
 * Save Product method.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.saveProduct = (req, res, next) => {
  let image = req.file;
  let { title, price, description } = req.body;
  let errors = validationResult(req).array();

  if (errors.length > 0) {
    let errorMsg = [];
    for (const error of errors) {
      errorMsg.push(error.msg);
    }
    req.flash("errors", errorMsg);
    return res.status(422).redirect("/admin/addProduct");
  }
  let product = new Product({
    title,
    price,
    image:image.filename,
    description,
    userId: req.user._id,
  });
  product
    .save()
    .then(() => {
      res.redirect("/admin/showProducts");
    })
    .catch((err) => {
      console.log("error in create product :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      // next(error);
    });
};

/**
 * Show All Products method.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.showProducts = (req, res, next) => {
  Product.find({ userId: req.session.user._id })
    .populate("userId")
    .then((products) => {
      let context = {
        pageTitle: "Dashboard Page",
        products: products,
        editable: true,
      };
      res.render(
        path.join(__dirname, "..", "..", "views", "admin", "listProducts.ejs"),
        context
      );
    })
    .catch((err) => {
      console.log("error in fetch products data :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      // next(error);
    });
};

/**
 * (get)Edit Product method.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getEditProduct = (req, res, next) => {
  let { id } = req.body;

  Product.findById(id)
    .then((product) => {
      if (!product || product.userId.toString() !== req.session.userId) {
        return res.redirect("/admin/showProducts");
      }
      let context = {
        pageTitle: "Edit Product",
        product: product,
      };
      res.render(
        path.join(__dirname, "..", "..", "views", "admin", "editProduct.ejs"),
        context
      );
    })
    .catch((err) => {
      console.log("error in find single product :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      // next(error);
    });
};

/**
 * (Post)Edit Product method.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.updateProduct = (req, res, next) => {
  let { id, title, price, description } = req.body;
  let image = req.file;
  Product.findById(id)
    .then((product) => {
      if (!product || product.userId.toString() !== req.session.userId) {
        return res.redirect("/admin/showProducts");
      }
      if (image) {
        deleteFile(path.join(__dirname, "..", "..", "images",product.image));
        product.image =image.filename;
      }
      product.title = title;
      product.price = price;
      product.description = description;
      return product.save();
    })
    .then((product) => {
      let context = {
        pageTitle: "Edit Product",
        product: product,
      };
      res.render(
        path.join(__dirname, "..", "..", "views", "admin", "editProduct.ejs"),
        context
      );
    })
    .catch((err) => {
      console.log("error in update product :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      // next(error);
    });
};

/**
 * delete product method
 * @param {*} req reques object
 * @param {*} res response objec
 * @param {*} next method
 */
module.exports.deleteProduct = (req, res, next) => {
  let { id } = req.body;
  Product.findByIdAndRemove(id)
    .then((product) => {
      deleteFile(path.join(__dirname, "..", "..", "images",product.image));
      res.redirect("/admin/showProducts");
    })
    .catch((err) => {
      console.log("error in delete product :", err);
      let error = new Error(err);
      error.httpStatusCode = 500;
      // next(error);
    });
};
