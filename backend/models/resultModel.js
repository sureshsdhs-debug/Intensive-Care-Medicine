const mongoose = require('mongoose');

const createSchema = new mongoose.Schema({
    studentid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'students',
        required:true
    },

    questionid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'questions',
        required:true
    },

    selectedoption:{
        type:String
    },

    correctanswer:{
        type: String,
        default:null
    }

}, { timestamps: true })
 
const resultSchema = mongoose.model('results',createSchema);

module.exports = resultSchema;