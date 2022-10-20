const mongoose = require('mongoose')

var FeedbacksSchema = new mongoose.Schema({
    title: {
        type: String,
        required : true,
        unique: true
    },
    description: {
        type: String,
        required : true
    },
    from: {
        type: String,
        required : true
        
    },
    response: {
        type: String
    },
    important : {
        type: String,
        enum : ['nice-to-have','important','critical'],
        required : true
    },
    to: {
        type: String,
        required : true
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