const questionModel = require("../models/questionModel")

const fs = require('fs');
const path = require('path');
const { deleteUploadedFile } = require('../helpers/fileHelper');
const { getIdFromToken } = require("../utils/generateToken");
const cloudinary = require("../utils/cloudinary");


exports.addQuestion = async (req, res) => {
  try {
    const {
      questiontype,
      questiontext,
      option1,
      option2,
      option3,
      option4,
      correctoption,
      status,
    } = req.body;

    // 1️⃣ Validate required fields
    if (
      !questiontype ||
      !questiontext ||
      !option1 ||
      !option2 ||
      !option3 ||
      !option4 ||
      !correctoption
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // 2️⃣ Duplicate check
    const existing = await questionModel.findOne({
      questiontext: questiontext.trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This question already exists",
      });
    }

    // 3️⃣ Handle image upload (Cloudinary)
    let image = "";
    let image_public_id = "";

    if (req.files?.image?.[0]) {
      image = req.files.image[0].path;          // Cloudinary URL
      image_public_id = req.files.image[0].filename; // Public ID
    }

    // 4️⃣ Handle answer audio (optional)
    let answeraudio = "";
    let audio_public_id = "";

    if (req.files?.answeraudio?.[0]) {
      answeraudio = req.files.answeraudio[0].path;
      audio_public_id = req.files.answeraudio[0].filename;
    }

    // 5️⃣ Create question
    const newQuestion = new questionModel({
      questiontype,
      questiontext: questiontext.trim(),
      option1,
      option2,
      option3,
      option4,
      correctoption,
      image,
      image_public_id,
      answeraudio,
      audio_public_id,
      status: status ? Number(status) : 1,
    });

    await newQuestion.save();

    return res.status(201).json({
      success: true,
      message: "Question successfully added",
      newQuestion,
    });
  } catch (error) {
    console.error("addQuestion error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};




exports.allQuestion = async (req, res) => {
  try {
    const tokenData = getIdFromToken(req, res);
    const userRole = tokenData?.role || null;
    const studentId = tokenData.userId || false;

    if (!studentId) {
      return res.status(200).send({
        message: "Invalid User",
        success: false
      })
    }

    let question;
    if (userRole != 1) {
      question = await questionModel.find({ status: 1 });
    } else {
      question = await questionModel.find({});
    }

    return res.status(200).send({
      message: "Got all Questions",
      success: true,
      question: question
    })

  } catch (error) {
    return res.status(201).send({
      message: error.message,
      success: false
    })
  }
}




exports.editQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await questionModel.findById(id);
    if (!question)
      return res.status(404).json({ success: false, message: "Question not found" });

    const updateData = { ...req.body };

    // IMAGE
    if (req.files?.image?.[0]) {
      if (question.image_public_id) {
        await cloudinary.uploader.destroy(question.image_public_id);
      }

      updateData.image = req.files.image[0].path;
      updateData.image_public_id = req.files.image[0].filename;
    }

    // AUDIO
    if (req.files?.answeraudio?.[0]) {
      if (question.audio_public_id) {
        await cloudinary.uploader.destroy(question.audio_public_id, {
          resource_type: "video",
        });
      }

      updateData.answeraudio = req.files.answeraudio[0].path;
      updateData.audio_public_id = req.files.answeraudio[0].filename;
    }

    const updated = await questionModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




exports.viewQuestion = async (req, res) => {
  try {

    const id = req.params.id;

    if (!id) {
      return res.status(201).send({
        message: "No data found",
        success: false
      })
    }


    const question = await questionModel.findById(id).populate('courseid subjectid').exec();;
    if (question) {
      return res.status(201).send({
        message: "Found the question data",
        success: true,
        question: question
      })
    }


  } catch (error) {
    return res.status(201).send({
      message: error.message,
      success: false
    })
  }
}






exports.deleteQuestion = async (req, res) => {
  try {

    const id = req.params.id;

    if (!id) {
      return res.status(201).send({
        message: "No question exist",
        success: false
      })
    }



    // Fetch question first
    const question = await questionModel.findById(id);
    if (!question) {
      return res.status(404).send({
        message: "Question not found",
        success: false,
      });
    }

    // Delete image if exists
    if (question.image) {
      deleteUploadedFile(question.image);
    }

    // Delete audio if exists
    if (question.answeraudio) {
      deleteUploadedFile(question.answeraudio);
    }



    await questionModel.findByIdAndDelete(id);

    return res.status(200).send({
      message: "Question deleted successfully",
      success: true
    })

  } catch (error) {
    return res.status(201).send({
      message: error.message,
      success: false
    })
  }
}

