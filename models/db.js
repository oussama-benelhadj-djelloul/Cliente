const mongoose = require('mongoose');

const connect = async () => {
    try {
        //connect to db cloud*
        const con = await mongoose.connect(process.env.MONGO_URL);
        console.log('Mongo connect')
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = connect