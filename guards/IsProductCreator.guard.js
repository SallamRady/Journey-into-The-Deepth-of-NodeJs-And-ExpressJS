const Product = require('../models/products.model');

module.exports = (req,res,next)=>{
    return Product.find({userId:req.session.user._id})
}