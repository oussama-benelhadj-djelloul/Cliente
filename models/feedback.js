const mongoose = require('mongoose')

var FeedbacksSchema = new mongoose.Schema({
    title: {
        type: String,
        required : true
    },
    description: {
        type: String,
        required : true
    },
    from: {
        type: String
    },
    response: {
        type: String
    },
    important : {
        type: String,
        enum : ['nice-to-have','importrant','critical']
    },
    to: {
        type: String
    },
    vote: {
        type:  [String]
    },
    createdAt: {
        type: String,
        default: Date.now
    }
})


module.exports = mongoose.model('feedbacks', FeedbacksSchema)