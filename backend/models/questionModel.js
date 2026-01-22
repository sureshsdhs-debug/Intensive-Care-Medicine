const mongoose = require('mongoose');

const createSchema = new mongoose.Schema({
    subjectid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subjects',
        // required: [true, 'Subjects ID is required']
    },
    courseid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses',
        //    required:[true,'Course Id is required']
    },
    questiontext: {
        type: String,
        required: true,
        unique: true
    },
    questiontype: {
        type: String,
        default: "Single Question",
        required: true,
    },
    option1: {
        type: String,
        required: true
    },
    option2: {
        type: String,
        required: true
    },
    option3: {
        type: String,
        required: true
    },
    option4: {
        type: String,
        required: true
    },
    correctoption: {
        type: String,
        required: true
    },
    stats: {
        option1: { type: Number, default: 0 },
        option2: { type: Number, default: 0 },
        option3: { type: Number, default: 0 },
        option4: { type: Number, default: 0 },
    },

    totalResponses: {
        type: Number,
        default: 0
    },
    status:
    {
        type: Number,
        default: 1,
        enum: [1, 2]  // Assuming 2 is inactive, 1 is active
    },
    image: { type: String, default: "" },
    image_public_id: { type: String, default: "" },
    answeraudio: { type: String, default: "" },
    audio_public_id: { type: String, default: "" },
}, { timestamps: true });




const questionSchema = mongoose.model('questions', createSchema)
module.exports = questionSchema;

