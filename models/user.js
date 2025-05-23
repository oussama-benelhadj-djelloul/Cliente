const mongoose = require('mongoose')

var UsersSchema = new mongoose.Schema({
    email: {
        type: String,
        required : true,
        unique: true
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
        type: String,
        default: Date.now
    }
})


module.exports = mongoose.model('users', UsersSchema)