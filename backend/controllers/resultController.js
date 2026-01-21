const resultModel = require("../models/resultModel");
const Question = require("../models/questionModel");
const { getIdFromToken } = require("../utils/generateToken");


exports.addResult = async (req, res) => {
    try {


        const tokenData = getIdFromToken(req, res);
        const studentid = tokenData?.userId || false;

        if (!studentid) {
            return res.status(201).send({
                message: "Invalid Authontication",
                success: false
            })
        }

        const {
            questionid,
            selectedoption,
            correctanswer
        } = req.body;


        if (!questionid || !selectedoption) {
            return res.status(201).send({
                message: "Select atleast one anwser",
                success: false,
                resp: req.body
            })
        }

        // 🔥 CHECK IF THIS QUESTION IS ALREADY ANSWERED BY THIS STUDENT
        const alreadyAnswered = await resultModel.findOne({
            studentid: studentid,
            questionid: questionid
        });


        if (alreadyAnswered) {
            return res.status(201).send({
                message: "You have already submitted the answer for this question.",
                success: false
            });
        }

        const newExam = new resultModel({
            studentid,
            questionid,
            selectedoption,
            correctanswer,
        });

        await newExam.save();

        // ✅ Update stats dynamically
        await Question.findByIdAndUpdate(
            questionid,
            {
                $inc: {
                    [`stats.${selectedoption}`]: 1,
                    totalResponses: 1
                }
            }
        );


        return res.status(200).send({
            message: "Result submited",
            success: true
        })

    } catch (error) {
        return res.status(201).send({
            message: error.message,
            success: false
        })
    }
}


exports.allResult = async (req, res) => {
    try {
        const tokenData = getIdFromToken(req, res);
        const studentId = tokenData.userId;
        const role = tokenData.role;

        if (!role) {
            const exam = await resultModel.find({ studentid: studentId }).populate('studentid').exec();
            return res.status(200).send({
                message: "Got all exam",
                success: true,
                exam: exam
            })
        } else {
            const exam = await resultModel.find().populate('studentid').exec();
            return res.status(200).send({
                message: "Got all exam",
                success: true,
                exam: exam
            })
        }



    } catch (error) {
        return res.status(201).send({
            message: error.message,
            success: false
        })
    }
}


exports.deleteResult = async (req, res) => {
    try {

        const id = req.params.id;

        if (!id) {
            return res.status(201).send({
                message: "No exam exist",
                success: false
            })
        }

        await resultModel.findByIdAndDelete(id)

        return res.status(200).send({
            message: "Exam deleted successfully",
            success: true
        })

    } catch (error) {
        return res.status(201).send({
            message: error.message,
            success: false
        })
    }
}


exports.editResult = async (req, res) => {
    try {

        const id = req.params.id;

        if (!id) {
            return res.status(201).send({
                message: "No data found",
                success: false
            })
        }

        const { studentid,
            questionid,
            selectedoption,
            totaltime,
            totalquestion,
            totalattempt,
            correctanswer,
            totalmarks,
            status } = req.body;

        if (!studentid || !questionid || !selectedoption || !totaltime || !totalquestion || !correctanswer || !totalattempt || !totalmarks) {
            const examData = await resultModel.findById(id);
            return res.status(201).send({
                message: "Exam Data found",
                success: false,
                examData: examData
            })
        }

        const newExam = { studentid, questionid, selectedoption, totaltime, totalquestion, totalattempt, correctanswer, totalmarks, status };

        await resultModel.findByIdAndUpdate(id, newExam)

        return res.status(200).send({
            message: "Exam upated successfully",
            success: true
        });

    } catch (error) {
        return res.status(201).send({
            message: error.message,
            success: false
        })
    }
}

exports.viewResult = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(201).send({
                message: "No data found",
                success: false

            })
        }

        const exam = await resultModel.findById(id).populate('studentid').exec();
        return res.status(200).send({
            message: "Got Data",
            success: true,
            exam: exam

        })

    } catch (error) {
        return res.status(201).send({
            message: error.message,
            success: false
        })
    }
}



exports.getThisUserResult = async (req, res) => {

    try {
        const tokenData = getIdFromToken(req, res);
        const studentId = tokenData.userId;

        // const resultData = await resultModel.find({ studentid: studentId }).populate('questionid').exec();
        const resultData = await resultModel.find({ studentid: studentId });
        return res.status(200).send({
            message: "Got your result",
            success: true,
            resultData: resultData
        })

    } catch (error) {
        return res.status(201).send({
            message: error.message,
            success: false
        })
    }
}
