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

       selectedoption: {
      type: [String], // e.g. ["option2"] OR ["option1","option3"]
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "At least one option must be selected",
      },
    },

    correctanswer:{
        type: [String],
        default: []
    }

}, { timestamps: true })
 
const resultSchema = mongoose.model('results',createSchema);

module.exports = resultSchema;