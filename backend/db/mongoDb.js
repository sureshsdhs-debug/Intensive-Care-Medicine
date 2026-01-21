const mongoose = require('mongoose');

const connectToMongo = () => {
    mongoose.connect("mongodb+srv://sureshsarkar2020:0ZOCiZ3QgaNY6TWW@cluster0.wx3zupi.mongodb.net/online-exam");
    console.log("DB Connected");   
}
module.exports = connectToMongo;