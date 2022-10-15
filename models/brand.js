const mongoose = require('mongoose')

var BrandsSchema = new mongoose.Schema({
    email: {
        type: String,
        required : true
    },
    password: {
        type: String,
        required : true
    },
    name : {
        type: String,
        required : true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('brands', BrandsSchema)