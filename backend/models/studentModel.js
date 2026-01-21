const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  deviceType: {
    type: String,
    enum: ["mobile", "desktop"],
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
});

const createSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobile:{
        type:Number,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required:true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'], // Limit options to Male, Female, Other
        required: true,
      },
    status: 
    {
       type: Number,
       default:1,
       enum: [1,2]  // Assuming 2 is inactive, 1 is active
    },
      // 🔥 NEW FIELD
    activeSessions: [sessionSchema],

}, { timestamps: true });

const studentSchema = mongoose.model('students',createSchema)
module.exports =studentSchema;

