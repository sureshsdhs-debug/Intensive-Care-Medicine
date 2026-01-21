const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const DB_URI = process.env.DB_URI
const connectToMongo = () => {
    mongoose.connect(DB_URI);

    console.log("DB Connected");   
}
module.exports = connectToMongo;