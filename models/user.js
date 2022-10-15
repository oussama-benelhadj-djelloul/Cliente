const mongoose = require('mongoose')

var UsersSchema = new mongoose.Schema({
    email: {
        type: String,
        required : true
    },
    password: {
        type: String,
        required : true
    },
    type : {
        type: String,
        enum : ['user','brand']
    },
    createdAt: {
        type: String
    }
})


module.exports = mongoose.model('users', UsersSchema)