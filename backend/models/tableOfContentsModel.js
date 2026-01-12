const mongoose = require('mongoose')

const createSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true, 
    },
    pagenumber:{
        type:Number,
        required:true, 
    },
    ordering:{
        type:Number,
        required:true, 
    },
    status:{
        type:Number,
        default:1,
        enum: [1,2] 
    }
},{timeseries:true});

const tableOfContentsSchema = mongoose.model('tableofcontents',createSchema);

module.exports = tableOfContentsSchema;