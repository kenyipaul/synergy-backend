const mongoose = require('mongoose')

const conn = () => {

    mongoose.connect(process.env.MONGO_URI);
    mongoose.connection.once("open", () => console.log("Connected to MongoDB"))
    mongoose.connection.on('error', (er) => console.error(er))

}

module.exports = conn;