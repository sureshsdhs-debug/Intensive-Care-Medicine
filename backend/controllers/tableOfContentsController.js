const tableOfContentsModel = require("../models/tableOfContentsModel")
const { getIdFromToken } = require("../utils/generateToken");

exports.addTableOfContents = async (req, res) => {
    try {
        const  {title,ordering,pagenumber,status}  = req.body;  

        if (!title) {
            return res.status(201).send({
                message: "Fill the field", 
                success: false,
                res:title
            })
        }
 
        // const tableOfContents = await tableOfContentsModel.find({ tableOfContentsName });

        // if (tableOfContents != "") {
            // return res.status(201).send({
            //     message: "This Table of Contents already exits",
            //     success: false,
            //     tableOfContentsName:data
            // })
        // }
        const newTableOfContents = new tableOfContentsModel({
            title,
            ordering,
            pagenumber,
            status
        })

        await newTableOfContents.save();

        return res.status(200).send({
            message: "Table of Contents successfully added",
            success: true
        })

    } catch (error) {
        return res.status(201).send({
            message: error.message,
            success: false
        })
    }
}


exports.allTableOfContents = async (req, res) => {
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
 
        let tableofcontents;
        if (userRole != 1) {
              tableofcontents = await tableOfContentsModel.find({ status: 1 });
            } else {
              tableofcontents = await tableOfContentsModel.find({});
            } 

        return res.status(200).send({
            message: "Got all Table of Contents",
            success: true,
            tableofcontents: tableofcontents
        })

    } catch (error) {
        return res.status(201).send({
            message: error.message,
            success: false
        })
    }
}


exports.deleteTableOfContents = async (req, res) => {
    try {

        const id = req.params.id;

        if (!id) {
            return res.status(201).send({
                message: "No Table of Contents exist",
                success: false
            })
        }

        await tableOfContentsModel.findByIdAndDelete(id)

        return res.status(200).send({
            message: "Table of Contents deleted successfully",
            success: true
        })

    } catch (error) {
        return res.status(201).send({
            message: error.message,
            success: false
        })
    }
}


exports.editTableOfContents = async (req, res) => {
    try {

        const id = req.params.id;

        if (!id) {
            return res.status(201).send({
                message: "No data found",
                success: false
            })
        }

        const { title,ordering,pagenumber,status } = req.body;

        if (!title) {
            const tableofcontents = await tableOfContentsModel.findById(id);
            return res.status(201).send({
                message: "Got the Table of Contents data",
                success: true,
                tableofcontents: tableofcontents
            })
        }

        // const oldTableOfContents = await tableOfContentsModel.findOne({ title, _id: { $ne: id } });
        // if (oldTableOfContents) {
        //     return res.status(201).send({
        //         message: "This Table of Contents already exist",
        //         success: false
        //     })
        // }

        const newTableOfContents = { title,ordering,pagenumber,status };

        await tableOfContentsModel.findByIdAndUpdate(id, newTableOfContents)

        return res.status(200).send({
            message: "Table of Contents upated successfully",
            success: true,
            newTableOfContents: newTableOfContents
        });

    } catch (error) {
        return res.status(201).send({
            message: error.message,
            success: false
        })
    }
}