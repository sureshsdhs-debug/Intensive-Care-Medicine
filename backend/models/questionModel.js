const mongoose = require("mongoose");

const createSchema = new mongoose.Schema(
  {
    subjectid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subjects",
    },

    courseid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
    },

    questiontext: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    questiontype: {
      type: String,
      enum: ["Single Question", "Multiple Question"],
      default: "Single Question",
      required: true,
    },

    option1: { type: String, required: true },
    option2: { type: String, required: true },
    option3: { type: String, required: true },
    option4: { type: String, required: true },
    option5: { type: String, default: "" },
    option6: { type: String, default: "" },
    option7: { type: String, default: "" },
    option8: { type: String, default: "" },
    option9: { type: String, default: "" }, 

    correctoption: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one correct option is required",
      },
    },
  questionremark: {
      type: String,
      default: "",
    },

    answerreason: {
      type: String,
      default: "",
    },

    stats: {
      option1: { type: Number, default: 0 },
      option2: { type: Number, default: 0 },
      option3: { type: Number, default: 0 },
      option4: { type: Number, default: 0 },
      option5: { type: Number, default: 0 },
      option6: { type: Number, default: 0 },
      option7: { type: Number, default: 0 },
      option8: { type: Number, default: 0 },
      option9: { type: Number, default: 0 },
    },

    totalResponses: {
      type: Number,
      default: 0,
    },

    status: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },

    ordering: {
      type: Number,
      required: [true, "Ordering is required"],
      min: [1, "Ordering must be greater than 0"],
    },

    image: { type: String, default: "" },
    image_public_id: { type: String, default: "" },
    answeraudio: { type: String, default: "" },
    audio_public_id: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ UNIQUE INDEX MUST BE ON SCHEMA
// createSchema.index({ ordering: 1 }, { unique: true });

module.exports = mongoose.model("questions", createSchema);