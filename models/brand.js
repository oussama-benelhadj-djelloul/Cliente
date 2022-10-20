const mongoose = require('mongoose')

var BrandsSchema = new mongoose.Schema({
    email: {
        type: String,
        required : true,
        unique: true
    },
    password: {
        type: String,
        required : true
    },
    name : {
        type: String,
        required : true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('brands', BrandsSchema)