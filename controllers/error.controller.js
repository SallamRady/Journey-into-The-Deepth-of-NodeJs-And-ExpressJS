const path = require("path");

module.exports.get404 = (req, res, next) => {
  let context = { pageTitle: "404|Not Found" };
  res
    .status(404)
    .render(path.join(__dirname, "..", "views", "404.ejs"), context);
};

