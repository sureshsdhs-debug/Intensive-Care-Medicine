const questionModel = require("../models/questionModel")

const fs = require('fs');
const path = require('path');
const { deleteUploadedFile } = require('../helpers/fileHelper');
const { getIdFromToken } = require("../utils/generateToken");

exports.addQuestion = async (req, res) => {
  try {
    // read fields from body
    const {
      questiontype,
      questiontext,
      option1,
      option2,
      option3,
      option4,
      correctoption,
      status
    } = req.body;




    // validate required fields
    if (!questiontype || !questiontext || !option1 || !option2 || !option3 || !option4 || !correctoption) {
      return res.status(400).send({
        message: "Please fill all required fields",
        success: false
      });
    }

    // duplicate check (use findOne and trim for safety)
    const existing = await questionModel.findOne({ questiontext: questiontext.trim() });
    if (existing) {
      return res.status(409).send({
        message: "This question already exists",
        success: false
      });
    }

    // Build image URL if file uploaded by multer (routes must use upload.single('image'))
    let imageUrl = "";
    if (req.file && req.file.filename) {
      const host = req.protocol + '://' + req.get('host'); // e.g. http://localhost:5000
      // imageUrl = `${host}/uploads/${req.file.filename}`;
      imageUrl = `uploads/${req.file.filename}`;
    }

    // create question
    const newQuestion = new questionModel({
      questiontype,
      questiontext: questiontext.trim(),
      option1,
      option2,
      option3,
      option4,
      correctoption,
      image: imageUrl,
      status: status ? Number(status) : 1
    });

    await newQuestion.save();

    return res.status(201).send({
      message: "Question successfully added",
      success: true,
      newQuestion
    });

  } catch (error) {
    console.error('addQuestion error:', error);

    // Example: handle multer file-size/type errors (they might come here)
    const msg = error.message || "Server error";
    return res.status(500).send({
      message: msg,
      success: false
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
    const id = req.params.id;
    if (!id) return res.status(400).send({ message: "No id provided", success: false });

    // Fetch existing question
    const question = await questionModel.findById(id);
    if (!question) return res.status(404).send({ message: "Question not found", success: false });

    // Fields from body
    const {
      questiontype,
      questiontext,
      option1,
      option2,
      option3,
      option4,
      correctoption,
      status
    } = req.body;

    // If client only requested the current data (some of your flows do this), return it
    if (
      !questiontype ||
      !questiontext ||
      !option1 ||
      !option2 ||
      !option3 ||
      !option4 ||
      !correctoption ||
      typeof status === 'undefined'
    ) {
      return res.status(200).send({ message: "Got the question data", success: true, question });
    }

    // Duplicate check excluding current id
    const duplicate = await questionModel.findOne({
      questiontext: questiontext.trim(),
      _id: { $ne: id }
    });
    if (duplicate) return res.status(409).send({ message: "This question already exists", success: false });

    // Prepare update object
    const updateData = {
      questiontype,
      questiontext: questiontext.trim(),
      option1,
      option2,
      option3,
      option4,
      correctoption,
      status: Number(status)
    };

    // Handle image
    if (req.files && req.files.image && req.files.image.length > 0) {
      try {
        if (question.image) {
          deleteUploadedFile(question.image);
        }
      } catch (delErr) {
        console.warn('Error deleting previous image (ignored):', delErr && delErr.message ? delErr.message : delErr);
      }
      // store relative path (same pattern you used)
      updateData.image = `uploads/${req.files.image[0].filename}`;
    }

    // Handle answeraudio (NEW)
    if (req.files && req.files.answeraudio && req.files.answeraudio.length > 0) {
      try {
        if (question.answeraudio) {
          deleteUploadedFile(question.answeraudio);
        }
      } catch (delErr) {
        console.warn('Error deleting previous audio (ignored):', delErr && delErr.message ? delErr.message : delErr);
      }
      updateData.answeraudio = `uploads/${req.files.answeraudio[0].filename}`;
    }


    // Update and return the new document
    const updated = await questionModel.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).send({
      message: "Question updated successfully",
      success: true,
      question: updated
    });
  } catch (error) {
    console.error('editQuestion error:', error);
    return res.status(500).send({
      message: error.message || "Server error",
      success: false
    });
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

